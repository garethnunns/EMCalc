import assert from 'node:assert/strict'
import { DEFAULTS, fromQuery, initialState, shareUrl, toQuery } from '../src/lib/params.js'

const state = {
  hPx: '3840',
  vPx: '2160',
  refresh: '59.94',
  margins: true,
  redBlnk: { enabled: true, version: 1 },
  processor: 'e2gen2',
}

describe('Share links', () => {
  it('encodes the inputs as a query string', () => {
    assert.equal(toQuery(state), 'h=3840&v=2160&hz=59.94&m=1&rb=1&p=e2gen2')
  })

  it('reads back what it writes', () => {
    assert.deepEqual(fromQuery(toQuery(state)), state)
  })

  it('round trips reduced blanking off', () => {
    const off = { ...DEFAULTS, redBlnk: { enabled: false, version: 2 } }
    assert.deepEqual(fromQuery(toQuery(off)).redBlnk, { enabled: false, version: 2 })
  })

  it('accepts a leading ?', () => {
    assert.equal(fromQuery('?h=1920').hPx, '1920')
  })

  it('ignores missing and invalid values', () => {
    assert.deepEqual(fromQuery(''), {})
    assert.deepEqual(fromQuery('h=abc&v=-5&hz=&m=2&rb=3&p=nope&x=1'), {})
  })

  it('links override the last used values, which override the defaults', () => {
    const result = initialState('h=1280', 'h=1920&v=1200')
    assert.equal(result.hPx, '1280')
    assert.equal(result.vPx, '1200')
    assert.equal(result.refresh, DEFAULTS.refresh)
  })

  it('makes a link to the website', () => {
    assert.equal(shareUrl(state), 'https://e2.garethnunns.com/?h=3840&v=2160&hz=59.94&m=1&rb=1&p=e2gen2')
  })
})
