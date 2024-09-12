const { Menu, app, dialog } = require("electron");

// helpers
const { importFiles } = require("./importFiles");
const { CLEAR_DATA, READ_XLSX } = require("./ipcEvents/ipcEventsKeys");


module.exports = function createMenu(isDev, win) {
  const template = [
    {
      label: app.name,
      submenu: [
        { label: "Імпортувати файл", click: () => importFiles().then(payload => win.webContents.send(READ_XLSX, payload)) },
        { label: "Видалити всі дані", click: () => win.webContents.send(CLEAR_DATA) },
        { type: "separator" },
        { label: "Завершити роботу", click: () => app.quit() }
      ],
    },
    isDev && { role: "viewMenu" },
    { role: "windowMenu" }
  ].filter(Boolean);

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
};
