import { largestSameAspect } from './fit.js'
import { connections, processorById } from './processors.js'
import edid from './edid.js'

/**
 * Sending a custom format from an Apple silicon Mac to Event Master.
 *
 * Rules are similar to those on OmniCalc by Omnicon Pro
 * (omniconpro.com/omnicalc): how wide a Mac will output over one connector
 * depends on its chip, macOS and whether BetterDisplay is used to load the EDID.
 */

const calculator = new edid()

export const MAC_MODELS = [
  { id: 'mbp', name: 'MacBook Pro', chips: ['M1', 'M1 Pro', 'M1 Max', 'M2', 'M2 Pro', 'M2 Max', 'M3', 'M3 Pro', 'M3 Max', 'M4', 'M4 Pro', 'M4 Max', 'M5'] },
  { id: 'studio', name: 'Mac Studio', chips: ['M1 Max', 'M1 Ultra', 'M2 Max', 'M2 Ultra', 'M3 Ultra', 'M4 Max'] },
  { id: 'pro', name: 'Mac Pro', chips: ['M2 Ultra'] },
  { id: 'mini', name: 'Mac mini', chips: ['M1', 'M2', 'M2 Pro', 'M4', 'M4 Pro'] },
]

// macOS versions in order, and the first each chip generation runs
export const MACOS = [
  { id: '12', name: 'Monterey (12)' },
  { id: '13', name: 'Ventura (13)' },
  { id: '14', name: 'Sonoma (14)' },
  { id: '15', name: 'Sequoia (15)' },
  { id: '26', name: 'Tahoe (26)' },
]
const FIRST_MACOS = { M1: '12', M2: '13', M3: '14', M4: '15', M5: '26' }

// how the Mac connects to Event Master: the input connector it uses, and
// whether it splits the format across two (DisplayID tiling)
export const MAC_CONNECTIONS = [
  { id: 'dp12', name: 'DP 1.2', connector: 'dp12' },
  { id: 'dp11', name: 'DP 1.1', connector: 'dp11' },
  { id: 'hdmi20', name: 'HDMI 2.0', connector: 'hdmi20' },
  { id: 'hdmi14', name: 'HDMI 1.4', connector: 'hdmi14' },
  { id: 'dual', name: '2× DP 1.2', connector: 'dp12', dual: true },
  { id: 'dvid', name: 'DVI-D', connector: 'dvid' },
]

const connectionById = (id) => MAC_CONNECTIONS.find(c => c.id === id)

/**
 * The connections a processor's inputs offer: its best DP and HDMI, then two
 * DP 1.2 cables if it has DP 1.2, otherwise DVI-D
 * @param {string} processorId
 */
export function macConnectionsFor(processorId) {
  const inputs = Object.keys(processorById(processorId).input)
  const has = (key) => inputs.includes(key)
  return [
    has('dp12') ? 'dp12' : has('dp11') ? 'dp11' : null,
    has('hdmi20') ? 'hdmi20' : has('hdmi14') ? 'hdmi14' : null,
    has('dp12') ? 'dual' : has('dvid') ? 'dvid' : null,
  ].filter(Boolean).map(connectionById)
}

/**
 * The connection to use with a processor: the chosen one if it has it, or
 * the equivalent it does have (e.g. DP 1.1 for DP 1.2), or its first
 * @param {string} connection - chosen connection id
 * @param {string} processorId
 */
export function macConnectionFor(connection, processorId) {
  const available = macConnectionsFor(processorId)
  const family = (id) => id === 'dual' ? 'dual' : id.replace(/\d+$/, '')
  return available.find(c => c.id === connection)
    || available.find(c => family(c.id) === family(connection))
    || available[0]
}

// displays each Mac drives, including a built-in one where it has one
const MAX_DISPLAYS = {
  mbp: { M1: 1, 'M1 Pro': 2, 'M1 Max': 4, M2: 1, 'M2 Pro': 2, 'M2 Max': 4, M3: 2, 'M3 Pro': 2, 'M3 Max': 4, M4: 2, 'M4 Pro': 2, 'M4 Max': 4, M5: 2 },
  studio: { 'M1 Max': 5, 'M1 Ultra': 5, 'M2 Max': 5, 'M2 Ultra': 8, 'M3 Ultra': 8, 'M4 Max': 5 },
  pro: { 'M2 Ultra': 6 },
  mini: { M1: 2, M2: 2, 'M2 Pro': 3, M4: 3, 'M4 Pro': 3 },
}

