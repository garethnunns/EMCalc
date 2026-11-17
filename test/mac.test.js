import assert from 'node:assert/strict'
import {
  betterDisplayHelps, keynoteCanvas, macConnectionFor, macConnectionsFor, macFit, macMaxWidth, macosFor, maxDisplays,
  MAC_MODELS, powerPointCanvas, validMac,
} from '../src/lib/mac.js'

const p = (hPx, vPx, refresh, redBlnkV = 2) => ({ hPx, vPx, refresh, margins: false, redBlnk: true, redBlnkV })
const mac = (chip, macos, connection = 'dp12', betterDisplay = false) => ({ model: 'mbp', chip, macos, connection, betterDisplay })

describe('Mac output limits', () => {
  it('M2 and later: 6144 wide, 7680 with BetterDisplay, 8192 with BetterDisplay on Tahoe', () => {
    assert.equal(macMaxWidth(mac('M4 Pro', '15')), 6144)
    assert.equal(macMaxWidth(mac('M4 Pro', '15', 'dp12', true)), 7680)
    assert.equal(macMaxWidth(mac('M4 Pro', '26', 'dp12', true)), 8192)
  })

  it('M1: 8192 on Monterey, 6144 after, and BetterDisplay does not help', () => {
    assert.equal(macMaxWidth(mac('M1 Max', '12')), 8192)
    assert.equal(macMaxWidth(mac('M1 Max', '13', 'dp12', true)), 6144)
    assert.equal(betterDisplayHelps('M1 Max'), false)
    assert.equal(betterDisplayHelps('M2'), true)
  })

  it('HDMI 2.0 is 4096 wide, two DP cables 6144', () => {
    assert.equal(macMaxWidth(mac('M4 Pro', '26', 'hdmi20', true)), 4096)
    assert.equal(macMaxWidth(mac('M4 Pro', '26', 'dual', true)), 6144)
  })

  it('macOS versions start from each chip generation', () => {
    assert.deepEqual(macosFor('M1').map(v => v.id), ['12', '13', '14', '15', '26'])
    assert.deepEqual(macosFor('M3 Max').map(v => v.id), ['14', '15', '26'])
    assert.deepEqual(macosFor('M5').map(v => v.id), ['26'])
  })

  it('keeps a Mac setup valid', () => {
    assert.equal(validMac({ model: 'mini', chip: 'M3 Max' }).chip, 'M4 Pro')
    assert.equal(validMac({ model: 'studio', chip: 'M3 Ultra', macos: '12' }).macos, '26')
    for (const m of MAC_MODELS) for (const chip of m.chips) assert.equal(validMac({ model: m.id, chip }).chip, chip)
  })

  it('max displays', () => {
    assert.equal(maxDisplays('studio', 'M2 Ultra'), 8)
    assert.equal(maxDisplays('mbp', 'M2'), 1)
  })

  it('Keynote and PowerPoint canvases', () => {
    assert.deepEqual(keynoteCanvas(12000, 1080), [8192, 737])
    assert.deepEqual(powerPointCanvas(7680, 1080), [56, 7.88])
  })
})

describe('Sending a format from a Mac', () => {
  const wide = p(7680, 1080, 60)

  it('fits with BetterDisplay on Tahoe', () => {
    const r = macFit(wide, mac('M4 Pro', '26', 'dp12', true), 'all')
    assert.equal(r.ok, true)
    assert.deepEqual([r.best.hPx, r.best.vPx], [7680, 1080])
  })

  it('without BetterDisplay, suggests the widest same-aspect format', () => {
    const r = macFit(wide, mac('M4 Pro', '26'), 'all')
    assert.equal(r.ok, false)
    assert.deepEqual([r.best.hPx, r.best.vPx], [6144, 864])
  })

  it("the processor's input can be the limit, not the Mac", () => {
    // Barco's example into Encore3: the Mac can send 7296 wide, Encore3 takes about 550MHz
    const r = macFit(p(7296, 1440, 60, 1), { ...mac('M2 Ultra', '26', 'dp12', true), model: 'studio' }, 'encore3')
    assert.equal(r.ok, false)
    assert.deepEqual([r.best.hPx, r.best.vPx], [6640, 1310])
  })

  it('two cables: each half is checked, and the per cable size given', () => {
    const r = macFit(p(5120, 1440, 60), mac('M4 Pro', '26', 'dual'), 'all')
    assert.equal(r.ok, true)
    assert.deepEqual(r.perCable, [2560, 1440])
  })

  it("offers the connections the processor's inputs have", () => {
    const names = (id) => macConnectionsFor(id).map(c => c.name)
    assert.deepEqual(names('all'), ['DP 1.2', 'HDMI 2.0', '2× DP 1.2'])
    assert.deepEqual(names('encore3'), ['DP 1.2', 'HDMI 2.0', '2× DP 1.2'])
    assert.deepEqual(names('gen1'), ['DP 1.1', 'HDMI 1.4', 'DVI-D'])
  })

  it('uses the equivalent connection the processor has', () => {
    assert.equal(macConnectionFor('hdmi20', 'gen1').id, 'hdmi14')
    assert.equal(macConnectionFor('dp12', 'gen1').id, 'dp11')
    assert.equal(macConnectionFor('dual', 'gen1').id, 'dp11') // no DP 1.2, so the first
    assert.equal(macConnectionFor('hdmi14', 'e2gen2').id, 'hdmi20')
  })

  it('checks against the connector it uses on Gen 1', () => {
    const r = macFit(p(1920, 1080, 60), mac('M1 Max', '26', 'hdmi20'), 'gen1')
    assert.equal(r.connection, 'hdmi14')
    assert.equal(r.maxWidth, 4096)
    assert.equal(r.ok, true)
  })
})
