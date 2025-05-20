const managerSheet = SpreadsheetApp.openById("1XMT9T43et1se_St_i5OkwB-S4A_o-yL4pTPFvY8t81U").getSheetById(695637996);
const managerHeaders = ["Historical Pace (6 mo)", "Historical Pace w/ Teacher (6 mo)", "Current Pace (3 mo)", "Current Pace w/ Teacher (3 mo)", "Lessons this Week", "Next SCH PRI", "Student", "Program (Remain/ Total)", "Main Teacher", "Last LSN","Current Pace", "FR Chat?", "Main Teacher + Students", "ID + Index", "Chat Needed", "Chat Reason", "Current Goal", "Next Event"];

managerColumns = findColumnHeaders(managerSheet, managerHeaders, 4);

const checkboxColumn = columns["Chat Needed"]; // A = 1, B = 2, etc.
const chatReasonColumn = columns["Chat Reason"];
const nextEventColumn = columns["Next Event"];
const currentGoalColumn = columns["Current Goal"];
const notesColumn = columns["Notes"];

const managerEventColumns = findColumnHeaders(managerSheet, eventHeaders, 4);
const eventColumns = findColumnHeaders(sheet, eventHeaders, 2);

function onEdit(e) {

  Logger.log(eventColumns);
  Logger.log(columns);

  const range = e.range;
  const selectedColumn = range.getColumn();
  // Only sync if we're editing the right sheet and column

  if (selectedColumn !== checkboxColumn && selectedColumn !== chatReasonColumn && 
   selectedColumn !== nextEventColumn && selectedColumn !== currentGoalColumn && selectedColumn !== notesColumn && !findEvent(selectedColumn, eventColumns)) return;

  
  //sheet.getRange(1,3).setValue("YAY");
  const row = range.getRow();
  const newValue = range.getValue();
  //sheet.getRange(1, 12).setValue("TEST");

  //Logger.log(managerColumns["ID + Index"]);

  var cell = sheet.getRange(row, columns["Student"]); // Column B
  var url = cell.getRichTextValue().getLinkUrl();
  const eventName = sheet.getRange(headerRow, selectedColumn).getValue();


  // Logger.log(dataArray);
  // Logger.log(url);
  const dataArray = JSON.parse(managerSheet.getRange(5, managerColumns["ID + Index"]).getValue());
  const managerIndexs = getIndexFromSelectorUrl(dataArray, url);
  //let chatVal = "";
  

  if (selectedColumn == checkboxColumn){
    //chatVal = fetchChat(url);
    for (let i = 0; i < managerIndexs.length; i ++){
      Logger.log(managerIndexs[i]);
      managerSheet.getRange(managerIndexs[i], managerColumns["Chat Needed"]).setValue(newValue);
      //managerSheet.getRange(managerIndexs[i], managerColumns["FR Chat?"]).setValue(chatVal);
    }
  }
  else if (selectedColumn == chatReasonColumn){
    sheet.getRange(row, selectedColumn).setBackground('#39FF14');
    //chatVal = fetchChat(url);
    updateColumnTimestamp(sheet,selectedColumn, row, columns["Highlight Timestamps"]);
    for (let i = 0; i < managerIndexs.length; i ++){
      Logger.log(managerIndexs[i]);
      managerSheet.getRange(managerIndexs[i], managerColumns["Chat Reason"]).setValue(newValue);
      //managerSheet.getRange(managerIndexs[i], managerColumns["FR Chat?"]).setValue(chatVal);
    }
  }
  // else if (selectedColumn == nextEventColumn){
  //   for (let i = 0; i < managerIndexs.length; i ++){
  //     Logger.log(managerIndexs[i]);
  //     managerSheet.getRange(managerIndexs[i], managerColumns["Next Event"]).setValue(newValue);
  //   }
  // }
  else if (selectedColumn == currentGoalColumn){
    sheet.getRange(row, selectedColumn).setBackground('#39FF14');
    updateColumnTimestamp(sheet,selectedColumn, row, columns["Highlight Timestamps"]);
    for (let i = 0; i < managerIndexs.length; i ++){
      Logger.log(managerIndexs[i]);
      managerSheet.getRange(managerIndexs[i], managerColumns["Current Goal"]).setValue(newValue);
    }
  }
  else if (findEvent(selectedColumn, eventColumns)){
    sheet.getRange(row, selectedColumn).setBackground('#39FF14');
    for (let i = 0; i < managerIndexs.length; i ++){
      Logger.log(managerIndexs[i]);
      if( managerSheet.getRange(managerIndexs[i], managerEventColumns[eventName]).getValue() != ""){
          managerSheet.getRange(managerIndexs[i], managerEventColumns[eventName]).setValue(newValue);
      }
    }
  }

  var buddy = sheet.getRange(row, 1).getValue();
  Logger.log(buddy);
  var child_url = childTeacherSheets[buddy] || null;
  Logger.log(child_url);

  if (child_url){

    const childSheet = SpreadsheetApp.openById(child_url).getSheetById(1161665315);

    let childColumns = findColumnHeaders(childSheet, headers, 2);

    const childDataArray = JSON.parse(childSheet.getRange(4, childColumns["ID + Index"]).getValue());
    const childIndexs = getIndexFromSelectorUrl(childDataArray, url);
    const childEventColumns = findColumnHeaders(childSheet, eventHeaders, 2);
    
    

    if (selectedColumn == checkboxColumn){
      for (let i = 0; i < childIndexs.length; i ++){
        Logger.log(childIndexs[i]);
        childSheet.getRange(childIndexs[i], childColumns["Chat Needed"]).setValue(newValue);
        //childSheet.getRange(childIndexs[i], childColumns["FR Chat?"]).setValue(chatVal);
      }
    }
    else if (selectedColumn == chatReasonColumn){
      for (let i = 0; i < childIndexs.length; i ++){
        Logger.log(childIndexs[i]);
        childSheet.getRange(childIndexs[i], childColumns["Chat Reason"]).setValue(newValue);
        //childSheet.getRange(childIndexs[i], childColumns["FR Chat?"]).setValue(chatVal);
        childSheet.getRange(childIndexs[i], childColumns["Chat Reason"]).setBackground('#39FF14');
        updateColumnTimestamp(childSheet, childColumns["Chat Reason"], childIndexs[i], childColumns["Highlight Timestamps"]);
      }
    }
    // else if (selectedColumn == nextEventColumn){
    // for (let i = 0; i < childIndexs.length; i ++){
    //   Logger.log(childIndexs[i]);
    //   childSheet.getRange(childIndexs[i], childColumns["Next Event"]).setValue(newValue);
    // }
  //}
  else if (selectedColumn == currentGoalColumn){
    for (let i = 0; i < childIndexs.length; i ++){
      Logger.log(childIndexs[i]);
      childSheet.getRange(childIndexs[i], childColumns["Current Goal"]).setValue(newValue);
      childSheet.getRange(childIndexs[i], childColumns["Current Goal"]).setBackground('#39FF14');
      updateColumnTimestamp(childSheet, childColumns["Current Goal"], childIndexs[i], childColumns["Highlight Timestamps"]);
    }
  }
  else if (selectedColumn == notesColumn){
    for (let i = 0; i < childIndexs.length; i ++){
      Logger.log(childIndexs[i]);
      childSheet.getRange(childIndexs[i], childColumns["Notes"]).setValue(newValue);
      childSheet.getRange(childIndexs[i], childColumns["Notes"]).setBackground('#39FF14');
      updateColumnTimestamp(childSheet, childColumns["Notes"], childIndexs[i], childColumns["Highlight Timestamps"]);
    }
  }
    else if (findEvent(selectedColumn, eventColumns)){
      for (let i = 0; i < childIndexs.length; i ++){
        Logger.log(childIndexs[i]);
        childSheet.getRange(childIndexs[i], childEventColumns[eventName]).setValue(newValue);
      }
    }
  }

  


}

