const { dialog } = require("electron");
const fs = require("fs");

// utils
const { readXlsx } = require("./readXlsx");


async function importFiles() {
  return await new Promise(async (resolve) => {
    const resp = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Excel files", extensions: ["xlsx", "xls"] }]
    });
  
    if (resp.filePaths.length > 0) {
      const files = resp.filePaths.map(filePath => fs.readFileSync(filePath).buffer);
  
      readXlsx({ data: files }, null, (payload) => resolve(payload));
    }
  })
}

module.exports = {
  importFiles
};
