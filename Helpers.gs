function extractLastName(studentName) {
    return studentName.split(",")[0].trim();
  }

function setTeacher(t){
  teacher = t;
}

function formatTime(time) {
  if (!time || typeof time !== "string") return "??:??";
  let match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "??:??";
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function getInitials(name) {
  if (!name) return "--";
  Logger.log(name);

  const customInitials = {
    "sharron": "SER",
    "sandesh": "SR",
    "veronica": "VO",
    "romi": "RG",
    "dave": "DW",
    "annie": "AW",
    "kia": "KK",
    "luke": "LK",
    "richard": "RS"
  };

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return parts.map(n => n[0].toUpperCase()).join("");
  }

  const firstNameLower = parts[0].toLowerCase();
  if (customInitials[firstNameLower]) {
    return customInitials[firstNameLower];
  }

  return parts[0][0]?.toUpperCase() || "--";
}



function getTopLessonTimes(lessons) {
  var lessonCounts = {};

  // Loop through each lesson and extract day abbreviation and time
  lessons.forEach(function(lesson) {
  if (lesson.apptDate && lesson.apptTime) {
    const date = new Date(lesson.apptDate);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
      const lessonTime = dayAbbr + "-" + lesson.apptTime;

      // Count occurrences of each lesson time
      lessonCounts[lessonTime] = (lessonCounts[lessonTime] || 0) + 1;
    }
  }
  });

  // Convert object to array and sort by count in descending order
  var sortedLessons = Object.entries(lessonCounts).sort((a, b) => b[1] - a[1]);

  // Extract top 3 lesson times
  var topLessons = sortedLessons.slice(0, 3).map(item => item[0]);

  // Return formatted string
  return topLessons.join("|");
}



  function getLatestProgramRatio(programs) {
    // Filter programs with service type PRI, PRI1, or PRI2
    Logger.log(programs);
    const filteredPrograms = programs.filter(p => 
      ['PRI', 'PRI1', 'PRI2'].includes(p.service.trim())
    );

    // Sort programs by enrollment date (latest first)
    filteredPrograms.sort((a, b) => new Date(b.enroll_date) - new Date(a.enroll_date));

    // Find the most recent valid program with remaining lessons
    for (let i = 0; i < filteredPrograms.length; i++) {
      const enroll = parseInt(filteredPrograms[i].enroll, 10);
      const remain = parseInt(filteredPrograms[i].remain, 10);

      // Check if there are remaining lessons
      if (remain > 0) {
        return `${remain}/${enroll}`;
      }
    }

    // If all recent programs have full remaining, check the next one with any remaining lessons
    for (let i = 0; i < filteredPrograms.length; i++) {
      const enroll = parseInt(filteredPrograms[i].enroll, 10);
      const remain = parseInt(filteredPrograms[i].remain, 10);

      if (remain > 0) {
        return `${remain}/${enroll}`;
      }
    }

    // If no valid program found, return N/A
    return "N/A";
}

