const { contextBridge, ipcRenderer } = require("electron");

// helpers
const {
  GET_WEB_APP_INFO_SUCCESS,
  GET_WEB_APP_INFO, SAVE_FILE,
  UPDATE_PROGRESS_BAR,
  OPEN_FILE,
  OPEN_PATH,
  FOCUS_MAIN_WINDOW,
  CLEAR_DATA,
  READ_XLSX
} = require("./utils/ipcEvents/ipcEventsKeys");

contextBridge.exposeInMainWorld("electronAPI", {
  getWebAppInfo: (payload) => ipcRenderer.send(GET_WEB_APP_INFO, payload),
  receiveWebAppInfo: (payload) => ipcRenderer.on(GET_WEB_APP_INFO_SUCCESS, payload),
  
  saveFile: (payload) => ipcRenderer.send(SAVE_FILE, payload),
  saveFileCallback: (payload) => ipcRenderer.on(SAVE_FILE, payload),

  readXlsx: (payload) => ipcRenderer.send(READ_XLSX, payload),
  readXlsxCallback: (payload) => ipcRenderer.on(READ_XLSX, payload),

  updateProgressBar: (payload) => ipcRenderer.send(UPDATE_PROGRESS_BAR, payload),
  openFile: (payload) => ipcRenderer.send(OPEN_FILE, payload),
  openPath: (payload) => ipcRenderer.send(OPEN_PATH, payload),
  focusMainWindow: () => ipcRenderer.send(FOCUS_MAIN_WINDOW),
  clearData: (callback) => ipcRenderer.on(CLEAR_DATA, callback),
});