export const MAC_DEFAULTS = { model: 'mbp', chip: 'M4 Pro', macos: '26', connection: 'dp12', betterDisplay: false }

const generation = (chip) => chip.split(' ')[0]

export const modelById = (id) => MAC_MODELS.find(m => m.id === id) || MAC_MODELS[0]

/** macOS versions a chip runs */
export const macosFor = (chip) => {
  const first = FIRST_MACOS[generation(chip)]
  return MACOS.slice(MACOS.findIndex(v => v.id === first))
}

/** Keep a Mac setup valid: a chip the model has, a macOS the chip runs */
export function validMac(mac) {
  const model = modelById(mac.model)
  const chip = model.chips.includes(mac.chip) ? mac.chip : model.chips.at(-1)
  const versions = macosFor(chip)
  const macos = versions.some(v => v.id === mac.macos) ? mac.macos : versions.at(-1).id
  const connection = MAC_CONNECTIONS.some(c => c.id === mac.connection) ? mac.connection : 'dp12'
  return { model: model.id, chip, macos, connection, betterDisplay: !!mac.betterDisplay }
}

/**
 * Widest a Mac will output to one display, in pixels
 * @param {Object} mac - { chip, macos, connection, betterDisplay }
 */
export function macMaxWidth({ chip, macos, connection, betterDisplay }) {
  if (['hdmi20', 'hdmi14', 'dvid'].includes(connection)) return 4096
  if (connection === 'dual') return 6144
  if (generation(chip) === 'M1') return macos === '12' ? 8192 : 6144 // BetterDisplay doesn't help M1
  if (betterDisplay) return macos === '26' ? 8192 : 7680
  return 6144
}

/** BetterDisplay can't raise the M1's limit */
export const betterDisplayHelps = (chip) => generation(chip) !== 'M1'

export const maxDisplays = (model, chip) => MAX_DISPLAYS[model]?.[chip] ?? null

// Keynote's largest canvas, and PowerPoint's (4032px at 72dpi, as inches)
const scaleWithin = (w, h, max) => { const s = Math.min(1, max / w, max / h); return [Math.floor(w * s), Math.floor(h * s)] }
export const keynoteCanvas = (w, h) => scaleWithin(w, h, 8192)
export const powerPointCanvas = (w, h) => scaleWithin(w, h, 4032).map(px => +(px / 72).toFixed(2))

/**
 * Whether a Mac can send a format to the chosen Event Master processor, and
 * if not the largest same-aspect format it can
 * @param {Object} params - calcEdid params
 * @param {Object} mac - Mac setup
 * @param {string} processorId
 * @param {number} bits
 */
export function macFit(params, mac, processorId, bits = 8) {
  // use a connection the processor has
  const connection = macConnectionFor(validMac(mac).connection, processorId)
  const maxWidth = macMaxWidth({ ...validMac(mac), connection: connection.id })
  const dual = !!connection.dual
  const connector = connection.connector

  // a format fits when the processor's input for that connector takes it
  // (for two cables, each half does)
  const takes = (result) => connections(result, processorId, bits).input.some(c => c.key === connector && c.ok)
  const fits = (result) => {
    if (result.hActive > maxWidth) return false
    if (!dual) return takes(result)
    const half = calculator.calcEdid({ ...params, hPx: Math.floor(result.hActive / 2), vPx: result.vActive })
    return takes(half)
  }

  const full = calculator.calcEdid(params)
  const ok = fits(full)
  const best = ok ? { hPx: full.hActive, vPx: full.vActive, result: full } : largestSameAspect(params, fits, maxWidth)
  const connectorAvailable = connections(full, processorId, bits).input.some(c => c.key === connector)
  const connectorName = connectionById(connector).name

  let reason = ''
  if (!connectorAvailable) reason = `This processor has no ${connectorName} input`
  else if (full.hActive > maxWidth) reason = `Wider than this Mac sends (${maxWidth}px)`
  else if (!ok) reason = `Too much for the processor's ${connectorName} input${dual ? 's' : ''}`

  return {
    ok,
    reason,
    connection: connection.id,
    maxWidth,
    connectorAvailable,
    best,
    perCable: dual && best ? [Math.floor(best.hPx / 2), best.vPx] : null,
  }
}
