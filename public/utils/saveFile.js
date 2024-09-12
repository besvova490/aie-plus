const { dialog } = require("electron");
const fs = require("fs");

const saveFile = async ({ file, title, type }, app, callback) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save',
    defaultPath: `${app.getPath("desktop")}/${title}.${type}`,
  });

  console.log("filePath", filePath);
  if (filePath) {
    try {
      fs.writeFile(filePath, file);

      console.log("filePath", filePath);
      return callback(filePath);
    } catch (error) {
      return callback(null);
    }
  }
};

module.exports = {
  saveFile
};
