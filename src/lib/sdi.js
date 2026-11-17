/**
 * SDI only carries fixed broadcast (SMPTE) formats with their own timings,
 * so a custom format can only go over SDI if it matches one of them.
 */

// progressive frame rates SDI carries
const RATES = [23.98, 24, 25, 29.97, 30, 50, 59.94, 60]

// active resolutions, with the lowest SDI interface that carries them
// at up to 30Hz and at 50/60Hz
const FORMATS = [
  { hPx: 1280, vPx: 720, name: '720p', upTo30: '3G', upTo60: '3G' },
  { hPx: 1920, vPx: 1080, name: '1080p', upTo30: '3G', upTo60: '3G' },
  { hPx: 2048, vPx: 1080, name: '2K 1080p', upTo30: '3G', upTo60: '3G' },
  { hPx: 3840, vPx: 2160, name: '2160p', upTo30: '12G', upTo60: '12G' },
  { hPx: 4096, vPx: 2160, name: '4K 2160p', upTo30: '12G', upTo60: '12G' },
]

// SDI interfaces in order of capacity: a higher one carries everything a lower one does
const LEVELS = ['3G', '12G']

/**
 * The broadcast format matching the given active pixels and refresh rate
 * @param {number|string} hPx - active horizontal pixels
 * @param {number|string} vPx - active vertical pixels
 * @param {number|string} refresh - refresh rate (Hz)
 * @returns {{name: string, level: string}|null} e.g. { name: '1080p59.94', level: '3G' }
 */
export function sdiFormat(hPx, vPx, refresh) {
  const format = FORMATS.find(f => f.hPx == hPx && f.vPx == vPx)
  const rate = RATES.find(r => Math.abs(r - Number(refresh)) < 0.01)

  if (!format || rate === undefined) {
    return null
  }

  return {
    name: format.name + rate,
    level: rate <= 30 ? format.upTo30 : format.upTo60,
  }
}

/**
 * Whether an SDI interface can carry the given format
 * @param {'3G'|'12G'} interfaceLevel
 * @param {{level: string}|null} format - from sdiFormat()
 */
export function sdiCarries(interfaceLevel, format) {
  return !!format && LEVELS.indexOf(format.level) <= LEVELS.indexOf(interfaceLevel)
}

/**
 * The smallest broadcast format an SDI interface carries that a smaller custom
 * format fits inside, so it can be sent within that raster without using the
 * whole canvas. Still needs a broadcast frame rate.
 * @param {number|string} hPx - active horizontal pixels
 * @param {number|string} vPx - active vertical pixels
 * @param {number|string} refresh - refresh rate (Hz)
 * @param {'3G'|'12G'} interfaceLevel
 * @returns {{name: string, level: string, hPx: number, vPx: number}|null}
 */
export function sdiContainer(hPx, vPx, refresh, interfaceLevel) {
  const rate = RATES.find(r => Math.abs(r - Number(refresh)) < 0.01)
  if (rate === undefined || !(hPx > 0 && vPx > 0)) return null

  const fits = FORMATS
    .filter(f => f.hPx >= hPx && f.vPx >= vPx)
    .map(f => ({ name: f.name + rate, level: rate <= 30 ? f.upTo30 : f.upTo60, hPx: f.hPx, vPx: f.vPx }))
    .filter(f => sdiCarries(interfaceLevel, f))
    .sort((a, b) => a.hPx * a.vPx - b.hPx * b.vPx)

  return fits[0] || null
}
