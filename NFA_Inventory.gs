function NFA_Inventory() {
  for (var i = starterRow; i <= lastRow; i++) {
    sheet.getRange(statusCell[1],statusCell[0]).setValue("Updating NFA Inventory");

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
    let NFA_Value = sheet.getRange(i, columns['Next SCH LSN']).getValue();
    
    if (NFA_Value === 'NFA') {
      // Ensure column mappings exist
      if (columns["Student"] != null && NFA_Columns["Student"] != null) {
        const studentToWrite = sheet.getRange(i, columns["Student"]).getValue();
        const grpToWrite = sheet.getRange(i, columns["Recent GRPs + PTYs"]).getValue();
        const lessonToWrite = sheet.getRange(i, columns["Preffered LSN Times"]).getValue();
        const cellToWrite = sheet.getRange(i, columns["Cell Phone"]).getValue();
        const emailToWrite = sheet.getRange(i, columns["Email"]).getValue();
        
        const cell = sheet.getRange(i, 2); // Column B
        const richText = cell.getRichTextValue();
        const url = richText ? richText.getLinkUrl() : null;

        // 🧠 Check for duplicate student
        let existingStudents = [];
        try {
          existingStudents = NFA_InventorySheet.getRange(
            NFA_StarterRow,
            NFA_Columns["Student"],
            NFA_InventorySheet.getLastRow() - NFA_StarterRow + 1
          ).getValues().flat();
        } catch (e) {
          Logger.log("⚠️ Error reading existing students: " + e);
        }

        if (existingStudents.includes(studentToWrite)) {
          Logger.log(`⚠️ Skipping duplicate: ${studentToWrite}`);
          continue;
        }

        // 🔄 Find first blank row to write into
        const maxRows = NFA_InventorySheet.getMaxRows();
        for (let j = NFA_StarterRow; j <= maxRows; j++) {
          const existingValue = NFA_InventorySheet.getRange(j, NFA_Columns["Student"]).getValue();
          if (!existingValue) {
            NFA_InventorySheet.getRange(j, NFA_Columns["Student"]).setFormula(`=HYPERLINK("${url}", "${studentToWrite}")`);
            NFA_InventorySheet.getRange(j, NFA_Columns["Recent GRPs + PTYs"]).setValue(grpToWrite);
            NFA_InventorySheet.getRange(j, NFA_Columns["Preffered LSN Times"]).setValue(lessonToWrite);
            NFA_InventorySheet.getRange(j, NFA_Columns["Cell Phone"]).setValue(cellToWrite);
            NFA_InventorySheet.getRange(j, NFA_Columns["Email"]).setValue(emailToWrite);

            for (let k = 0; k < lastLessons.length; k++) {
              if (lastLessons[k][0] === url) {
                NFA_InventorySheet.getRange(j, NFA_Columns["Last Lesson"]).setValue(lastLessons[k][1]);
              }
            }
            break; // ✅ Exit after writing to this row
          }
        }
      } else {
        Logger.log("❌ Column mapping for 'Student' is invalid.");
      }
    }
  }

  // ✅ Set checkboxes after data is written
  const dataRange = NFA_InventorySheet.getRange("A4:A" + NFA_InventorySheet.getLastRow());
  const values = dataRange.getValues();
  for (let m = 3; m <= 6; m++) {
    values.forEach((row, index) => {
      const rowIndex = index + 4;
      if (row[0]) {
        NFA_InventorySheet.getRange(rowIndex, m).insertCheckboxes();
      }
    });
  }
  sortNFAInventoryByLastLesson();
}

function sortNFAInventoryByLastLesson() {
  const startRow = NFA_StarterRow;
  const lastRow = NFA_InventorySheet.getLastRow();
  const numRows = lastRow - startRow + 1;

  const sortColumn = NFA_Columns["Last Lesson"]; // This should be the column number of "Last Lesson"

  if (sortColumn == null) {
    Logger.log("❌ Column mapping for 'Last Lesson' is invalid.");
    return;
  }

  // Sort the range by Last Lesson in descending order (most recent first)
  NFA_InventorySheet.getRange(startRow, 1, numRows, NFA_InventorySheet.getLastColumn())
       .sort({ column: sortColumn, ascending: true });

  Logger.log(`✅ Sorted NFA inventory by 'Last Lesson' starting at row ${startRow}.`);
}