function getIndexFromSelectorUrl(dataArray, selectorUrl) {
  let managerIndexs = [];
  //Logger.log(dataArray);
  // Logger.log(selectorUrl);
  // Logger.log(typeof(selectorUrl));
  selectorUrl = selectorUrl.substring(selectorUrl.lastIndexOf("/") + 1);

  for (let i = 1; i < dataArray.length; i+=3) {
    //Logger.log((dataArray[i]));
    if (dataArray[i].substring(dataArray[i].lastIndexOf("/") + 1) == selectorUrl) {
      Logger.log("FOUND: " + dataArray[i]);
      managerIndexs.push(dataArray[i+1]);
    }
  }
  if (managerIndexs){
    return managerIndexs;
  }

  Logger.log(`❌ Selector URL not found: ${selectorUrl}`);
  return null;
}

function findEvent(index, columns){
  const columnValues = Object.values(columns);
  return columnValues.includes(Number(index));
}

function updateColumnTimestamp(sheet, col, row, timeStamp_column) {
  const cell = sheet.getRange(starterRow, timeStamp_column);
  const currentTime = new Date().toISOString();

  // Parse existing array from cell, or start fresh
  let log = [];
  try {
    const existing = cell.getValue();
    if (existing) {
      log = JSON.parse(existing);
    }
  } catch (e) {
    Logger.log("Invalid JSON in cell: " + cell.getValue());
  }

  // Check if entry exists; if so, overwrite
  const existingIndex = log.findIndex(entry => entry.col === col && entry.row === row);
  const newEntry = { col: col, row: row, time: currentTime };

  if (existingIndex > -1) {
    log[existingIndex] = newEntry;
  } else {
    log.push(newEntry);
  }

  // Write back the updated array
  cell.setValue(JSON.stringify(log));
}


