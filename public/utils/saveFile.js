const fs = require("fs");

const saveFile = ({ file, title, type }, app, callback) => {
  const filePath = `${app.getPath("desktop")}/${title}.${type}`;

  fs.writeFile(filePath, file, () => callback(filePath));
};

module.exports = {
  saveFile
};
