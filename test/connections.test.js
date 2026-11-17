import assert from 'node:assert/strict'
import edid from '../src/lib/edid.js'
import { sdiCarries, sdiFormat } from '../src/lib/sdi.js'
import { capacityNotes, connections, PROCESSORS, processorById } from '../src/lib/processors.js'

const calc = (hPx, vPx, refresh, redBlnk = true, redBlnkV = 2) =>
  new edid(hPx, vPx, refresh, false, redBlnk, redBlnkV).calcEdid()

// connections as { key: ok } for one direction
const okMap = (list) => Object.fromEntries(list.map(c => [c.key, c.ok]))

describe('SDI broadcast formats', () => {
  const cases = [
    [1280, 720, 50, '720p50', '3G'],
    [1920, 1080, 25, '1080p25', '3G'],
    [1920, 1080, 59.94, '1080p59.94', '3G'],
    [1920, 1080, '60', '1080p60', '3G'],
    [2048, 1080, 24, '2K 1080p24', '3G'],
    [3840, 2160, 30, '2160p30', '12G'],
    [3840, 2160, 50, '2160p50', '12G'],
    [4096, 2160, 60, '4K 2160p60', '12G'],
  ]

  for (const [h, v, hz, name, level] of cases) {
    it(`${h}x${v}@${hz} => ${name} (${level})`, () => {
      assert.deepEqual(sdiFormat(h, v, hz), { name, level })
    })
  }

  it('matches 59.94 within rounding', () => {
    assert.equal(sdiFormat(1920, 1080, 59.940).name, '1080p59.94')
  })

  it('no match for non-broadcast resolutions or rates', () => {
    assert.equal(sdiFormat(2560, 1440, 60), null)
    assert.equal(sdiFormat(1920, 1200, 60), null)
    assert.equal(sdiFormat(1920, 1080, 75), null)
    assert.equal(sdiFormat(1920, 1080, 59), null)
  })

  it('12G carries everything 3G does, 3G does not carry 2160p', () => {
    assert(sdiCarries('3G', sdiFormat(1920, 1080, 60)))
    assert(sdiCarries('12G', sdiFormat(1920, 1080, 60)))
    assert(!sdiCarries('3G', sdiFormat(3840, 2160, 60)))
    assert(sdiCarries('12G', sdiFormat(3840, 2160, 60)))
    assert(!sdiCarries('12G', null))
  })
})

