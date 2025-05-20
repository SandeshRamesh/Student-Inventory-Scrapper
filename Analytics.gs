
function teacherMetrics(){
  var url = "<>"; // Replace with your server's URL if deployed
  //sheet.getRange(statusCell[1],statusCell[0]).setValue("Checking Teacher Metrics...");
  for (let i = 0; i <= 3; i ++){
    //Logger.log(getEndOfWeek(i));
    var payload = {
      fields: {
        teacher: teacher,
        date: getEndOfWeek(i)
      }
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
            Authorization: `Bearer ${API_KEY}`
          },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      timeout: 10
    };

    try {
      let response;
        response = UrlFetchApp.fetch(url, options);

        let statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            response = UrlFetchApp.fetch(backup_dash_url, options);
            Logger.log(`❌ HTTP Error ${statusCode}: ${response.getContentText()}`);
            if (response.getResponseCode() !== 200){return null;}
            
        }
      // var response = UrlFetchApp.fetch(url, options);
      var jsonResponse = JSON.parse(response.getContentText());
      Logger.log(jsonResponse); // Logs the response in the Apps Script console

      const metrics = countLessonTypes(jsonResponse);
      teacherMetricSheet.getRange(i + 4, 2).setValue(getEndOfWeek(i));
      teacherMetricSheet.getRange(i + 4, 4).setValue(metrics.backStudentLessons);
      teacherMetricSheet.getRange(i + 4, 5).setValue(metrics.nsdLessons);
      teacherMetricSheet.getRange(i + 4, 6).setValue(metrics.groupClasses);
      teacherMetricSheet.getRange(i + 4, 7).setValue(metrics.parties);
      

      //return jsonResponse;
    } catch (error) {
      Logger.log("Error: " + error);
      //return null;
    }
  }
  }

function teacherAdds() {
  let validStudents = [];

  for (var i = starterRow; i <= lastRow; i++) {
    var pace = sheet.getRange(i, columns["Current Pace (3 mo)"]).getValue();
    var lsns = sheet.getRange(i, columns["PRI's this Week"]).getValue();
    var future = sheet.getRange(i, columns["Next SCH LSN"]).getValue();

    if (pace > lsns && lsns >= 1 && future !== "NFA") {
      var student = sheet.getRange(i, columns["Student"]).getValue();
      var cell = sheet.getRange(i, columns["Student"]);
      var richText = cell.getRichTextValue();
      var url = richText ? richText.getLinkUrl() : null;

      validStudents.push({
        diff: pace - lsns,
        name: student,
        url: url,
        pace: pace,
        lsns: lsns,
        preffered: sheet.getRange(i, columns["Preffered LSN Times"]).getValue(),
        buddy: sheet.getRange(i, columns["Buddy"]).getValue(),
        phone: sheet.getRange(i, columns["Cell Phone"]).getValue()
      });
    }
  }

  // Sort by biggest difference (pace - lsns)
  validStudents.sort((a, b) => b.diff - a.diff);

  // Limit to top 9 students
  const topStudents = validStudents.slice(0, 9);

  // Write to teacherMetricSheet starting at row 12
  let row = 12;
  topStudents.forEach(student => {
    teacherMetricSheet.getRange(row, 2).setFormula(`=HYPERLINK("${student.url}", "${student.name}")`);
    teacherMetricSheet.getRange(row, 3).setValue(student.pace);
    teacherMetricSheet.getRange(row, 4).setValue(student.lsns);
    teacherMetricSheet.getRange(row, 5).setValue(student.preffered);
    //teacherMetricSheet.getRange(row, 7).setValue(student.buddy);
    teacherMetricSheet.getRange(row, 8).setValue(student.phone);
    row++;
  });

  Logger.log(`✅ Wrote top ${topStudents.length} students to teacherMetricSheet`);
}




function countLessonTypes(inputData) {
  let backStudentLessons = 0;
  let nsdLessons = 0;
  let groupClasses = 0;
  let parties = 0;

  if (!inputData || !inputData.dashboard || !Array.isArray(inputData.dashboard)) {
    Logger.log("Invalid input data.");
    return { backStudentLessons, nsdLessons, groupClasses, parties };
  }

  inputData.dashboard.forEach(event => {
    const content = (event.content || "").toUpperCase();

    if (content.includes("(PRI1)")) {
      // Count NSD if "NSD" or "L1" to "L6" are in the content
      if (
        content.includes("NSD") ||
        content.match(/\bL[1-6]\b/) ||
        content.match(/L[1-6]\s*\(PRI1\)/)
      ) {
        nsdLessons++;
      } else {
        backStudentLessons++;
      }
    } else if (content.includes("GROUP CLASS (GRP1)")) {
      groupClasses++;
    } else if (content.includes("PARTY (PRT)")) {
      parties++;
    }
  });

  Logger.log({
    "Back Student Lessons": backStudentLessons,
    "New Student Department Lessons": nsdLessons,
    "Group Classes": groupClasses,
    "Parties": parties
  });

  return {
    backStudentLessons,
    nsdLessons,
    groupClasses,
    parties
  };
}

function countStudentLessonsFromDash(dashData, studentName) {
    if (!dashData) {
        Logger.log("⚠️ No dashboard data found or response format incorrect.");
        return 0;
    }

    // Extract last name from the provided student name
    const lastName = extractLastName(studentName);

    // Filter dashboard entries for the specific student based on last name
    const studentLessons = dashData.dashboard.filter(entry => {
      const regex = new RegExp(`\\b${lastName}\\b`, 'i'); // case-insensitive, whole word
      return regex.test(entry.content) && entry.content.includes("PRIVATE LESSON");
    });


    // Count the number of lessons found
    const lessonCount = studentLessons.length;

    Logger.log(`📊 Student: ${studentName} | Last Name: ${lastName} | Lessons Found: ${lessonCount}`);
    return lessonCount;
  }
