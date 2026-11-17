import assert from 'node:assert/strict'
import { fitSuggestions, largestSameAspect } from '../src/lib/fit.js'

const params = (hPx, vPx, refresh, redBlnkV = 2, redBlnk = true) =>
  ({ hPx, vPx, refresh, margins: false, redBlnk, redBlnkV })

describe('Fitting a format into one input', () => {
  // Barco's example: 7296x1440@60 RB v1 (662.5MHz) on Encore3, about 550MHz per input
  const wide = params(7296, 1440, 60, 1)

  it('nothing to suggest when it already fits', () => {
    assert.equal(fitSuggestions(params(3840, 2160, 60), 'encore3'), null)
  })

  it('finds the largest same-aspect format under the limit', () => {
    const { scaled } = fitSuggestions(wide, 'encore3')
    assert.deepEqual([scaled.hPx, scaled.vPx], [6640, 1310])
    assert.equal(scaled.result.freq, '549.750')
    // one more 8px step goes over
    assert(Number(largestSameAspect(wide, () => true, 6648).result.freq) > 550)
  })

  it('keeps the aspect ratio and the 8px grid for reduced blanking v1', () => {
    const { scaled } = fitSuggestions(wide, 'encore3')
    assert.equal(scaled.hPx % 8, 0)
    assert(Math.abs(scaled.hPx / scaled.vPx - 7296 / 1440) < 0.01)
  })

  it('goes further on E2 Gen 2, with its 600MHz inputs', () => {
    const { scaled } = fitSuggestions(wide, 'e2gen2')
    assert.deepEqual([scaled.hPx, scaled.vPx], [6936, 1368])
    assert(Number(scaled.result.freq) <= 600)
  })

  it('splits across two inputs', () => {
    const { split } = fitSuggestions(wide, 'encore3')
    assert.deepEqual([split.hPx, split.vPx], [3648, 1440])
    assert.equal(split.result.freq, '338.250')
  })

  it('no split when half is still too much', () => {
    assert.equal(fitSuggestions(wide, 'gen1').split, null)
  })

  it('reduced blanking v2 uses the 1px grid', () => {
    const { scaled } = fitSuggestions(params(4096, 2160, 60), 'encore3')
    assert.deepEqual([scaled.hPx, scaled.vPx], [4071, 2146])
  })

  it('nothing for an invalid format', () => {
    assert.equal(largestSameAspect(params(0, 1080, 60), () => true), null)
  })
})