describe('Processors', () => {
  it('every processor has a unique id and name', () => {
    assert.equal(new Set(PROCESSORS.map(p => p.id)).size, PROCESSORS.length)
    assert.equal(new Set(PROCESSORS.map(p => p.name)).size, PROCESSORS.length)
  })

  it('falls back to all cards for an unknown id', () => {
    assert.equal(processorById('nope').id, 'all')
  })

  it('all cards matches the connector rules, plus SDI', () => {
    const result = calc(1920, 1080, 60, false, 1)
    const conns = connections(result, 'all')

    assert.deepEqual(okMap(conns.input), { ...result.possConns.input, sdi3g: true, sdi12g: true })
    assert.deepEqual(okMap(conns.output), { ...result.possConns.output, sdi3g: true, sdi12g: true })
  })

  it('gen 1 cards only list their connectors', () => {
    const conns = connections(calc(1920, 1080, 60), 'gen1')
    assert.deepEqual(conns.input.map(c => c.key), ['dvid', 'hdmi14', 'dp11', 'sdi3g'])
    assert.deepEqual(conns.output.map(c => c.key), ['hdmi14', 'sdi3g'])
  })

  it('gen 2 Tri-combo has no DP output', () => {
    const conns = connections(calc(1920, 1080, 60), 'tricombo')
    assert(!conns.output.some(c => c.key === 'dp12'))
  })

  it('applies the card pixel clock limits', () => {
    // 3840x2160@60 RB v2 is 522.614MHz: under 550 and 600
    const at522 = calc(3840, 2160, 60)
    assert.equal(okMap(connections(at522, 'tricombo').input).hdmi20, true)

    // 4096x2160@60 RB v2 is 556.744MHz: too high for the Tri-combo's HDMI input
    const over550 = calc(4096, 2160, 60)
    assert(Number(over550.freq) > 550 && Number(over550.freq) <= 600, over550.freq)
    assert.equal(okMap(connections(over550, 'tricombo').input).hdmi20, false)
    assert.equal(okMap(connections(over550, 'e2gen2').input).hdmi20, true)
  })

  it('DP 1.2 input is 600MHz on gen 2 cards but 660MHz across all cards', () => {
    const result = calc(3840, 2160, 70) // 612.46MHz
    const freq = Number(result.freq)
    assert(freq > 600 && freq <= 660, result.freq)
    assert.equal(okMap(connections(result, 'all').input).dp12, true)
    assert.equal(okMap(connections(result, 'e2gen2').input).dp12, false)
  })

  it('SDI rows say which broadcast format matched, or why not', () => {
    const byKey = (list) => Object.fromEntries(list.map(c => [c.key, c]))

    const hd = byKey(connections(calc(1920, 1080, 50), 'e2gen2').input)
    assert.equal(hd.sdi3g.note, '1080p50')
    assert.equal(hd.sdi12g.note, '1080p50')

    const uhd = byKey(connections(calc(3840, 2160, 60), 'e2gen2').input)
    assert.equal(uhd.sdi3g.ok, false)
    assert.equal(uhd.sdi3g.note, '2160p60 needs 12G-SDI')
    assert.equal(uhd.sdi12g.ok, true)

    const custom = byKey(connections(calc(2560, 2000, 60), 'e2gen2').input)
    assert.equal(custom.sdi12g.ok, false)
    assert.equal(custom.sdi12g.note, 'Not a broadcast format')
  })
})

describe('Capacity notes for the chosen cards', () => {
  const notes = (result, id) => capacityNotes(result, id, connections(result, id))

  it('all cards keeps the general connector notes', () => {
    const result = calc(3840, 2160, 30, false) // 4K, above 330MHz
    assert.deepEqual(notes(result, 'all'), {
      linksNote: result.linksNote,
      linksWarn: true,
      freqNote: result.freqNote,
      freqWarn: false,
    })
  })

  it("gen 2 cards don't warn about gen 1 cards", () => {
    const result = calc(3840, 2160, 50) // 433.356MHz
    assert.equal(result.linksNote, 'Pixel Clock too high for all Gen 1 Cards')

    const n = notes(result, 'e2gen2')
    assert.equal(n.linksNote, '4K Signal Bandwidth')
    assert.equal(n.linksWarn, false)
    assert.equal(n.freqNote, '')
    assert.equal(n.freqWarn, false)
  })

  it('gen 1 cards still warn about their own limit', () => {
    const n = notes(calc(3840, 2160, 50), 'gen1')
    assert.equal(n.linksNote, 'Pixel Clock too high for all Gen 1 Cards')
    assert.equal(n.linksWarn, true)
    assert.equal(n.freqNote, "Too high for this processor's DVI, HDMI and DP inputs")
    assert.equal(n.freqWarn, true)
  })

  it('says which input still works when only some do', () => {
    // 556.744MHz: over the Tri-combo's 550MHz HDMI input, within its 600MHz DP input
    const n = notes(calc(4096, 2160, 60), 'tricombo')
    assert.equal(n.freqNote, 'DP 1.2 input only')
    assert.equal(n.freqWarn, false)
  })

  it('warns when no input on the cards can take it', () => {
    const n = notes(calc(3840, 2160, 70), 'e2gen2') // 612.46MHz, over both 600MHz inputs
    assert.equal(n.freqNote, "Too high for this processor's HDMI and DP inputs")
    assert.equal(n.freqWarn, true)
  })
})

