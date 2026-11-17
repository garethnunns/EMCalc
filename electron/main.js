'use strict'

const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

// The desktop app serves the exported web build (yarn build-web) over a
// custom app:// scheme so the absolute /_expo/... asset paths resolve.
// Set ELECTRON_START_URL (e.g. http://localhost:8081) to point at the
// Expo dev server instead.
const WEB_ROOT = path.join(__dirname, '..', 'web-build')
const START_URL = process.env.ELECTRON_START_URL || 'app://emcalc/'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
])

Menu.setApplicationMenu(null)

function serveWebBuild(request) {
  const { pathname } = new URL(request.url)
  const file = path.normalize(path.join(WEB_ROOT, decodeURIComponent(pathname)))

  if (!file.startsWith(WEB_ROOT)) {
    return new Response('Not found', { status: 404 })
  }

  const target = pathname.endsWith('/') ? path.join(file, 'index.html') : file
  return net.fetch(pathToFileURL(target).toString())
}

function isAppUrl(url) {
  return url.startsWith(START_URL)
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 620,
    height: 800,
    minWidth: 320,
    minHeight: 400,
    backgroundColor: '#121212',
    autoHideMenuBar: true,
    show: false,
  })

  // links (Linking.openURL opens a new window on web) go to the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  win.once('ready-to-show', () => win.show())

  if (!app.isPackaged && process.env.ELECTRON_START_URL) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  win.loadURL(START_URL)
  return win
}

app.whenReady().then(() => {
  protocol.handle('app', serveWebBuild)
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => app.quit())
