'use strict';

import { BrowserWindow, app, shell, Menu } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const browserWindow = new BrowserWindow({
    width: 620,
    height: 800,
    minWidth: 320,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true
    },
    backgroundColor: '#121212'
  });

  if (isDevelopment) {
    browserWindow.webContents.openDevTools();
  }

  if (isDevelopment) {
    browserWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    browserWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }

  browserWindow.on('closed', () => {
    mainWindow = null;
  });

  browserWindow.webContents.on('devtools-opened', () => {
    browserWindow.focus();
    setImmediate(() => {
      browserWindow.focus();
    });
  });

  // external links
  const handleExternal = (e, reqUrl) => {
    if(!reqUrl.startsWith(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)) {
      e.preventDefault();
      shell.openExternal(reqUrl);
    }
    else {
      browserWindow.webContents.webContents.loadURL(reqUrl);
    }
  }

  browserWindow.webContents.on('will-navigate', handleExternal)

  browserWindow.webContents.once('did-finish-load', () => {
    browserWindow.setMenuBarVisibility(false);
    Menu.setApplicationMenu(null)
  })

  return browserWindow;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});
