import edid from './edid.js'
import { sdiCarries, sdiContainer, sdiFormat } from './sdi.js'

const calculator = new edid()

export const BIT_DEPTHS = [8, 10]

// DisplayPort's fixed data rate (Gbit/s after 8b/10b coding) caps the pixel
// clock at a given bit depth: 3 colour components per pixel
const DP_DATA_RATE = { dp11: 8.64, dp12: 17.28 }
const dpMaxClock = (key, bits) => DP_DATA_RATE[key] * 1000 / (3 * bits)

export const CONNECTORS = {
  dvid: { name: 'DVI-D', icon: 'dvi' },
  hdmi14: { name: 'HDMI 1.4', icon: 'hdmi' },
  hdmi20: { name: 'HDMI 2.0', icon: 'hdmi' },
  dp11: { name: 'DP 1.1', icon: 'dp' },
  dp12: { name: 'DP 1.2', icon: 'dp' },
  sdi3g: { name: '3G-SDI', icon: 'sdi', sdi: '3G' },
  sdi12g: { name: '12G-SDI', icon: 'sdi', sdi: '12G' },
}

/**
 * Event Master processors, each with its standard I/O cards' connectors.
 *
 * Each connector maps to its maximum pixel clock (MHz), or null for no limit
 * beyond the connector's own rules (edid.possConns). Figures are from Barco's
 * spec sheets: E2 (Jun 2023), E2 Gen 2 (Nov 2025), S3 Tri-combo Gen 2
 * (Nov 2026), Ex Tri-combo (Jul 2024) and Encore3 (Nov 2025).
 *
 * Ids are kept stable for share links (e2gen2 and tricombo date from 1.2.0).
 */
export const PROCESSORS = [
  {
    id: 'all',
    name: 'All processors',
    input: { dvid: null, hdmi14: null, hdmi20: null, dp11: null, dp12: null, sdi3g: null, sdi12g: null },
    output: { dvid: null, hdmi14: null, hdmi20: null, dp11: null, dp12: null, sdi3g: null, sdi12g: null },
  },
  {
    // Gen 1 cards top out at dual link (330MHz)
    id: 'gen1',
    name: 'E2 / S3-4K / Ex (Gen 1)',
    input: { dvid: 330, hdmi14: null, dp11: null, sdi3g: null },
    output: { hdmi14: null, sdi3g: null },
  },
  {
    id: 'e2gen2',
    name: 'E2 Gen 2',
    input: { hdmi20: 600, dp12: 600, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, dp12: 660, sdi3g: null, sdi12g: null },
  },
  {
    // the Tri-combo card's HDMI input is 550MHz; S3's output card has no DP
    id: 'tricombo',
    name: 'S3 Tri-combo Gen 2',
    input: { hdmi20: 550, dp12: 600, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, sdi3g: null, sdi12g: null },
  },
  {
    // the same Tri-combo input card; Ex's output card adds a DP 1.2 (4K60) output
    id: 'extricombo',
    name: 'Ex Tri-combo Gen 2',
    input: { hdmi20: 550, dp12: 600, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, dp12: 600, sdi3g: null, sdi12g: null },
  },
  {
    // Encore3 is natively 4K (one 4K scaler per layer rather than E2's four HD
    // ones), so takes less per connector: about 550MHz, though Barco say some
    // formats over that still work, so it's approximate
    id: 'encore3',
    name: 'Encore3',
    approximate: 'Encore3 takes about 550 MHz per input; check in Toolset',
    input: { hdmi20: 550, dp12: 550, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, dp12: 660, sdi3g: null, sdi12g: null },
  },
]

export const DEFAULT_PROCESSOR = 'all'

export const processorById = (id) =>
  PROCESSORS.find(p => p.id === id) || PROCESSORS.find(p => p.id === DEFAULT_PROCESSOR)

/**
 * Which of a processor's connectors can carry a calculated format
 * @param {Object} result - from edid.calcEdid()
 * @param {string} processorId
 * @param {number} bits - bits per colour component, 8 or 10
 * @returns {{input: Array, output: Array}} each entry { key, name, icon, ok, note },
 *   plus partial: true for SDI when the format fits inside a broadcast format
 */