function getLatestGrpOrPtyWithPace(serviceHistory) {
  const grpScheduleMap = {
    "Tuesday": { "06:45 PM": "ADV", "07:30 PM": "B1" },
    "Wednesday": { "06:45 PM": "B2", "07:30 PM": "Basics" },
    "Thursday": { "03:30 PM": "SV" },
    "Friday": { "06:45 PM": "B3/B4", "07:30 PM": "SV" },
    "Saturday": { "10:45 AM": "Basics", "11:30 AM": "Skills", "12:15 PM": "CPLs" }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  const relevantServices = serviceHistory
    .filter(entry =>
      (entry.service.includes("GRP") || entry.service.includes("PTY")) &&
      entry.status === "Show" &&
      new Date(entry.date) >= twoWeeksAgo
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalLessons = relevantServices.length;
  const weeksInTwoWeeks = 2;
  const weeklyPace = (totalLessons / weeksInTwoWeeks).toFixed(2);

  let formattedEntries = "-"; // default if no services
  if (relevantServices.length > 0) {
    formattedEntries = relevantServices.slice(0, 4).map(entry => {
      const formattedDate = formatDate(entry.date);
      if (entry.service.includes("PTY")) {
        return `${formattedDate} PTY`;
      }
      const day = new Date(entry.date).toLocaleString("en-US", { weekday: "long" });
      const mappedName = grpScheduleMap[day]?.[entry.appt_time] || "GRP";
      return `${formattedDate} ${mappedName}`;
    }).join(" | ");
  }

  return {
    latestEntries: formattedEntries,
    weeklyPace: weeklyPace
  };
}



function getChats(futureAppointments) {
  const chatEntries = futureAppointments
    .filter(entry => entry.service.includes("CHAT (COMM)") && entry.status === "Active")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (chatEntries.length === 0) return "-";

  const formattedChats = chatEntries.map(entry => {
    const date = new Date(entry.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day} ${entry.appt_time}`;
  });

  return formattedChats.join(' | ');
  }

function isName(str) {
  return /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(str);
  }

function getEndOfWeek(weeksAhead) {
  const timezone = Session.getScriptTimeZone();
  let today = new Date();
  today = new Date(Utilities.formatDate(today, timezone, 'yyyy-MM-dd')); // Force local date

  let day = today.getDay(); // Sunday=0, Monday=1, ..., Saturday=6

  // Figure out how many days until upcoming Saturday
  let daysUntilSaturday;
  if (day === 0) { 
    // Sunday: tracking week just started, Saturday is 6 days away
    daysUntilSaturday = 6;
  } else {
    // Monday-Saturday
    daysUntilSaturday = 6 - day;
  }

  // Move to this Saturday first
  let thisSaturday = new Date(today);
  thisSaturday.setDate(today.getDate() + daysUntilSaturday);

  // Then add full weeks ahead
  thisSaturday.setDate(thisSaturday.getDate() + (weeksAhead * 7));

  // Return in YYYY-MM-DD format
  return Utilities.formatDate(thisSaturday, timezone, 'yyyy-MM-dd');
}






function getNextAppointmentByLastName(dashData, futureAppointments, lastName) {
    if (!dashData || !dashData.dashboard || !futureAppointments) {
        Logger.log("⚠️ Missing or incorrect dashboard/future appointments data.");
        return "NFA";
    }

    Logger.log(`🔍 Searching for next appointment for last name: ${lastName}`);

    // Convert today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for accurate comparison

    // Parse future appointments and filter for the given last name

    // if (appointmentDate >= today && appointmentDate <= weekEnd  && (status == "Active" || status == "Confirm") && (service.includes("PRI1") || service.includes("PRI2"))) {
    //     count++;
    //   }

    let nextAppointment = futureAppointments
      .filter(appt => (appt.status === "Active" || appt.status === "Confirm") && 
          (appt.service.includes("PRI1") || appt.service.includes("PRI2")) && 
          appt.date)
      .map(appt => {
            return {
                date: new Date(appt.date),
                time: appt.appt_time,
                teacher: appt.teacher ? appt.teacher.split(" ")[0] : "Unknown Teacher"
            };

        })
        .filter(appt => appt.date >= today) // Only consider future or today's appointments
        .sort((a, b) => a.date - b.date); // Sort by closest date first

    // Check dashboard for same-day lessons
    let sameDayLessons = getSameDayPrivateLessons(dashData, lastName);

    if (sameDayLessons.length > 0) {
        Logger.log(`📅 Student ${lastName} has a lesson today.`);
        Logger.log(sameDayLessons);
        Logger.log(sameDayLessons[0].time);
        return today.toDateString().replace(/\s\d{4}$/, '') + ` - ${(sameDayLessons[0].time).split('-')[0].trim()} - ${getInitials(sameDayLessons[0].owner)}`;
    }

    // If no same-day lessons, return next upcoming future appointment
    if (nextAppointment.length > 0) {
        let next = nextAppointment[0];
        Logger.log(`✅ Next appointment for ${lastName}: ${next.date.toDateString()} at ${next.time} with ${getInitials(next.teacher)}`);
        //Logger.log(next.date);
        return (`${next.date.toDateString().replace(/\s\d{4}$/, '')} - ${next.time} - ${getInitials(next.teacher)}`);
    }

    Logger.log(`❌ No upcoming appointments found for ${lastName}.`);
    return "NFA";
}

function getSameDayPrivateLessons(dashData, lastName) {
  if (!dashData || !Array.isArray(dashData.dashboard)) {
    Logger.log("⚠️ Invalid dashData structure.");
    return [];
  }

  const safeLastName = lastName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
  const nameRegex = new RegExp(`\\b${safeLastName}\\b`, 'i'); // word-boundary match

  const sameDayLessons = dashData.dashboard.filter(entry => {
    if (!entry.content || typeof entry.content !== 'string') return false;

    const content = entry.content.toLowerCase();
    return nameRegex.test(content) && content.includes("private lesson");
  });

  return sameDayLessons;
}



function getMostRecentLessonDate(lessons) {
  if (!lessons || lessons.length === 0) return null;

  let latestDate = null;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const apptDate = lesson.apptDate;

    if (!apptDate) continue;

    const parsedDate = new Date(apptDate);

    if (!latestDate || parsedDate > latestDate) {
      latestDate = parsedDate;
    }
  }

  if (!latestDate) return null;

  // Format as MM/DD
  const month = String(latestDate.getMonth() + 1).padStart(2, '0');
  const day = String(latestDate.getDate()).padStart(2, '0');

  return `${month}/${day}`;
}

function countLessonsThisWeek(pastLessons, lessonsToday, futureAppointments) {
  Logger.log("Past Lessons: " + JSON.stringify(pastLessons));
  Logger.log("Lessons Today: " + lessonsToday);
  Logger.log("Future Appointments: " + JSON.stringify(futureAppointments));
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    let weekStart, weekEnd;

    if (dayOfWeek === 0) {
      // Sunday → upcoming Tues–Sat
      weekStart = new Date(today);
      weekStart.setDate(today.getDate() + 2);

      weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 6);
    } else if (dayOfWeek === 1) {
      // Monday → upcoming Tues–Sat
      weekStart = new Date(today);
      weekStart.setDate(today.getDate() + 1);

      weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 5);
    } else {
      // Tues–Sat → this week's Tues–Sat
      const offset = dayOfWeek - 2;

      weekStart = new Date(today);
      weekStart.setDate(today.getDate() - offset);

      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Tues + 4 = Sat
    }

    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    let count = 0;

    // Count today's lessons (if today is within the week)
    if (today >= weekStart && today <= weekEnd) {
      count += lessonsToday;
    }
    Logger.log("Lessons Today - " + lessonsToday)

    // Past lessons within the current week range
    pastLessons.forEach(lesson => {
      if (!lesson.apptDate) return;
      const lessonDate = new Date(lesson.apptDate);
      const status = lesson.status;
      if (lessonDate >= weekStart && lessonDate <= today && status == "Show") {
        count++;
        Logger.log("Past Lessons - " + lesson);
      }
    });

    
    Logger.log("Week Start: " + weekStart);
    Logger.log("Week End: " + weekEnd);
    Logger.log("Today: " + today);
    // Future appointments within the current week range
    futureAppointments.forEach(appointment => {
      if (!appointment.date) return;
      const appointmentDate = new Date(appointment.date);
      const status = appointment.status;
      const service = appointment.service;
      if (appointmentDate > today && appointmentDate <= weekEnd  && (status == "Active" || status == "Confirm") && (service.includes("PRI1") || service.includes("PRI2"))) {
        count++;
        Logger.log("Future Appt - " + appointmentDate);

      }
    });

    return count;

  } catch (error) {
    Logger.log("❌ Error: " + error.toString());
    return 0;
  }
}

function countLessonsNextWeek(futureAppointments) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    let nextTuesday = new Date(today);
    let nextSaturday = new Date(today);

    nextTuesday.setDate(today.getDate() + (9 - dayOfWeek));
    nextTuesday.setHours(0, 0, 0, 0);

    nextSaturday = new Date(nextTuesday);
    nextSaturday.setDate(nextTuesday.getDate() + 4);
    nextSaturday.setHours(23, 59, 59, 999);

    let count = 0;

    futureAppointments.forEach(appointment => {
      if (!appointment.date) return;
      const appointmentDate = new Date(appointment.date);
      const status = appointment.status;
      const service = appointment.service;

      if (
        appointmentDate >= nextTuesday &&
        appointmentDate <= nextSaturday &&
        status === "Active" &&
        (service.includes("PRI1") || service.includes("PRI2"))
      ) {
        count++;
      }
    });

    Logger.log(`✅ Lesson count for next week (Tue–Sat): ${count}`);
    return count;

  } catch (error) {
    Logger.log("❌ Error in countLessonsNextWeek: " + error.toString());
    return 0;
  }
}




function getLessonFrequencyPerWeek(lessons) {
  if (!Array.isArray(lessons) || lessons.length === 0) return 0;

  // Extract valid dates
  const lessonDates = lessons
    .map(lesson => new Date(lesson.apptDate))
    .filter(date => !isNaN(date)); // filter out invalid dates

  if (lessonDates.length < 2) return lessonDates.length; // if only 1 lesson, return 1

  // Find earliest and latest dates
  const minDate = new Date(Math.min(...lessonDates));
  const maxDate = new Date(Math.max(...lessonDates));

  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const weekSpan = (maxDate - minDate) / msPerWeek;

  // Avoid divide by zero
  if (weekSpan === 0) return lessonDates.length;

  const frequency = lessonDates.length / weekSpan;
  return parseFloat(frequency.toFixed(2));
}



function getWeeksAway(eventHeader) {
  let today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison

  if (!eventDetails.hasOwnProperty(eventHeader)) {
    return null; // Return null if event is not found
  }

  let eventDate = new Date(eventDetails[eventHeader].date);
  eventDate.setFullYear(today.getFullYear()); // Set to the current year

  // If the event has already passed this year, set it to next year
  if (eventDate < today) {
    eventDate.setFullYear(today.getFullYear() + 1);
  }

  let timeDiff = eventDate - today;
  let weeksAway = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));

  return (weeksAway + " weeks");
  }

function getEarliestChatMonth(serviceHistory) {
  const validChats = serviceHistory.filter(entry => {
    if (entry.service === "CHAT (COMM)" && (entry.status === "Show" || entry.status === "Active")) {
      const chatDate = new Date(entry.date);
      return !isNaN(chatDate.getTime());
    }
    return false;
  });

  if (validChats.length === 0) return null;

  validChats.sort((a, b) => new Date(a.date) - new Date(b.date));
  const earliestDate = new Date(validChats[0].date);

  return earliestDate.toLocaleString('en-US', { month: 'long' }); // e.g., "April"
}

function getFreeBlocksForTeacher() {

  const teacherDash = pullDash();

  

  function getOccupiedBlocks(dashboard) {
    const occupied = {};
    dashboard.forEach(entry => {
      const { day, owner, time } = entry;
      if (owner !== teacher || !day || !time) return;

      let block = time.split("-")[0].trim(); // get start time
      if (block.includes(":") && !block.includes("AM") && !block.includes("PM")) {
        block += " PM"; // fix formatting for e.g. 2:45 to 2:45 PM
      }

      const dayNum = parseInt(day);
      if (!occupied[dayNum]) occupied[dayNum] = new Set();
      occupied[dayNum].add(block);
    });
    return occupied;
  }

  function calculateFreeBlocks(dashboard, label) {
    const occupied = getOccupiedBlocks(dashboard, teacher);
    const result = {};

    for (let day = 2; day <= 6; day++) {
      const possible = WORKING_BLOCKS[day];
      const blocked = occupied[day] || new Set();
      const free = possible.filter(block => !blocked.has(block));
      result[getDayLabel(day)] = free;
    }

    return result;
  }

  function getDayLabel(dayNum) {
    const map = {2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};
    return map[dayNum] || `Day ${dayNum}`;
  }

  function pullDash(){
    var url = "http://34.55.162.215/dash"; // Replace with your server's URL if deployed
    var currentWeek;
    var nextWeek;
    //sheet.getRange(statusCell[1],statusCell[0]).setValue("Checking Teacher Metrics...");
    for (let i = 0; i <= 1; i ++){
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
        // Logger.log(JSON.stringify(jsonResponse)); // Logs the response in the Apps Script console
        // Logger.log(Array.isArray(jsonResponse));

        if (i == 0){currentWeek = jsonResponse.dashboard;}
        else if(i == 1){nextWeek = jsonResponse.dashboard;}
    }
    catch (error) {
                    Logger.log(`❌ ${error.toString()}`);
                }
    }

    return [currentWeek, nextWeek];
  }

  // Logger.log("TeacherDash 1: " + teacherDash[0]);
  // Logger.log("TeacherDash 2: " + teacherDash[1]);
  
  return {
    thisWeek: calculateFreeBlocks(teacherDash[0], "thisWeek"),
    nextWeek: calculateFreeBlocks(teacherDash[1], "nextWeek")
  };
}

function formatRollingWeekFreeBlocks(occupiedBlocks) {
  const dayMap = {
    2: "Tues",
    3: "Wed",
    4: "Thurs",
    5: "Fri",
    6: "Sat"
  };

  const fullDayOrder = [2, 3, 4, 5, 6]; // Tuesday (2) to Saturday (6)
  const today = new Date();
  const currentDayNum = today.getDay(); // Sunday=0, Monday=1, ..., Saturday=6

  // Map Sunday (0) or Monday (1) to 2 (Tuesday)
  const startDayIndex = fullDayOrder.findIndex(d => d >= (currentDayNum < 2 ? 2 : currentDayNum));
  const rollingDays = [...fullDayOrder.slice(startDayIndex), ...fullDayOrder.slice(0, startDayIndex)];

  // Merge thisWeek and nextWeek into one map
  const combined = {};
  for (const weekKey in occupiedBlocks) {
    for (const [day, times] of Object.entries(occupiedBlocks[weekKey])) {
      if (!combined[day]) combined[day] = new Set();
      times.forEach(time => combined[day].add(time));
    }
  }

  // Format output
  const result = [];
  for (let dayNum of rollingDays) {
    const dayName = Object.keys(BLOCKS).find(name => name.startsWith(dayMap[dayNum])) || dayMap[dayNum];
    const occupiedSet = combined[dayName];

    if (occupiedSet && occupiedSet.size > 0) {
      const sortedTimes = Array.from(occupiedSet).sort((a, b) => new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`));
      result.push(`${dayMap[dayNum]}-${sortedTimes.join("|")}`);
    }
  }

  return result.join("-");
}

