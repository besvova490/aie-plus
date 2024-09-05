const xlsx = require('xlsx');

const readXlsx = ({ data }, _, callback) => {
  const workbook = xlsx.readFile(data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  callback({ sheet });
}

module.exports = {
  readXlsx
};
