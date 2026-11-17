import assert from 'node:assert/strict'
import edid from '../src/lib/edid.js'
import { buildEdid, fitsDtd, timing } from '../src/lib/edidFile.js'

const params = (hPx, vPx, refresh = 60, redBlnkV = 2, margins = false) =>
  ({ hPx, vPx, refresh, margins, redBlnk: redBlnkV > 0, redBlnkV: redBlnkV || 2 })

const hex = (bytes) => [...bytes].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
const sum = (bytes) => bytes.reduce((a, b) => a + b, 0) % 256
const le = (b, i, n = 2) => [...Array(n)].reduce((v, _, k) => v + (b[i + k] << (8 * k)), 0)

// decode the parts of an EDID the app writes, the way edid-decode reads them
function decodeDtd(d) {
  return {
    clock: le(d, 0),
    hActive: d[2] | ((d[4] >> 4) << 8),
    hBlank: d[3] | ((d[4] & 0xf) << 8),
    vActive: d[5] | ((d[7] >> 4) << 8),
    vBlank: d[6] | ((d[7] & 0xf) << 8),
    hFrontPorch: d[8] | ((d[11] >> 6) << 8),
    hSync: d[9] | (((d[11] >> 4) & 3) << 8),
    vFrontPorch: (d[10] >> 4) | (((d[11] >> 2) & 3) << 4),
    vSync: (d[10] & 0xf) | ((d[11] & 3) << 4),
    hPositive: !!(d[17] & 0x02),
    vPositive: !!(d[17] & 0x04),
  }
}

function decodeTypeI(x) {
  return {
    clock: le(x, 0, 3) + 1,
    preferred: !!(x[3] & 0x80),
    aspect: x[3] & 0xf,
    hActive: le(x, 4) + 1,
    hBlank: le(x, 6) + 1,
    hFrontPorch: (le(x, 8) & 0x7fff) + 1,
    hPositive: !!(x[9] & 0x80),
    hSync: le(x, 10) + 1,
    vActive: le(x, 12) + 1,
    vBlank: le(x, 14) + 1,
    vFrontPorch: (le(x, 16) & 0x7fff) + 1,
    vPositive: !!(x[17] & 0x80),
    vSync: le(x, 18) + 1,
  }
}

const descriptors = (b) => [0, 1, 2, 3].map(i => b.slice(54 + i * 18, 72 + i * 18))
const fields = ['clock', 'hActive', 'hBlank', 'hFrontPorch', 'hSync', 'hPositive', 'vActive', 'vBlank', 'vFrontPorch', 'vSync', 'vPositive']
const pick = (t) => Object.fromEntries(fields.map(k => [k, t[k]]))

function assertValidBase(b) {
  assert.equal(hex(b.slice(0, 8)), '00 FF FF FF FF FF FF 00')
  assert.equal(sum(b.slice(0, 128)), 0, 'base block checksum')
  assert.deepEqual([b[18], b[19]], [1, 4], 'EDID 1.4')
  // manufacturer letters are A-Z
  const id = (b[8] << 8) | b[9]
  const letters = [id >> 10, (id >> 5) & 31, id & 31].map(n => String.fromCharCode(n + 64)).join('')
  assert.equal(letters, 'GNC')
  // DTD first, then range limits, name and a dummy, in that order
  const [first, range, name, dummy] = descriptors(b)
  assert.ok(le(first, 0) > 0, 'first descriptor is a timing')
  assert.equal(range[3], 0xfd)
  assert.equal(name[3], 0xfc)
  assert.deepEqual([...dummy], [0, 0, 0, 0x10, ...Array(14).fill(0)])
  return { first, range, name }
}