function writeBlocksWithColorFeedback(blockList, row, column, matchString) {
  const richTextBuilder = SpreadsheetApp.newRichTextValue();

  const dayMap = {
    Mon: "Monday", Tue: "Tuesday", Tues: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Thurs: "Thursday",
    Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
  };

  function normalizeDay(dayRaw) {
    const abbrev = dayRaw.trim().slice(0, 4);
    return dayMap[abbrev] || dayRaw.trim();
  }

  function normalizeTime(rawTime) {
    let t = rawTime.trim().toUpperCase();
    if (!t.includes(" ")) t = t.replace(/(AM|PM)/, " $1");
    return t;
  }

  // Initialize matchMap as an object with days as keys
  const matchMap = {};

  // Properly parse matchString to build matchMap
  matchString.split("-").forEach(segment => {
    const parts = segment.split("|");
    const dayRaw = parts[0];
    const times = parts.slice(1);

    const day = normalizeDay(dayRaw);
    if (!matchMap[day]) matchMap[day] = []; // Initialize as an array

    // Add the times to the corresponding day in matchMap
    times.forEach(t => {
      const normalizedTime = normalizeTime(t);
      if (!matchMap[day].includes(normalizedTime)) { // Avoid duplicates
        matchMap[day].push(normalizedTime);
      }
    });
  });

  Logger.log("Parsed matchMap before checking times: %s", JSON.stringify(matchMap));

  const colors = {
    exact: "#39FF14",       // Neon green
    adjacent: "#90EE90",    // Light green
    near: "#000000",        // Black
    far: "#FF0000"          // Red
  };

  const parts = blockList.split("|").map(s => s.trim());
  let textOutput = "";
  let offset = 0;

  parts.forEach((block, i) => {
    const [dayRaw, timeRaw] = block.split("-");
    const day = normalizeDay(dayRaw);
    const time = normalizeTime(timeRaw);
    const schedule = BLOCKS[day] || [];

    Logger.log(`Checking: ${dayRaw}-${timeRaw} → ${day}-${time}`);
    Logger.log(`Index in BLOCKS[${day}]: ${schedule.indexOf(time)}`);
    Logger.log(`Schedule for ${day}: ${JSON.stringify(schedule)}`);

    let color = colors.far;

    // Compare block time with schedule
    if (schedule.indexOf(time) !== -1) {
      const hasMatch = (offset) => schedule[schedule.indexOf(time) + offset] && matchMap[day]?.includes(schedule[schedule.indexOf(time) + offset]);

      // Log all comparisons
      Logger.log(`  Matching times: ${time}`);
      Logger.log(`  Comparing: ${schedule.join(", ")} against ${matchMap[day] ? matchMap[day].join(", ") : "none"}`);

      const isExact = matchMap[day]?.includes(time);
      const isAdjacent = hasMatch(-1) || hasMatch(1);
      const isNear = hasMatch(-2) || hasMatch(2);

      Logger.log(`  Exact match? ${isExact}`);
      Logger.log(`  Adjacent match? ${isAdjacent}`);
      Logger.log(`  Near match? ${isNear}`);

      if (isExact) {
        color = colors.exact;
      } else if (isAdjacent) {
        color = colors.adjacent;
      } else if (isNear) {
        color = colors.near;
      }
    } else {
      Logger.log(`  Time not found in BLOCKS schedule.`);
    }

    const label = (i > 0 ? "|" : "") + `${dayRaw}-${timeRaw}`;
    textOutput += label;
    richTextBuilder.setText(textOutput);
    richTextBuilder.setTextStyle(offset, offset + label.length, SpreadsheetApp.newTextStyle().setForegroundColor(color).build());
    offset += label.length;
  });

  sheet.getRange(row, column).setRichTextValue(richTextBuilder.build());
}










function normalizeTimeFormat(raw) {
  let time = raw.trim().toUpperCase();
  if (!time.includes("AM") && !time.includes("PM")) {
    time += " PM";
  }
  return time;
}


