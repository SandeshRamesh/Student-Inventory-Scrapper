function fetchStudentData() {
    
    const dash_url = "http://34.55.162.215/dash"; // API endpoint

    var payload = {
      fields: {
        teacher: "All"
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

    // Send API request
    Logger.log(`🔹 Sending API Request for: ${dash_url}`);
    let dash_response;
    dash_response = UrlFetchApp.fetch(dash_url, options);

    let dash_statusCode = dash_response.getResponseCode();
    if (dash_statusCode !== 200) {
        dash_response = UrlFetchApp.fetch(backup_dash_url, options);
        Logger.log(`❌ HTTP Error ${dash_statusCode}: ${dash_response.getContentText()}`);
        if (dash_response.getResponseCode() !== 200){return null;}
        //SpreadsheetApp.getUi().alert("Using Backup Server: Please Click Ok :)");
        
    }

    // Parse API response
    const dash_jsonResponse = JSON.parse(dash_response.getContentText());

    teacherFreeBlocks = getFreeBlocksForTeacher();
    // Logger.log(teacherFreeBlocks);
    const free = formatRollingWeekFreeBlocks(teacherFreeBlocks);
    Logger.log("Teacher Free Blocks " + free);

    //Logger.log(dash_jsonResponse);
    //Logger.log(lastRow);
    sheet.getRange(statusCell[1],statusCell[0]).setValue("Collecting Student Data");

    //sheet.getRange(starterRow, columns["Your Free Blocks"]).setValue(free);

    for (var i = starterRow; i <= lastRow; i++) { // Start from row 7 (skip headers)

        if (sheet.getRange(i, columns["Buddy"]).getValue() == "NSD"){
          nsdMode = true;
        }
        else if (sheet.getRange(i, columns["Buddy"]).getValue() == "NL"){
          missingRow = i + 1;
          break;
        }

        

        var progress = ((i - starterRow) / (lastRow - starterRow)) * 100; // Calculate percentage
        var percentageText = progress.toFixed(0) + "%"; // Format percentage as text

        // Calculate the color transition from Neon Yellow (#FFFF00) to Neon Green (#39FF14)
        var red = Math.round(255 - (progress * (255 - 57) / 100));  // From 255 (yellow) to 57 (green)
        var green = Math.round(255 - (progress * (255 - 255) / 100)); // Stay at max green
        var blue = Math.round(0 + (progress * (20 - 0) / 100));  // From 0 (yellow) to 20 (green)
        
        var colorHex = `rgb(${red},${green},${blue})`; // Construct RGB color

        // Update the cell value and background color
        var cell = sheet.getRange(percentageCell[1], percentageCell[0]);
        cell.setValue(percentageText);
        cell.setBackground(colorHex);


        var cell = sheet.getRange(i, columns["Student"]); // Column B
        var richText = cell.getRichTextValue();
        // Logger.log(richText.getLinkUrl());
        //Logger.log(isName(richText.getText));

        if (richText) {
            var studentProfileUrl = richText.getLinkUrl(); // Extract hyperlink

            if (studentProfileUrl) {
                try {
                    Logger.log(`🔹 Processing row ${i}: ${studentProfileUrl}`);

                    // Call the fetchLessonFrequency function and store the returned values
                    var studentData = fetchUrl(studentProfileUrl, dash_jsonResponse);
                    //Logger.log(studentData);

                    if (studentData) {
                        var lessonsPerWeek6Months = studentData.sixMonth;
                        var lessonsPerWeek3Months = studentData.threeMonth;
                        var lessonsThisWeek = studentData.thisWeek;
                        var nextLSN = studentData.nextLSN;
                        var program_stats = studentData.program;
                        var participation = studentData.participate;
                        var chat = studentData.chats;
                        var paricipation_pace = studentData.paricipation_frequency;
                        var phone_num = studentData.phone;
                        var email = studentData.email;
                        var prefLSNTimes = studentData.prefLSNTimes;
                        var nsdChats = studentData.nsdChats;
                        var lessonsNextWeek = studentData.nextWeek;
                        var standing = studentData.standing;
                        var enrollment_month = studentData.enrollment_month;
                        
                       
                        

                        // Write the lesson frequencies to Column C and D
                        sheet.getRange(i, columns["Program (Remain/ Total)"]).setValue(program_stats);
                        sheet.getRange(i, columns["PRI's this Week"]).setValue(lessonsThisWeek); // Column E (This Weeks Lesson Count)
                        sheet.getRange(i, columns["PRI's next Week"]).setValue(lessonsNextWeek); // Column E (This Weeks Lesson Count)
                        sheet.getRange(i, columns["Next SCH LSN"]).setValue(nextLSN); // Column F (Next SCH PRI)
                        sheet.getRange(i, columns["GRPs + PTYs Last 2 Weeks"]).setValue(participation); // Column G (Next SCH PRI)
                        sheet.getRange(i, columns["FR Chat?"]).setValue(chat); // Column  (6-month pace)
                        sheet.getRange(i, columns["Historical Pace (6 mo)"]).setValue(lessonsPerWeek6Months); // Column  (6-month pace)
                        sheet.getRange(i, columns["Current Pace (3 mo)"]).setValue(lessonsPerWeek3Months); // Column  (3-month pace)
                        sheet.getRange(i, columns["GRP PTY Pace (3 mo)"]).setValue(paricipation_pace); // Column  (3-month pace)
                        sheet.getRange(i, columns["Cell Phone"]).setValue(phone_num); // Column  (3-month pace)
                        sheet.getRange(i, columns["Email"]).setValue(email); // Column  (3-month pace)
                        sheet.getRange(i, columns["Preffered LSN Times"]).setValue(prefLSNTimes); // Column  
                        sheet.getRange(i, columns["Standing?"]).setValue(standing);
                        
                        //writeBlocksWithColorFeedback(prefLSNTimes, i, columns["Preffered LSN Times"], free);
                        
                        

                        if(nsdMode){
                          sheet.getRange(i, columns["Chat Needed"]).setValue(nsdChats[0]);
                          colorHex = `rgb(${255},${0},${0})`; // Construct RGB color
                          sheet.getRange(i, columns["Chat Reason"]).setValue(nsdChats[1]);
                          sheet.getRange(i, columns["Standing?"]).setValue(enrollment_month);

                          // Update the cell value and background color
                          // if (nsdChats[0] == "missing chat"){
                          //   sheet.getRange(i, columns["Chat Needed"]).setBackground(colorHex);
                          // }
                          // if (nsdChats[1] == "missing chat"){
                          //   sheet.getRange(i, columns["Chat Reason"]).setBackground(colorHex);
                          // }
                          
                          


                        }

                        dataBank.push(cell.getValue(),studentProfileUrl,i);

                        //Logger.log(`✅ Row ${i}: Written 6-month pace (${lessonsPerWeek6Months}) & 3-month pace (${lessonsPerWeek3Months})`);
                    } else {
                        Logger.log(`⚠️ Row ${i}: No valid lesson frequency data retrieved.`);
                    }

                } catch (error) {
                    Logger.log(`❌ Error on row ${i}: ${error.toString()}`);
                }
            }
        }
      }
    

    //NFA_Inventory();

    sheet.getRange(starterRow, columns["ID + Index"]).setValue(JSON.stringify(dataBank));

    getMissingStudents(missingRow, teacher, dataBank);


    const now = new Date();
    // Format: MM/DD, HH:MM
    const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "MM/dd. hh:mm a" );
    const message = "Last Updated: " + formattedDate;

    for (let event of eventHeaders){
      sheet.getRange(1, eventColumns[event]).setValue(getWeeksAway(event)); 
    }
    // Set the message in a specific cell (e.g., top right corner)
    sheet.getRange(updateCell[1], updateCell[0]).setValue(message);
    var cell = sheet.getRange(percentageCell[1], percentageCell[0]).setValue("100%");;

    sheet.getRange(statusCell[1],statusCell[0]).setValue("Done");
}

function fetchUrl(studentProfileUrl, dash) {
    try {
        const url = "http://34.55.162.215/scrape"; // API endpoint


        if (!studentProfileUrl) {
            Logger.log("❌ Error: No student profile URL provided.");
            return null;
        }

        // API request payload
        const requestedFields = {
            url: studentProfileUrl,
            fields: {
                customer_profile: ["department"],
                enrollment_information: ["lessons","programs"], // Request only lessons
                inquiry_information: ["customer_name"],
                future_appointments: ["future"],
                service_history:["history"],
                customer_profile:["cell_phone", "email", "department"]
            }
        };

        // API request options
        const options = {
          method: "POST",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${API_KEY}`
          },
          payload: JSON.stringify(requestedFields),
          muteHttpExceptions: true,
          timeout: 5
        };

        // Send API request
        Logger.log(`🔹 Sending API Request for: ${studentProfileUrl}`);


        let response;
        response = UrlFetchApp.fetch(url, options);

        let statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            response = UrlFetchApp.fetch(backup_scrape_url, options);
            Logger.log(`❌ HTTP Error ${statusCode}: ${response.getContentText()}`);
            if (response.getResponseCode() !== 200){return null;}
            
        }

        // Parse API response
        const jsonResponse = JSON.parse(response.getContentText());

        if (!jsonResponse.inquiry_information || !jsonResponse.enrollment_information || !Array.isArray(jsonResponse.enrollment_information.lessons)) {
            Logger.log("⚠️ Missing or incorrect lesson data format.");
            return null;
        }

        const name = jsonResponse.inquiry_information.customer_name;
        const lessons = jsonResponse.enrollment_information.lessons;
        const phone = jsonResponse.customer_profile.cell_phone;
        const email = jsonResponse.customer_profile.email;
        Logger.log(`Student: ${name}`);
        //Logger.log(lessons);

        // Get today's date
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        let sixMonthLessons = 0;
        let threeMonthLessons = 0;
        let pastLessonsThisWeek = [];

        lessons.forEach(lesson => {
            const lessonDate = new Date(lesson.apptDate);
            if (lessonDate < today) {
                pastLessonsThisWeek.push(lesson); // Store past lessons
            }
            if (lessonDate >= sixMonthsAgo) {
                sixMonthLessons++;
            }
            if (lessonDate >= threeMonthsAgo) {
                threeMonthLessons++;
            }
        });

        // Calculate lessons per week
        const lessonsPerWeek6Months = (sixMonthLessons / 26).toFixed(2);

        const department = jsonResponse.customer_profile.department;
        Logger.log(department);
        let lessonsPerWeek3Months = 0.0;
        if (department == "Front Department"){
          lessonsPerWeek3Months = getLessonFrequencyPerWeek(lessons);
        }
        else{
          lessonsPerWeek3Months = (threeMonthLessons / 13).toFixed(2);
        }
         

        // Get lesson count from the dashboard for today
        const lessonsToday = countStudentLessonsFromDash(dash, name);

        // Get future appointments
        const futureAppointments = jsonResponse.future_appointments.future || [];

        // Find total lessons this week (Tuesday–Saturday)
        const lessonsThisWeek = countLessonsThisWeek(pastLessonsThisWeek, lessonsToday, futureAppointments);

        const programs = jsonResponse.enrollment_information.programs;

        const service = jsonResponse.service_history.history;

        //Logger.log(`📆 Lessons This Week (Tue-Sat): ${lessonsThisWeek}`);
        // Logger.log("Dash: " + JSON.stringify(dash));
        // Logger.log("Future Appointments:" + JSON.stringify(futureAppointments));
        // Logger.log("Last Name: " + extractLastName(name));
        const nextAppt = getNextAppointmentByLastName(dash, futureAppointments, extractLastName(name));

        const prefLSNTimes = (getTopLessonTimes(lessons));

        const program_stats = getLatestProgramRatio(programs);

        const participation = getLatestGrpOrPtyWithPace(service);

        const chat = getChats(futureAppointments);

        const lessonsNextWeek = countLessonsNextWeek(futureAppointments);

        const enrollment_month = getEarliestChatMonth(service);

        let nsdChats = "";

        if (jsonResponse.customer_profile.department == "Front Department"){
          nsdChats = findClosestChatsAfterL3(service, lessons);
        }
        else{
          nsdChats = findClosestChatsAfterL3(service, lessons);
        }

        let standing;
        futureAppointments.length >= 10 ? standing = true : standing = false;

        


        lastLessons.push([studentProfileUrl, getMostRecentLessonDate(lessons)]);
        Logger.log("Lessons this week " + lessonsThisWeek);

        return {
            sixMonth: lessonsPerWeek6Months,
            threeMonth: lessonsPerWeek3Months,
            thisWeek: lessonsThisWeek,
            nextLSN: nextAppt,
            program: program_stats, 
            participate: participation.latestEntries,
            chats: chat,
            paricipation_frequency: participation.weeklyPace,
            email: email,
            phone: phone,
            prefLSNTimes: prefLSNTimes,
            nsdChats: nsdChats,
            nextWeek: lessonsNextWeek,
            standing: standing,
            enrollment_month: enrollment_month,
            

            // nextDate: nextAppt.date,
            // nextTime: nextAppt.time,
            // nextTeacher: nextAppt.teacher
        };

    } catch (error) {
        Logger.log("❌ Error fetching lesson frequency: " + error.toString());
        return null;
    }
}

function fetchChat(studentProfileUrl){
  const url = "http://34.55.162.215/scrape"; // API endpoint

  try {
        if (!studentProfileUrl) {
            Logger.log("❌ Error: No student profile URL provided.");
            return null;
        }

        // API request payload
        const requestedFields = {
            url: studentProfileUrl,
            fields: {
                future_appointments: ["future"]
            }
            
        };

        // API request options
        const options = {
            method: "POST",
            contentType: "application/json",
            headers: {
            Authorization: `Bearer ${API_KEY}`
          },
            payload: JSON.stringify(requestedFields),
            muteHttpExceptions: true,
            timeout: 5
        };

        // Send API request
        Logger.log(`🔹 Sending API Request for: ${studentProfileUrl}`);

        let response;
        response = UrlFetchApp.fetch(url, options);

        let statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            response = UrlFetchApp.fetch(backup_scrape_url, options);
            Logger.log(`❌ HTTP Error ${statusCode}: ${response.getContentText()}`);
            if (response.getResponseCode() !== 200){return null;}
            
        }

        // Parse API response
        const jsonResponse = JSON.parse(response.getContentText());
        // Get future appointments
        const futureAppointments = jsonResponse.future_appointments.future || [];

        const chat = getChats(futureAppointments);
        //Logger.log(chat);

        return chat;

    } catch (error) {
        Logger.log("❌ Error fetching lesson frequency: " + error.toString());
        return null;
    }
}

function findClosestChatsAfterL3(serviceHistory, lessons) {
  // Step 1: Find the L3 lesson with "Show" status
  const l3Lesson = lessons.find(lesson =>
    lesson.booking === "L3" &&
    lesson.status === "Show"
  );

  const l4Lesson = lessons.find(lesson =>
    lesson.booking === "L4" &&
    lesson.status === "Show"
  );

  // Logger.log("L3 - " + JSON.stringify(l3Lesson));
  // Logger.log("L4 - " + JSON.stringify(l4Lesson));

  if (!l3Lesson) {
    return ["N/A", "N/A"];
  }

  const l3Date = new Date(l3Lesson.apptDate);
  l3Date.setHours(0, 0, 0, 0);

  // Step 2: Filter valid "CHAT (COMM)" services on or after the L3 date
  const validChats = serviceHistory.filter(entry => {
    if (entry.service === "CHAT (COMM)" && (entry.status === "Show" || entry.status === "Active")) {
      const chatDate = new Date(entry.date);
      chatDate.setHours(0, 0, 0, 0);
      return chatDate >= l3Date;
    }
    return false;
  });

  if (validChats.length === 0 && l4Lesson) {
    return ["missing chat", "missing chat"];
  }
  else if(validChats.length === 0){
    return ["missing chat", "N/A"];
  }

  // Step 3: Sort chats by date (closest to L3 first)
  validChats.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Step 4: Format each as "MM/DD - INITIALS"
  const formatChat = chat => {
    const dateObj = new Date(chat.date);
    const mmdd = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;
    const initials = chat.teacher
      .split(" ")
      .map(w => w[0]?.toUpperCase() || "")
      .join("");
    return `${mmdd} - ${initials}`;
  };

  Logger.log("valid Chats: " + JSON.stringify(validChats));
  //Logger.log("format Chats: " + formatChat);

  const first = formatChat(validChats[0]);
  const second = validChats[1] ? formatChat(validChats[1]) : l4Lesson ? "missing chat" : "N/A";



  if (first && second){
      return [first, second];
  }

  return ["N/A", "N/A"];

}
