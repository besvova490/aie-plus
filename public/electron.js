/* eslint-disable init-declarations */
const { app } = require("electron");
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

  createMenu(isDev, win);
  appEventsHandler(app, win);
  ipcEvents(app, win);
}

app.whenReady().then(createWindow);
app.setAsDefaultProtocolClient("aie-plus");
