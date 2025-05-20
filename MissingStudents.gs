function getMissingStudents(row, teacher, dataArray){
  // let row = 52;
  // let teacher = "Romi";
  //let dataArray = JSON.parse(sheet.getRange(4, columns["ID + Index"]).getValue())
  let back_students;
  let front_students;
  let url = "http://34.55.162.215/students"; // API endpoint

  try {
        
        // API request payload
        let requestedFields = {
            fields: {
                students: ["front"]
            }
        };
        // API request options
        let options = {
            method: "POST",
            contentType: "application/json",
            headers: {
              Authorization: `Bearer ${API_KEY}`
            },
            payload: JSON.stringify(requestedFields),
            muteHttpExceptions: true,
            timeout: 10
        };
        // Log the request details
        Logger.log("🔹 Sending API Request...");
        Logger.log(UrlFetchApp.getRequest(url, options));

        // Send API request
        let response;
        response = UrlFetchApp.fetch(url, options);

        let statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            response = UrlFetchApp.fetch(backup_students_url, options);
            Logger.log(`❌ HTTP Error ${statusCode}: ${response.getContentText()}`);
            if (response.getResponseCode() !== 200){return null;}
            
        }

        // Parse API response
        let jsonResponse = JSON.parse(response.getContentText());
        Logger.log(jsonResponse);

        // Ensure response contains "students" key and is an array
        if (!jsonResponse.students || !Array.isArray(jsonResponse.students) || jsonResponse.students.length === 0) {
            Logger.log("⚠️ No student data found or response format incorrect.");
            return;
        }

        front_students = jsonResponse.students; // Extract student data array
        Logger.log(`✅ Successfully retrieved ${front_students.length} students.`);

        // Open or create the Google Sheet

        // Process student data
        front_students = getStudentsByTeacher(front_students,teacher);
        //Logger.log(getStudentsByTeacher(front_students,teacher));
  }
  catch{}

  // try {
        // API request payload
        requestedFields = {
            fields: {
                students: ["back"]
            }
        };
        // API request options
        options = {
            method: "POST",
            contentType: "application/json",
            headers: {
              Authorization: `Bearer ${API_KEY}`
            },
            payload: JSON.stringify(requestedFields),
            muteHttpExceptions: true,
            timeout: 10
        };
        // Log the request details
        Logger.log("🔹 Sending API Request...");
        Logger.log(UrlFetchApp.getRequest(url, options));

        // Send API request
        //let response;
        try {
          response = UrlFetchApp.fetch(url, options);
        }
        catch{
          response = UrlFetchApp.fetch(backup_scrape_url, options);
        }
        statusCode = response.getResponseCode();

        if (statusCode !== 200) {
            Logger.log(`❌ HTTP Error ${statusCode}: ${response.getContentText()}`);
            return;
        }

        // Parse API response
        jsonResponse = JSON.parse(response.getContentText());

        // Ensure response contains "students" key and is an array
        if (!jsonResponse.students || !Array.isArray(jsonResponse.students) || jsonResponse.students.length === 0) {
            Logger.log("⚠️ No student data found or response format incorrect.");
            return;
        }

        back_students = jsonResponse.students; // Extract student data array
        Logger.log(`✅ Successfully retrieved ${back_students.length} students.`);

        // Open or create the Google Sheet

        // Process student data
        back_students = getStudentsByTeacher(back_students,teacher);
  // }
  // catch{

  // }

  Logger.log(front_students);
  Logger.log(back_students);

  if (front_students){
    for (let i = 0; i < front_students.length; i ++ ){
    let indexs = getIndexFromSelectorUrl(dataArray, front_students[i][1]);
    Logger.log(indexs);
    if (indexs.length == 0){
      sheet.getRange(row, columns["Student"]).setFormula(`=HYPERLINK("${front_students[i][1]}", "${front_students[i][0]}")`);
      row ++;
    }
  }
  }
  if (back_students){
    for (let i = 0; i < back_students.length; i ++ ){
    let indexs = getIndexFromSelectorUrl(dataArray, back_students[i][1]);
    Logger.log(indexs);
    if (indexs.length == 0){
      sheet.getRange(row, columns["Student"]).setFormula(`=HYPERLINK("${back_students[i][1]}", "${back_students[i][0]}")`);
      row ++;
    }
  }
  }
  

}

function getStudentsByTeacher(data, teacherFirstName) {
  const result = [];

  data.forEach(entry => {
    const teacherField = entry.teachers;
    if (teacherField && teacherField.toLowerCase().includes(teacherFirstName.toLowerCase())) {
      result.push([entry.studentName, entry.studentLink]);
    }
  });

  return result;
}
