import edid from './edid.js'
import { largestSameAspect } from './fit.js'

/**
 * An EDID file for a custom format, to load into something that sends it,
 * e.g. BetterDisplay on a Mac, Custom Resolution Utility on Windows or an
 * EDID emulator.
 *
 * The base block (EDID 1.4) holds the format as its preferred detailed
 * timing. A detailed timing only goes up to 4095 pixels and 655.35 MHz, so
 * bigger formats go in a DisplayID 1.3 extension block instead, and the base
 * block falls back to the largest same-aspect format it can hold.
 */

const calculator = new edid()

// "GNC" (GN Calc), packed as three 5-bit letters
const MANUFACTURER = 'GNC'

// sRGB primaries and white point, as EDID stores them
const SRGB_CHROMATICITY = [0xee, 0x91, 0xa3, 0x54, 0x4c, 0x99, 0x26, 0x0f, 0x50, 0x54]

// what a detailed timing descriptor's fields hold
const DTD_LIMITS = {
  clock: 65535, // 10 kHz
  hActive: 4095, hBlank: 4095, vActive: 4095, vBlank: 4095,
  hFrontPorch: 1023, hSync: 1023, vFrontPorch: 63, vSync: 63,
}

// DisplayID aspect ratio codes
const ASPECTS = [[1, 1, 0], [5, 4, 1], [4, 3, 2], [15, 9, 3], [16, 9, 4], [16, 10, 5], [64, 27, 6], [256, 135, 7]]

/**
 * A calculated format as the timings an EDID holds. The margins (CVT
 * borders) are black, so they're folded into the blanking either side.
 * @param {Object} result - from edid.calcEdid
 */
export function timing(result) {
  const hBorder = result.hBorder || 0
  const vBorder = result.vBorder || 0
  const clock = Math.round(Number(result.freq) * 100) // 10 kHz
  const t = {
    clock,
    hActive: result.hActive,
    hBlank: result.hTotal - result.hActive,
    hFrontPorch: result.hFrontPorch + hBorder,
    hSync: result.hSync,
    hPositive: !!result.hPolarity,
    vActive: result.vActive,
    vBlank: result.vTotal - result.vActive,
    vFrontPorch: result.vFrontPorch + vBorder,
    vSync: result.vSync,
    vPositive: !!result.vPolarity,
  }
  t.hTotal = t.hActive + t.hBlank
  t.vTotal = t.vActive + t.vBlank
  t.hRate = clock * 10 / t.hTotal // kHz
  t.vRate = clock * 10000 / (t.hTotal * t.vTotal) // Hz
  return t
}

/** Whether a detailed timing descriptor can hold a timing */
export const fitsDtd = (t) => Object.entries(DTD_LIMITS).every(([key, max]) => t[key] >= 0 && t[key] <= max)

const checksum = (bytes) => (256 - bytes.reduce((sum, b) => sum + b, 0) % 256) % 256

const word = (n) => [n & 0xff, (n >> 8) & 0xff]

/** An 18-byte detailed timing descriptor */
function dtd(t) {
  return [
    ...word(t.clock),
    t.hActive & 0xff, t.hBlank & 0xff, ((t.hActive >> 8) << 4) | (t.hBlank >> 8),
    t.vActive & 0xff, t.vBlank & 0xff, ((t.vActive >> 8) << 4) | (t.vBlank >> 8),
    t.hFrontPorch & 0xff, t.hSync & 0xff, ((t.vFrontPorch & 0xf) << 4) | (t.vSync & 0xf),
    ((t.hFrontPorch >> 8) << 6) | ((t.hSync >> 8) << 4) | ((t.vFrontPorch >> 4) << 2) | (t.vSync >> 4),
    0, 0, 0, // image size not given
    0, 0, // no borders
    // digital separate sync, with each polarity
    0x18 | (t.vPositive ? 0x04 : 0) | (t.hPositive ? 0x02 : 0),
  ]
}

/** Display range limits covering every timing */
function rangeLimits(timings) {
  const vMin = Math.max(1, Math.floor(Math.min(...timings.map(t => t.vRate))))
  const vMax = Math.ceil(Math.max(...timings.map(t => t.vRate)))
  const hMin = Math.max(1, Math.floor(Math.min(...timings.map(t => t.hRate))))
  const hMax = Math.ceil(Math.max(...timings.map(t => t.hRate)))
  // in 10 MHz steps, above the fastest clock
  const clockMax = Math.min(255, Math.floor(Math.max(...timings.map(t => t.clock)) / 1000) + 1)

  // values over 255 are stored less 255, flagged in byte 4
  const offset = (min, max) => min > 255 ? 3 : max > 255 ? 2 : 0
  const store = (n) => Math.min(255, n > 255 ? n - 255 : n)
  const vOffset = offset(vMin, vMax)
  const hOffset = offset(hMin, hMax)
  return [
    0, 0, 0, 0xfd, vOffset | (hOffset << 2),
    vOffset === 3 ? store(vMin) : Math.min(vMin, 255), store(vMax),
    hOffset === 3 ? store(hMin) : Math.min(hMin, 255), store(hMax),
    clockMax,
    0x01, // range limits only
    0x0a, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
  ]
}

