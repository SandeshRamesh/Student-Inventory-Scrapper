function getSheetByGid(gid) {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() == gid) {
      return sheets[i];
    }
  }
  
  throw new Error("Sheet with gid " + gid + " not found.");
}

function findColumnHeaders(newSheet, searchTexts, headerRow) {
  const rowValues = newSheet.getRange(headerRow, 1, 1, newSheet.getLastColumn()).getValues()[0];

  let columnNumbers = {};

  searchTexts.forEach(text => {
    columnNumbers[text] = null;  // default if not found
    for (let col = 0; col < rowValues.length; col++) {
      if (rowValues[col] === text) {
        columnNumbers[text] = col + 1;  // save column number
        break;
      }
    }
  });

  return columnNumbers;  // returns an object with each text and its column number
}