describe('EDID file', () => {
  it('writes the detailed timing real 1080p monitors use for CVT-RB', () => {
    // 1920x1080@60 reduced blanking v1, 138.5 MHz: the DTD found in many monitors' EDIDs
    const { bytes, displayId } = buildEdid(params(1920, 1080, 60, 1))
    assert.equal(displayId, false)
    assert.equal(bytes.length, 128)
    assert.equal(hex(bytes.slice(54, 66)), '1A 36 80 A0 70 38 1F 40 30 20 35 00')
    // positive H sync, negative V sync for reduced blanking
    assert.equal(bytes[71], 0x1a)
  })

  it('is a valid EDID 1.4 base block with the format as its preferred timing', () => {
    const p = params(2560, 2000)
    const { bytes, clock, fileName } = buildEdid(p, { bits: 10, year: 2026 })
    const { first, range, name } = assertValidBase(bytes)
    const t = timing(new edid().calcEdid(p))
    assert.deepEqual(decodeDtd(first), pick(t))
    assert.equal(clock, 325.83) // stored to 10 kHz
    assert.equal(bytes[20], 0xc0, 'digital, 10 bits per colour')
    assert.equal(bytes[24] & 0x02, 0x02, 'preferred timing is native')
    assert.deepEqual([bytes[16], bytes[17]], [0xff, 36], 'model year 2026')
    assert.equal(bytes[126], 0, 'no extensions')
    assert.equal(String.fromCharCode(...name.slice(5)), '2560x2000@60\n')
    assert.equal(fileName, 'EMCalc-2560x2000-60Hz.bin')
    // the range covers the timing
    assert.ok(range[5] <= t.vRate && range[6] >= t.vRate)
    assert.ok(range[7] <= t.hRate && range[8] >= t.hRate)
    assert.ok(range[9] * 1000 > t.clock)
  })

  it('folds margins into the blanking', () => {
    const p = params(1920, 1080, 60, 0, true)
    const result = new edid().calcEdid(p)
    assert.ok(result.hBorder > 0 && result.vBorder > 0)
    const d = decodeDtd(descriptors(buildEdid(p).bytes)[0])
    assert.equal(d.hActive, 1920)
    assert.equal(d.hActive + d.hBlank, result.hTotal)
    assert.equal(d.vActive + d.vBlank, result.vTotal)
    assert.equal(d.hFrontPorch, result.hFrontPorch + result.hBorder)
    // CVT standard blanking: negative H sync, positive V sync
    assert.equal(d.hPositive, false)
    assert.equal(d.vPositive, true)
  })

  it('puts formats too big for a detailed timing in a DisplayID block', () => {
    const p = params(7680, 2160)
    const t = timing(new edid().calcEdid(p))
    assert.equal(fitsDtd(t), false)

    const { bytes, displayId, fallback } = buildEdid(p, { year: 2026 })
    assert.equal(displayId, true)
    assert.equal(bytes.length, 256)
    const { first, range } = assertValidBase(bytes)
    assert.equal(bytes[126], 1, 'one extension')

    // the base block falls back to the largest same-aspect format a DTD holds
    const base = decodeDtd(first)
    assert.ok(base.hActive <= 4095)
    assert.deepEqual(fallback, { hPx: base.hActive, vPx: base.vActive })
    assert.ok(Math.abs(base.hActive / base.vActive - 7680 / 2160) < 0.01)

    // the extension: DisplayID 1.3, one Type I timing, both checksums
    const ext = bytes.slice(128)
    assert.equal(ext[0], 0x70)
    assert.equal(sum(ext), 0, 'extension block checksum')
    const [version, length, productType, extCount] = ext.slice(1, 5)
    assert.deepEqual([version, length, productType, extCount], [0x13, 23, 5, 0])
    assert.equal(sum(ext.slice(1, 1 + 5 + length)), 0, 'DisplayID section checksum')
    assert.ok(ext.slice(1 + 5 + length, 127).every(b => b === 0), 'zero padding')
    assert.deepEqual([...ext.slice(5, 8)], [0x03, 0x00, 20])
    const typeI = decodeTypeI(ext.slice(8, 28))
    assert.equal(typeI.preferred, true)
    assert.equal(typeI.aspect, 8) // 32:9 has no code
    assert.deepEqual(pick(typeI), pick(t))

    // the range limits cover both timings
    for (const timingIn of [t, timing(new edid().calcEdid({ ...p, hPx: base.hActive, vPx: base.vActive }))]) {
      assert.ok(range[5] <= timingIn.vRate && range[6] >= timingIn.vRate)
      assert.ok(range[9] * 1000 > timingIn.clock)
    }
  })

  it('marks DisplayID aspect ratios', () => {
    const typeI = (h, v) => decodeTypeI(buildEdid(params(h, v)).bytes.slice(128 + 8, 128 + 28))
    assert.equal(typeI(7680, 4320).aspect, 4) // 16:9
    assert.equal(typeI(7680, 2160).aspect, 8) // 32:9 has no code
  })

  it('uses DisplayID when the front porch is too long for a DTD', () => {
    // under 4096 wide and 655 MHz, but reduced blanking v2's vertical front
    // porch grows with the line count past the 63 lines a DTD holds
    const t = timing(new edid().calcEdid(params(1080, 2880)))
    assert.ok(t.hActive <= 4095 && t.vActive <= 4095 && t.clock <= 65535)
    assert.ok(t.vFrontPorch > 63)
    assert.equal(buildEdid(params(1080, 2880)).displayId, true)
  })

  it('keeps the product name to 13 characters', () => {
    const name = (p) => String.fromCharCode(...descriptors(buildEdid(p).bytes)[2].slice(5))
    assert.equal(name(params(3840, 2160, 59.94)), '3840x2160\n   ')
    assert.equal(name(params(3840, 2160, 120)), '3840x2160@120')
  })

  it('returns nothing for an empty format', () => {
    assert.equal(buildEdid(params(0, 1080)), null)
  })
})
