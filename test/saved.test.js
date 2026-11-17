import assert from 'node:assert/strict'
import { addSaved, describeSaved, findSaved, formatKey, MAX_SAVED, parseSaved, removeSaved } from '../src/lib/saved.js'

const WALL = 'h=3840&v=2160&hz=60&m=0&rb=2&b=8&p=all'
const SIDE = 'h=1920&v=1080&hz=50&m=0&rb=1&b=10&p=e2gen2'

describe('Saved formats', () => {
  it('saves newest first, with the name trimmed', () => {
    const list = addSaved(addSaved([], { name: ' Wall ', query: WALL }), { query: SIDE })
    assert.deepEqual(list, [{ name: '', query: SIDE }, { name: 'Wall', query: WALL }])
  })

  it('saving the same format again replaces it, whatever the Mac tab says', () => {
    const list = addSaved([{ name: 'Old', query: WALL }, { name: '', query: SIDE }], {
      name: 'New', query: `${WALL}&mm=mini&mc=M4&mo=15&mx=hdmi20&bd=0`,
    })
    assert.equal(list.length, 2)
    assert.equal(list[0].name, 'New')
    assert.equal(list[1].query, SIDE)
  })

  it('treats a missing setting as its default', () => {
    assert.equal(formatKey('h=3840&v=2160'), formatKey(WALL))
    assert.notEqual(formatKey(WALL), formatKey(WALL.replace('rb=2', 'rb=1')))
  })

  it('finds and removes a format', () => {
    const list = [{ name: 'Wall', query: WALL }, { name: '', query: SIDE }]
    assert.equal(findSaved(list, `${WALL}&bd=1`).name, 'Wall')
    assert.equal(findSaved(list, 'h=1&v=1'), null)
    assert.deepEqual(removeSaved(list, WALL), [{ name: '', query: SIDE }])
  })

  it(`keeps at most ${MAX_SAVED}`, () => {
    let list = []
    for (let h = 1; h <= MAX_SAVED + 5; h++) list = addSaved(list, { query: `h=${h}&v=100` })
    assert.equal(list.length, MAX_SAVED)
    assert.equal(list[0].query, `h=${MAX_SAVED + 5}&v=100`)
  })

  it('reads back what was stored, ignoring anything broken', () => {
    const list = [{ name: 'Wall', query: WALL }]
    assert.deepEqual(parseSaved(JSON.stringify(list)), list)
    assert.deepEqual(parseSaved(JSON.stringify([...list, null, { query: 'nonsense' }, { name: 3, query: SIDE }])), [
      ...list, { name: '', query: SIDE },
    ])
    assert.deepEqual(parseSaved('{'), [])
    assert.deepEqual(parseSaved('{}'), [])
    assert.deepEqual(parseSaved(null), [])
  })

  it('describes each format', () => {
    assert.deepEqual(describeSaved(WALL), { format: '3840 × 2160 @ 60', detail: 'RB v2' })
    assert.deepEqual(describeSaved(SIDE), { format: '1920 × 1080 @ 50', detail: 'RB v1 · 10-bit · E2 Gen 2' })
    assert.equal(describeSaved('h=1920&v=1080&hz=60&rb=0&m=1').detail, 'No RB · Margins')
  })
})