/** A display product name descriptor (up to 13 characters) */
function productName(name) {
  const text = [...name.slice(0, 13)].map(c => c.charCodeAt(0) & 0x7f)
  if (text.length < 13) text.push(0x0a)
  while (text.length < 13) text.push(0x20)
  return [0, 0, 0, 0xfc, 0, ...text]
}

const DUMMY = [0, 0, 0, 0x10, 0, ...Array(13).fill(0)]

// a 16-bit product code from the timing, so each format has its own
function productCode(t) {
  let hash = 0
  for (const n of [t.clock, t.hActive, t.hBlank, t.vActive, t.vBlank]) hash = (hash * 31 + n) >>> 0
  return (hash ^ (hash >>> 16)) & 0xffff
}

/** The 128-byte base block */
function baseBlock({ preferred, extensions, bits, year, name, all }) {
  const m = [...MANUFACTURER].map(c => c.charCodeAt(0) - 64)
  const bytes = [
    0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00,
    ((m[0] << 2) | (m[1] >> 3)), (((m[1] & 0x7) << 5) | m[2]),
    ...word(productCode(preferred)),
    0, 0, 0, 0, // no serial number
    0xff, Math.max(0, Math.min(255, year - 1990)), // model year
    1, 4, // EDID 1.4
    0x80 | (bits === 10 ? 0x40 : 0x30), // digital, bits per colour
    0, 0, // size not given
    120, // gamma 2.2
    0x06, // sRGB, RGB 4:4:4, preferred timing is native
    ...SRGB_CHROMATICITY,
    0, 0, 0, // no established timings
    ...Array(8).fill([0x01, 0x01]).flat(), // no standard timings
    ...dtd(preferred),
    ...rangeLimits(all),
    ...productName(name),
    ...DUMMY,
    extensions,
  ]
  return [...bytes, checksum(bytes)]
}

/** A DisplayID 1.3 extension block with one Type I timing, marked preferred */
function displayIdBlock(t) {
  const aspect = ASPECTS.find(([w, h]) => t.hActive * h === t.vActive * w)?.[2] ?? 8
  const less1 = (n) => word(n - 1)
  const timingBlock = [
    0x03, 0x00, 20, // Type I detailed timing, 20 bytes
    ...[t.clock - 1].flatMap(n => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff]),
    0x80 | aspect, // preferred
    ...less1(t.hActive),
    ...less1(t.hBlank),
    ...word((t.hFrontPorch - 1) | (t.hPositive ? 0x8000 : 0)),
    ...less1(t.hSync),
    ...less1(t.vActive),
    ...less1(t.vBlank),
    ...word((t.vFrontPorch - 1) | (t.vPositive ? 0x8000 : 0)),
    ...less1(t.vSync),
  ]
  // version 1.3, length, product type (repeater/translator, like a video processor), no extensions
  const section = [0x13, timingBlock.length, 0x05, 0x00, ...timingBlock]
  const bytes = [0x70, ...section, checksum(section)]
  while (bytes.length < 127) bytes.push(0)
  return [...bytes, checksum(bytes)]
}

/**
 * Build the EDID for a format
 * @param {Object} params - calcEdid params
 * @param {Object=} options
 * @param {number=} options.bits - bits per colour component
 * @param {number=} options.year - model year
 * @returns {{bytes: Uint8Array, displayId: boolean, fallback: Object|null, clock: number, fileName: string}|null}
 *   clock is the pixel clock stored (MHz); fallback is the base block's
 *   format when the full one needs DisplayID; null when nothing fits
 */
export function buildEdid(params, { bits = 8, year = new Date().getFullYear() } = {}) {
  const result = calculator.calcEdid(params)
  const t = timing(result)
  if (!(t.hActive > 0 && t.vActive > 0 && t.clock > 0)) return null

  // the product name holds 13 characters, so drop the refresh rate if it won't fit
  const size = `${t.hActive}x${t.vActive}`
  const name = `${size}@${params.refresh}`.length <= 13 ? `${size}@${params.refresh}` : size.slice(0, 13)
  const fileName = `EMCalc-${size}-${params.refresh}Hz.bin`

  if (fitsDtd(t)) {
    return {
      bytes: Uint8Array.from(baseBlock({ preferred: t, extensions: 0, bits, year, name, all: [t] })),
      displayId: false,
      fallback: null,
      clock: t.clock / 100,
      fileName,
    }
  }

  const largest = largestSameAspect(params, (r) => fitsDtd(timing(r)))
  if (!largest) return null
  // a tidier size for the fallback: a multiple of 8 wide, an even height
  const w = Math.max(8, Math.floor(largest.hPx / 8) * 8)
  const h = Math.max(2, Math.floor(w * Number(params.vPx) / Number(params.hPx) / 2) * 2)
  const tidy = timing(calculator.calcEdid({ ...params, hPx: w, vPx: h }))
  const base = fitsDtd(tidy) ? tidy : timing(largest.result)
  return {
    bytes: Uint8Array.from([
      ...baseBlock({ preferred: base, extensions: 1, bits, year, name, all: [t, base] }),
      ...displayIdBlock(t),
    ]),
    displayId: true,
    fallback: { hPx: base.hActive, vPx: base.vActive },
    clock: t.clock / 100,
    fileName,
  }
}
