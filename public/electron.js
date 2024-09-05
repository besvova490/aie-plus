/* eslint-disable init-declarations */
const { app, session } = require("electron");
require("dotenv").config();

// utils
const MainWindow = require("./utils/MainWindow");

// helpers
const appEventsHandler = require("./utils/appEventsHandler");
const ipcEvents = require("./utils/ipcEvents");
const createMenu = require("./utils/menu");

const isDev = process.env.NODE_ENV === "development";
let win;

async function createWindow() {
  console.log("Creating window", process.env.NODE_ENV);
  win = new MainWindow(isDev);
  
  await win.initialize();

  // prevent navigation to external websites
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wss://')) {
      event.preventDefault();
    }
  });

  // prevent internet access
  win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    // allow navigation to localhost
    if (details.url.startsWith('http://localhost')) {
      callback({});

      return;
    }

    if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
        callback({ cancel: true });
    } else {
        callback({});
    }
  });

  createMenu(isDev, win);
  appEventsHandler(app, win);
  ipcEvents(app, win);
}

app.whenReady().then(createWindow);
app.setAsDefaultProtocolClient("aie-plus");
