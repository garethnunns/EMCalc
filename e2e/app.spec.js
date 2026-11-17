import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

// fail on anything the page throws or logs as an error
const errors = new WeakMap()

test.beforeEach(async ({ page }) => {
  errors.set(page, [])
  page.on('pageerror', e => errors.get(page).push(e.message))
  page.on('console', m => m.type() === 'error' && errors.get(page).push(m.text()))
})

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([])
})

const width = (page) => page.getByLabel('Width', { exact: true })

test('loads with the default format', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/EM Calc/)
  await expect(width(page)).toHaveValue('2560')
  await expect(page.getByLabel('Height', { exact: true })).toHaveValue('2000')
  await expect(page.getByText('325.828')).toBeVisible()
  await expect(page.getByRole('tab')).toHaveText(['Timing', 'I/O', 'Mac'])
})

test('reads a share link and recalculates as you type', async ({ page }) => {
  await page.goto('/?h=1920&v=1080&hz=60&rb=1')
  await expect(width(page)).toHaveValue('1920')
  await expect(page.getByText('138.500')).toBeVisible()

  await width(page).fill('1280')
  await page.getByLabel('Height', { exact: true }).fill('720')
  await expect(page.getByText('64.000')).toBeVisible()
  await expect(page).toHaveURL(/h=1280&v=720/)
})

test('switches between the results tabs', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('H Total')).toBeVisible()

  await page.getByRole('tab', { name: 'I/O' }).click()
  await expect(page.getByText('Connector', { exact: true })).toBeVisible()
  await expect(page.getByText('DP 1.2')).toBeVisible()

  await page.getByRole('tab', { name: 'Mac' }).click()
  await expect(page.getByText('Scaled')).toBeVisible()
  await expect(page.getByText('Each connector')).toBeVisible()

  await page.getByRole('tab', { name: 'Timing' }).click()
  await expect(page.getByText('H Total')).toBeVisible()
})

test('suggests a format that fits when it is too much for one input', async ({ page }) => {
  await page.goto('/?h=7680&v=2160&hz=60&rb=2&p=e2gen2')
  const fit = page.getByRole('region', { name: 'Fitting this format' })
  await expect(fit).toBeVisible()

  await fit.getByRole('button', { name: /^Use / }).click()
  await expect(fit).toBeHidden()
  expect(Number(await width(page).inputValue())).toBeLessThan(7680)
})

const download = async (page) => {
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download EDID file' }).click(),
  ])
  return { name: file.suggestedFilename(), bytes: [...await readFile(await file.path())] }
}

const sum = (bytes) => bytes.reduce((a, b) => a + b, 0) % 256

test('downloads an EDID file', async ({ page }) => {
  await page.goto('/?h=3840&v=2160&hz=60&rb=2')
  const { name, bytes } = await download(page)
  expect(name).toBe('EMCalc-3840x2160-60Hz.bin')
  expect(bytes.length).toBe(128)
  expect(bytes.slice(0, 8)).toEqual([0, 255, 255, 255, 255, 255, 255, 0])
  expect(sum(bytes)).toBe(0)
  await expect(page.getByText('EDID saved', { exact: true })).toBeVisible()
})

test('adds DisplayID to the EDID for formats over 4096 wide', async ({ page }) => {
  await page.goto('/?h=7680&v=2160&hz=60&rb=2')
  const { bytes } = await download(page)
  expect(bytes.length).toBe(256)
  expect(bytes[128]).toBe(0x70)
  expect(sum(bytes.slice(0, 128))).toBe(0)
  expect(sum(bytes.slice(128))).toBe(0)
  await expect(page.getByText(/for devices without DisplayID/)).toBeVisible()
})

test('saves formats, and keeps them after a reload', async ({ page }) => {
  await page.goto('/?h=3840&v=2160&hz=50&rb=2')
  await expect(page.getByText(/Save formats you use often/)).toBeVisible()

  await page.getByLabel('Name for this format').fill('Main wall')
  await page.getByRole('button', { name: 'Save' }).click()
  const saved = page.getByRole('list', { name: 'Saved formats' })
  await expect(saved.getByText('Main wall')).toBeVisible()
  await expect(saved.getByText('3840 × 2160 @ 50 · RB v2')).toBeVisible()

  // change the format, then go back to the saved one
  await width(page).fill('1920')
  await page.getByLabel('Height', { exact: true }).fill('1080')
  await page.getByRole('button', { name: 'Use Main wall' }).click()
  await expect(width(page)).toHaveValue('3840')

  await page.reload()
  await expect(saved.getByText('Main wall')).toBeVisible()

  await page.getByRole('button', { name: 'Remove Main wall' }).click()
  await expect(page.getByText(/Save formats you use often/)).toBeVisible()
})

test('fits the window without scrolling sideways', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('325.828')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