describe('Processors from the Barco spec sheets', () => {
  const ids = PROCESSORS.map(p => p.id)

  it('keeps the ids share links from 1.2.0 use', () => {
    for (const id of ['all', 'gen1', 'e2gen2', 'tricombo']) assert(ids.includes(id), id)
  })

  it('lists each processor', () => {
    assert.deepEqual(PROCESSORS.map(p => p.name), [
      'All processors', 'E2 / S3-4K / Ex (Gen 1)', 'E2 Gen 2',
      'S3 Tri-combo Gen 2', 'Ex Tri-combo Gen 2', 'Encore3',
    ])
  })

  it('Ex Tri-combo has a DP output, S3 Tri-combo does not', () => {
    assert('dp12' in processorById('extricombo').output)
    assert(!('dp12' in processorById('tricombo').output))
  })

  // Barco's example from Vincent's post: 7296x1440@60 RB v1 is 662.5MHz,
  // scaled to 6416x1267@60 (514MHz) to fit a single connector on Encore3
  it("Barco's ultrawide example: too high for Encore3, the scaled version fits", () => {
    const wide = calc(7296, 1440, 60, true, 1)
    const scaled = calc(6416, 1267, 60, true, 1)
    assert.equal(wide.freq, '662.500')
    assert.equal(scaled.freq, '514.000')

    const encore3 = (r) => Object.fromEntries(connections(r, 'encore3').input.map(c => [c.key, c.ok]))
    assert.equal(encore3(wide).dp12, false)
    assert.equal(encore3(scaled).dp12, true)
  })

  it('Encore3 notes say its limit is approximate', () => {
    const r = calc(3840, 2160, 60) // 522.614MHz: fits
    const over = calc(4096, 2160, 60) // 556.744MHz: just over 550
    assert.equal(capacityNotes(r, 'encore3', connections(r, 'encore3')).freqNote, '')
    assert.match(capacityNotes(over, 'encore3', connections(over, 'encore3')).freqNote, /^Too high for this processor's HDMI and DP inputs\. Encore3 takes about 550 MHz per input; check in Toolset$/)
  })
})

describe('Bit depth', () => {
  const ok = (result, id, bits) => Object.fromEntries(connections(result, id, bits).input.map(c => [c.key, c.ok]))

  it('8-bit by default', () => {
    const r = calc(3840, 2160, 60)
    assert.deepEqual(ok(r, 'e2gen2'), ok(r, 'e2gen2', 8))
  })

  // 3840x2160@60 RB v2: 522.614MHz
  it('HDMI 2.0 clocks 10-bit 1.25x faster, so 4K60 no longer fits', () => {
    const r = calc(3840, 2160, 60)
    assert.equal(ok(r, 'e2gen2', 8).hdmi20, true)
    assert.equal(ok(r, 'e2gen2', 10).hdmi20, false) // 653MHz TMDS
  })

  it('DP 1.2 carries 10-bit 4K60 with reduced blanking (under 576MHz)', () => {
    assert.equal(ok(calc(3840, 2160, 60), 'e2gen2', 10).dp12, true)
  })

  it("DP 1.2's data rate caps 10-bit at 576MHz, below the card's 600MHz", () => {
    const r = calc(4096, 2160, 64) // 594.929MHz
    assert.equal(ok(r, 'e2gen2', 8).dp12, true)
    assert.equal(ok(r, 'e2gen2', 10).dp12, false)
  })

  it('DVI is 8-bit only', () => {
    const r = calc(1920, 1080, 60)
    assert.equal(ok(r, 'gen1', 8).dvid, true)
    assert.equal(ok(r, 'gen1', 10).dvid, false)
  })

  it('SDI is unaffected', () => {
    const r = calc(1920, 1080, 50)
    assert.equal(ok(r, 'e2gen2', 10).sdi3g, true)
  })
})
