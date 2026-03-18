const ExcelJs = require('exceljs');
const path = require('path');

async function generateReport(data) {
  const workbook = new ExcelJs.Workbook();
  // console.log("Data received for report generation:", data);  
  const {role , name ,municipalityName} = data;
  
  await workbook.xlsx.readFile(
    path.join(__dirname, '../templates/report_template.xlsx')
  );

  const worksheet = workbook.getWorksheet('Report');
  const nameCell = worksheet.getCell('A8');
  nameCell.value = `NAME OF EMPLOYEE : ${name}`;
  nameCell.alignment = {
  horizontal: "center",
  vertical: "middle",
  };
  //  Now we need to make details for location month and year
  const detailsCell = worksheet.getCell('A5');
  detailsCell.value = ` DESIGNATION : ${role} MUNICIPALITY : ${municipalityName}    MONTH/YEAR : ${data.month}/${data.year}`;
  detailsCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  // crete Footer 
  const footerCell = worksheet.getCell('A42');
    footerCell.value = `Submitted By : ${name}  Signature    Executive Officer :  ${municipalityName}`;
  let startRow = 11; // because row 10 is header
  let nameRoleCell = worksheet.getCell('A2');
  data.days.forEach((item, index) => {
    // console.log('Processing item:', item);
    const rowNumber = startRow + index;
    const row = worksheet.getRow(rowNumber);

    // Column A → Date
    row.getCell('A').value = item.date;

    // Column B → Day
    row.getCell('B').value = item.day;
    
    // Column C → Description
    let description = '';

    if (item.status === 'OFF') {
      description = 'Govt Holiday';
    } else if (item.status === 'HOLIDAY') {
      description = item.holidayName || 'Holiday';
    } else if (item.status === 'ABSENT') {
      description = 'Absent';
    } else if (item.status === 'PRESENT') {
      description = item?.workSummary || '';
    } else {
      description = item.status;
    }
    const cell = row.getCell('C');

    cell.alignment = { wrapText: true , vertical: 'middle', horizontal: 'center' };
    const maxCharsPerLine = 35;
    const estimatedLines = Math.ceil(description.length / maxCharsPerLine);

    row.height = Math.max(20, estimatedLines * 18);
    row.getCell('C').value = description;

    row.commit();
  });

  return workbook;
}

module.exports = {
  generateReport,
};