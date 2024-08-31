const fs = require("fs");

const saveFile = ({ data, title }, app, callback) => {
  // const fields = ["userId", "event", "country", "page", "isMobile", "browserInfo", "data"];
  // const opts = { fields };

  // const parser = new Parser(opts);
  // const csv = parser.parse(data);
  console.log(data);

  const filePath = `${app.getPath("desktop")}/${title}.csv`;

  fs.writeFile(filePath, csv, () => callback(filePath));
};

module.exports = {
  saveFile
};
