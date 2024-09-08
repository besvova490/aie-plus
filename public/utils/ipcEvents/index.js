const { ipcMain, shell } = require("electron");

// helpers
const getWebAppInfo = require("./getWebAppInfo");
const { saveFile } = require("../saveFile");
const { readXlsx } = require("../readXlsx");
const {
  GET_WEB_APP_INFO,
  GET_WEB_APP_INFO_SUCCESS,
  UPDATE_PROGRESS_BAR,
  SAVE_FILE,
  OPEN_FILE,
  OPEN_PATH,
  FOCUS_MAIN_WINDOW,
  READ_XLSX,
} = require("./ipcEventsKeys");

module.exports = (app, win) => {
  ipcMain.on(
    GET_WEB_APP_INFO,
    (_, url) => getWebAppInfo(url, payload => win.webContents.send(GET_WEB_APP_INFO_SUCCESS, payload))
  );

  ipcMain.on(
    UPDATE_PROGRESS_BAR,
    (_, progress) => win.setProgressBar(progress)
  );

  ipcMain.on(
    SAVE_FILE,
    (_, data) => saveFile(data, app, (payload) => win.webContents.send(SAVE_FILE, payload))
  );

  ipcMain.on(
    OPEN_FILE,
    (_, { path }) => shell.openPath(path)
  );

  ipcMain.on(
    OPEN_PATH,
    (_, { path }) => shell.showItemInFolder(path)
  );

  ipcMain.on(
    FOCUS_MAIN_WINDOW,
    () => !win.isVisible() && win.focus()
  );

  ipcMain.on(
    READ_XLSX,
    (_, data) => readXlsx(data, app, (payload) => win.webContents.send(READ_XLSX, payload))
  );
};
