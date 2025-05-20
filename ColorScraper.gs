const GID = 1161665315; // Replace with your common GID

function updateAllSpreadsheetsByGid() {
  const spreadsheetIds = Object.values(childTeacherSheets); // Use global object values

  spreadsheetIds.forEach(id => {
    try {
      const ss = SpreadsheetApp.openById(id).getSheetById(GID);;
      //const sheet = getSheetByGid(ss, GID); // getSheetByGid is global
      updateCellColorsFromSheet(ss);
    } catch (e) {
      Logger.log(`Failed on spreadsheet ID ${id}: ${e}`);
    }
  });
}

function updateCellColorsFromSheet(sheet) {
  const masterLogCell = sheet.getRange(4, 44); // AR4
  const now = new Date();

  let log = [];
  try {
    const raw = masterLogCell.getValue();
    if (raw) {
      log = JSON.parse(raw);
    }
  } catch (e) {
    Logger.log(`Invalid JSON in ${sheet.getName()}!AR4`);
    return;
  }

  log.forEach(entry => {
    const { col, row, time } = entry;
    const timestamp = new Date(time);
    const diffMs = now - timestamp;
    const diffHours = diffMs / (1000 * 60 * 60);
    const targetCell = sheet.getRange(row, col);

    if (diffHours < 24) return;
    if (diffHours < 48) targetCell.setBackground("#b7e1cd");
    else if (diffHours < 72) targetCell.setBackground("#b6d7a8");
    else if (diffHours < 168) targetCell.setBackground("#a9d18e");
    else {
      const fallbackColor = sheet.getRange(row, 7).getBackground(); // Always use column G
      targetCell.setBackground(fallbackColor);
    }
  });
}
