import { processorById } from './processors.js'
import { shareUrl } from './params.js'

/**
 * The EDID timing rows shown in the results table
 * @param {Object} result - from edid.calcEdid()
 * @returns {Array<{name: string, value: (string|number)}>}
 */
export const timingRows = (result) => [
  { name: 'H Total', value: result.hTotal },
  { name: 'H Front Porch', value: result.hFrontPorch },
  { name: 'H Active', value: result.hActive },
  { name: 'H Sync', value: result.hSync },
  { name: 'H Polarity', value: result.hPolarity ? '+' : '-' },
  { name: 'V Total', value: result.vTotal },
  { name: 'V Front Porch', value: result.vFrontPorch },
  { name: 'V Active', value: result.vActive },
  { name: 'V Sync', value: result.vSync },
  { name: 'V Polarity', value: result.vPolarity ? '+' : '-' },
  { name: 'V Rate', value: result.vRate },
]

const blankingName = ({ enabled, version }) =>
  enabled ? `reduced blanking v${version}` : 'no reduced blanking'

const connectorLines = (list) => list.map(c =>
  `${c.name}\t${c.ok ? 'Yes' : 'No'}${c.note ? `\t${c.note}` : ''}`
)

/**
 * Plain text summary of a calculation, tab separated so it pastes into a
 * spreadsheet as columns as well as reading in a document or message
 * @param {Object} inputs - calculator inputs (see params.js)
 * @param {Object} result - from edid.calcEdid()
 * @param {{input: Array, output: Array}} conns - from connections()
 */
export function resultsText(inputs, result, conns) {
  const lines = [
    `EM Calc: ${inputs.hPx}x${inputs.vPx} @ ${inputs.refresh}Hz, ${blankingName(inputs.redBlnk)}, ${inputs.margins ? 'margins' : 'no margins'}`,
    `Processor\t${processorById(inputs.processor).name}`,
    `Pixel clock\t${result.freq} MHz${result.freqNote ? `\t${result.freqNote}` : ''}`,
    `Connector capacity\t${result.links}\t${result.linksNote}`,
    '',
    'EDID Timing',
    ...timingRows(result).map(row => `${row.name}\t${row.value}`),
    '',
    'Possible Inputs',
    ...connectorLines(conns.input),
    '',
    'Recommended Outputs',
    ...connectorLines(conns.output),
  ]

  if (result.warnings.length) {
    lines.push('', 'Warnings', ...result.warnings.map(w => `- ${w}`))
  }

  lines.push('', shareUrl(inputs))
  return lines.join('\n')
}