export function connections(result, processorId, bits = 8) {
  const processor = processorById(processorId)
  const freq = Number(result.freq)
  const broadcast = sdiFormat(result.hActive, result.vActive, result.vRate)

  // HDMI carries deeper colour by clocking faster (10-bit is 1.25x), so check
  // its connector rules at that TMDS clock
  const tmdsClock = freq * bits / 8
  const atTmds = calculator.possConns(result.hActive, result.hTotal, tmdsClock)

  const list = (direction) => Object.entries(processor[direction]).map(([key, maxFreq]) => {
    const connector = CONNECTORS[key]

    if (connector.sdi) {
      const ok = sdiCarries(connector.sdi, broadcast)
      if (ok) return { key, ...connector, ok, note: broadcast.name }

      // not a broadcast format, but fits inside one without using the whole canvas
      const container = sdiContainer(result.hActive, result.vActive, result.vRate, connector.sdi)
      if (container && !broadcast) {
        return { key, ...connector, ok: false, partial: true, note: `Inside ${container.name} (${container.hPx} × ${container.vPx} canvas)` }
      }

      const note = broadcast ? `${broadcast.name} needs ${broadcast.level}-SDI` : 'Not a broadcast format'
      return { key, ...connector, ok, note }
    }

    let ok
    if (key.startsWith('hdmi')) {
      ok = atTmds[direction][key] && (maxFreq === null || tmdsClock <= maxFreq)
    } else {
      ok = result.possConns[direction][key] && (maxFreq === null || freq <= maxFreq)
      if (key.startsWith('dp')) ok = ok && freq <= dpMaxClock(key, bits)
      if (key === 'dvid') ok = ok && bits === 8 // DVI is 8-bit only
    }
    return { key, ...connector, ok, note: '' }
  })

  return { input: list('input'), output: list('output') }
}

const GEN1_TOO_HIGH = 'Pixel Clock too high for all Gen 1 Cards'

/**
 * The notes under the connector capacity and pixel clock, for the chosen processor.
 * All processors keeps the general connector notes; a processor describes what
 * its own inputs can take instead, so e.g. Gen 2 doesn't warn about Gen 1.
 * @param {Object} result - from edid.calcEdid()
 * @param {string} processorId
 * @param {{input: Array}} conns - from connections()
 * @returns {{linksNote: string, linksWarn: boolean, freqNote: string, freqWarn: boolean}}
 */
export function capacityNotes(result, processorId, conns) {
  const tooHigh = /too high/i

  if (processorById(processorId).id === 'all') {
    return {
      linksNote: result.linksNote,
      linksWarn: tooHigh.test(result.linksNote),
      freqNote: result.freqNote,
      freqWarn: Number(result.freq) > 660,
    }
  }

  // Gen 1's limit only matters on Gen 1 processors; elsewhere it's 4K bandwidth
  const linksNote = result.linksNote === GEN1_TOO_HIGH && processorId !== 'gen1'
    ? '4K Signal Bandwidth'
    : result.linksNote

  // SDI depends on the broadcast format, not the pixel clock
  const inputs = conns.input.filter(c => !CONNECTORS[c.key].sdi)
  const supported = inputs.filter(c => c.ok)

  let freqNote = ''
  if (supported.length === 0) {
    // name the connector types, as SDI doesn't depend on the pixel clock
    const types = [...new Set(inputs.map(c => c.name.split(/[- ]/)[0]))]
    const list = types.length > 1 ? `${types.slice(0, -1).join(', ')} and ${types.at(-1)}` : types[0]
    freqNote = `Too high for this processor's ${list} inputs`
  } else if (supported.length < inputs.length) {
    freqNote = `${supported.map(c => c.name).join(' & ')} input only`
  }

  // near an approximate limit, say so
  const processor = processorById(processorId)
  if (processor.approximate && supported.length < inputs.length) {
    freqNote += `. ${processor.approximate}`
  }

  return {
    linksNote,
    linksWarn: tooHigh.test(linksNote),
    freqNote,
    freqWarn: supported.length === 0,
  }
}
