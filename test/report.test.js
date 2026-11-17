import assert from 'node:assert/strict'
import edid from '../src/lib/edid.js'
import { connections } from '../src/lib/processors.js'
import { DEFAULTS } from '../src/lib/params.js'
import { resultsText, timingRows } from '../src/lib/report.js'

describe('Copy results', () => {
  const inputs = { ...DEFAULTS, hPx: '1920', vPx: '1080', refresh: '50', processor: 'e2gen2' }
  const result = new edid().calcEdid({ hPx: 1920, vPx: 1080, refresh: 50, margins: false, redBlnk: true, redBlnkV: 2 })
  const text = resultsText(inputs, result, connections(result, inputs.processor))
  const lines = text.split('\n')

  it('starts with a summary of the inputs', () => {
    assert.equal(lines[0], 'EM Calc: 1920x1080 @ 50Hz, reduced blanking v2, no margins, 8-bit')
    assert.equal(lines[1], 'Processor\tE2 Gen 2')
    assert.equal(lines[2], `Pixel clock\t${result.freq} MHz`)
    assert.equal(lines[3], 'Data rate\t2.7 Gbit/s at 8-bit')
  })

  it('includes every timing row, tab separated', () => {
    for (const row of timingRows(result)) {
      assert(lines.includes(`${row.name}\t${row.value}`), row.name)
    }
  })

  it('lists the connectors with input and output side by side, and SDI notes', () => {
    assert(lines.includes('Connectors\tInput\tOutput'))
    assert(lines.includes('HDMI 2.0\tYes\tYes'))
    assert(lines.includes('3G-SDI\tYes\tYes\t1080p50'))
  })

  it('a connector the processor only has one way shows –', () => {
    const tri = resultsText({ ...inputs, processor: 'tricombo' }, result, connections(result, 'tricombo'))
    assert(tri.split('\n').includes('DP 1.2\tYes\t–'))
  })

  it('uses the notes for the chosen cards', () => {
    const uhd = new edid().calcEdid({ hPx: 3840, vPx: 2160, refresh: 50, margins: false, redBlnk: true, redBlnkV: 2 })
    const uhdText = resultsText({ ...inputs, hPx: '3840', vPx: '2160' }, uhd, connections(uhd, 'e2gen2'))
    assert(uhdText.includes('Connector capacity\t4K\t4K Signal Bandwidth'))
    assert(!uhdText.includes('Gen 1'))
  })

  it('ends with a link to the format', () => {
    assert.equal(lines.at(-1), 'https://e2.garethnunns.com/?h=1920&v=1080&hz=50&m=0&rb=2&b=8&p=e2gen2&mm=mbp&mc=M4+Pro&mo=26&mx=dp12&bd=0')
  })

  it('includes warnings when there are any', () => {
    const odd = new edid().calcEdid({ hPx: 2560, vPx: 2000, refresh: 59, margins: false, redBlnk: false, redBlnkV: 2 })
    const oddText = resultsText({ ...inputs, refresh: '59', redBlnk: { enabled: false, version: 2 } }, odd, connections(odd, 'all'))
    assert(oddText.includes('\nWarnings\n- '))
    assert(!text.includes('Warnings'))
  })
})
