module.exports = (app, win) => {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }

    win = null;
  });
  
  app.on("open-url", function (event, url) {
    event.preventDefault();

    win.focus();
  });
};
