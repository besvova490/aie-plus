const { dialog } = require("electron");
const fs = require("fs");

const saveFile = async ({ file, title, type }, app, callback) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save',
    defaultPath: `${app.getPath("desktop")}/${title}.${type}`,
  });

  if (filePath) {
    try {
      fs.writeFile(filePath, file, () => null);

      return callback(filePath);
    } catch (error) {
      console.log("error", error);
      return callback(null);
    }
  }
};

module.exports = {
  saveFile
};
