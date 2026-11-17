'use strict'

const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

// The desktop app serves the exported web build (npm run build-web) over a
// custom app:// scheme so the absolute /_expo/... asset paths resolve.
// Set ELECTRON_START_URL (e.g. http://localhost:8081) to point at the
// Expo dev server instead.
const WEB_ROOT = path.join(__dirname, '..', 'web-build')
const START_URL = process.env.ELECTRON_START_URL || 'app://emcalc/'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
])

const isMac = process.platform === 'darwin'

// With the title bar hidden, the top bar moves the window (its buttons stay
// clickable) and the logo makes room for the window buttons, keeping its
// space so the title stays centred
const MAC_TOP_BAR_CSS = `
  #appbar { -webkit-app-region: drag; }
  #appbar [role=button], #appbar button { -webkit-app-region: no-drag; }
  #appbar-logo { visibility: hidden; }
`

// macOS only routes Cmd+C, Cmd+V, Cmd+A and undo to text fields through the
// Edit menu, so give it the standard menus. Elsewhere keep the window menu-less.
if (isMac) {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'windowMenu' },
  ]))
} else {
  Menu.setApplicationMenu(null)
}

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
    // tall enough to always show the top of the results (connector capacity
    // and pixel clock) in the single column layout, measured as the content
    // so the Windows/Linux title bar doesn't eat into it
    useContentSize: true,
    minWidth: 320,
    minHeight: 580,
    backgroundColor: '#121212',
    autoHideMenuBar: true,
    show: false,
    title: 'EM Calc',
    // on macOS, no title bar: the window buttons sit in the app's top bar
    ...(isMac && {
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 18, y: 21 },
    }),
  })

  if (isMac) {
    win.webContents.on('dom-ready', () => win.webContents.insertCSS(MAC_TOP_BAR_CSS))
  }

  // keep the short name rather than the website's longer page title
  win.on('page-title-updated', (event) => event.preventDefault())

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
