// Take the README screenshots and the share image from the web build
// (npm run build-web first): node scripts/screenshots.mjs
//
// README/Desktop.png   1280x800 at 2x, with some saved formats
// README/Phone-1.png   375x667 at 2x, the settings and results
// README/Phone-2.png   the same, scrolled to the I/O tab with SDI
// public/social.png    1280x640 at 1x, the link preview image (also copied
//                      into web-build so a deploy straight after has it)
import { spawn } from 'node:child_process'
import { copyFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const root = new URL('../', import.meta.url).pathname
const PORT = 4175
const BASE = `http://localhost:${PORT}`

// 4K on the default processor's successor, with reduced blanking v2
const FORMAT = 'h=3840&v=2160&hz=50&m=0&rb=2&vo=0&b=8&p=e2gen2'
const SAVED = JSON.stringify([
  { name: 'Main LED wall', query: FORMAT },
  { name: 'IMAG side screens', query: 'h=2560&v=1440&hz=50&m=0&rb=2&vo=0&b=8&p=e2gen2' },
  { name: '', query: 'h=1920&v=1080&hz=50&m=0&rb=1&vo=0&b=10&p=e2gen2' },
])

const server = spawn(process.execPath, [`${root}scripts/serve.mjs`, String(PORT)], { stdio: 'ignore' })

// wait for the server to answer
for (let tries = 0; ; tries++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {}
  if (tries > 50) throw new Error('The web build server did not start (npm run build-web first)')
  await new Promise(resolve => setTimeout(resolve, 100))
}

const browser = await chromium.launch()

// a page showing the format, with the saved formats already there
async function open(options) {
  const context = await browser.newContext({ deviceScaleFactor: 2, colorScheme: 'dark', ...options })
  await context.addInitScript(saved => {
    try { localStorage.setItem('emcalc:saved', saved) } catch {}
  }, SAVED)
  const page = await context.newPage()
  await page.goto(`${BASE}/?${FORMAT}`)
  await page.getByText('433.356').first().waitFor()
  // let the fonts and animations settle
  await page.waitForTimeout(1500)
  return page
}

try {
  let page = await open({ viewport: { width: 1280, height: 800 } })
  await page.screenshot({ path: `${root}README/Desktop.png` })

  const phone = { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true }
  page = await open(phone)
  await page.screenshot({ path: `${root}README/Phone-1.png` })

  // the I/O tab, scrolled so the SDI rows show
  await page.getByText('I/O', { exact: true }).first().tap()
  const bitDepth = await page.getByText('Bit Depth').first().boundingBox()
  await page.evaluate(by => {
    const scrolls = (el) => el.scrollHeight > el.clientHeight + 10 &&
      (el === document.scrollingElement || /auto|scroll/.test(getComputedStyle(el).overflowY))
    const el = [document.scrollingElement, ...document.querySelectorAll('div')].find(scrolls)
    el.scrollTop += by
  }, bitDepth.y - 137)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${root}README/Phone-2.png` })

  page = await open({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 })
  await page.screenshot({ path: `${root}public/social.png` })
  await copyFile(`${root}public/social.png`, `${root}web-build/social.png`)

  console.log('Screenshots updated')
} finally {
  await browser.close()
  server.kill()
}
