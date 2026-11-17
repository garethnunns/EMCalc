import { sdiCarries, sdiFormat } from './sdi.js'

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
 * Event Master processors grouped by the generation of I/O cards they take,
 * as the connectors and their limits come from the cards.
 *
 * Each connector maps to its maximum pixel clock (MHz) on those cards, or null
 * for no limit beyond the connector's own rules (edid.possConns).
 *
 * From Barco's spec sheets: E2 (Jun 2023), E2 Gen 2 (Nov 2025),
 * S3 Tri-combo Gen 2 (Nov 2026), Encore3 (Nov 2025, preliminary).
 */
export const PROCESSORS = [
  {
    id: 'all',
    name: 'All cards',
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
    name: 'E2 Gen 2 / Encore3',
    input: { hdmi20: 600, dp12: 600, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, dp12: 660, sdi3g: null, sdi12g: null },
  },
  {
    // the Tri-combo card's HDMI input is 550MHz, and there's no DP output
    id: 'tricombo',
    name: 'S3 / Ex Tri-combo (Gen 2)',
    input: { hdmi20: 550, dp12: 600, sdi3g: null, sdi12g: null },
    output: { hdmi20: 600, sdi3g: null, sdi12g: null },
  },
]

export const DEFAULT_PROCESSOR = 'all'

export const processorById = (id) =>
  PROCESSORS.find(p => p.id === id) || PROCESSORS.find(p => p.id === DEFAULT_PROCESSOR)

/**
 * Which of a processor's connectors can carry a calculated format
 * @param {Object} result - from edid.calcEdid()
 * @param {string} processorId
 * @returns {{input: Array, output: Array}} each entry { key, name, icon, ok, note }
 */
export function connections(result, processorId) {
  const processor = processorById(processorId)
  const freq = Number(result.freq)
  const broadcast = sdiFormat(result.hActive, result.vActive, result.vRate)

  const list = (direction) => Object.entries(processor[direction]).map(([key, maxFreq]) => {
    const connector = CONNECTORS[key]

    if (connector.sdi) {
      const ok = sdiCarries(connector.sdi, broadcast)
      const note = ok ? broadcast.name
        : broadcast ? `${broadcast.name} needs ${broadcast.level}-SDI`
        : 'Not a broadcast format'
      return { key, ...connector, ok, note }
    }

    const ok = result.possConns[direction][key] && (maxFreq === null || freq <= maxFreq)
    return { key, ...connector, ok, note: '' }
  })

  return { input: list('input'), output: list('output') }
}
