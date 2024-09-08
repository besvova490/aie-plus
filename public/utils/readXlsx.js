const xlsx = require('xlsx');

const readXlsx = ({ data }, _, callback) => {
  const sheets = data.map(buffer => {
    const workbook = xlsx.readFile(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    return workbook.Sheets[sheetName];
  })

  callback({ sheets });
}

module.exports = {
  readXlsx
};
