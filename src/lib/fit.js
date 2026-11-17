import edid from './edid.js'
import { connections, CONNECTORS } from './processors.js'

const calculator = new edid()

// Event Master's pixel grid: 8px except for reduced blanking v2 (1px)
const cell = (params) => params.redBlnk && params.redBlnkV == 2 ? 1 : 8

const calc = (params, hPx, vPx) => calculator.calcEdid({ ...params, hPx, vPx })

/**
 * The largest format with the same aspect ratio that passes a test, by
 * scaling the width down in steps of the pixel grid. The pixel clock only
 * grows with the width, so this searches rather than stepping one by one.
 * @param {Object} params - calcEdid params (hPx, vPx, refresh, margins, redBlnk, redBlnkV)
 * @param {function} fits - (result) => boolean
 * @param {number=} maxWidth - widest allowed
 * @returns {{hPx: number, vPx: number, result: Object}|null}
 */
export function largestSameAspect(params, fits, maxWidth = Infinity) {
  const hPx = Number(params.hPx)
  const vPx = Number(params.vPx)
  const step = cell(params)
  if (!(hPx > 0 && vPx > 0)) return null

  const at = (steps) => {
    const w = steps * step
    const h = Math.floor(w * vPx / hPx)
    return { hPx: w, vPx: h, result: calc(params, w, h) }
  }

  let lo = 0
  let hi = Math.floor(Math.min(hPx, maxWidth) / step)
  // binary search for the most steps that still fits
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const candidate = at(mid)
    if (candidate.vPx > 0 && fits(candidate.result)) lo = mid
    else hi = mid - 1
  }
  if (lo === 0) return null
  return at(lo)
}

// whether one of a processor's HDMI/DP/DVI inputs can take a format
const fitsOneInput = (processorId, bits) => (result) =>
  connections(result, processorId, bits).input.some(c => !CONNECTORS[c.key].sdi && c.ok)

/**
 * Ways to get a format into a processor when it's too much for one input:
 * the largest same-aspect format one input takes, and splitting it in half
 * across two inputs (an Ultrawide Input, Event Master 10.1 and later).
 * @param {Object} params - calcEdid params
 * @param {string} processorId
 * @param {number} bits - bits per colour component
 * @returns {null|{scaled: Object|null, split: Object|null}} null when it already fits
 */
export function fitSuggestions(params, processorId, bits = 8) {
  const fits = fitsOneInput(processorId, bits)
  if (fits(calc(params, params.hPx, params.vPx))) return null

  const scaled = largestSameAspect(params, fits)

  // each half on the pixel grid, at the full height
  const step = cell(params)
  const halfWidth = Math.floor(Number(params.hPx) / 2 / step) * step
  const half = calc(params, halfWidth, Number(params.vPx))
  const split = halfWidth > 0 && fits(half)
    ? { hPx: halfWidth, vPx: Number(params.vPx), result: half }
    : null

  return { scaled, split }
}
