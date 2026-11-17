import assert from 'node:assert/strict'
import { isNewer, latestVersion } from '../src/lib/version.js'

describe('Update check', () => {
  it('compares versions number by number', () => {
    assert.equal(isNewer('1.3.1', '1.3.0'), true)
    assert.equal(isNewer('1.10.0', '1.9.0'), true)
    assert.equal(isNewer('2.0.0', '1.99.99'), true)
    assert.equal(isNewer('1.3.0', '1.3.0'), false)
    assert.equal(isNewer('1.2.9', '1.3.0'), false)
    assert.equal(isNewer('v1.4', '1.3.9'), true)
  })

  const respond = (body, ok = true) => async () => ({ ok, json: async () => body })

  it('desktop: the latest GitHub release tag', async () => {
    assert.equal(await latestVersion('desktop', respond({ tag_name: '1.4.0' })), '1.4.0')
  })

  it("web: the deployed site's version.json", async () => {
    assert.equal(await latestVersion('web', respond({ version: '1.4.0' })), '1.4.0')
  })

  it("null when it can't tell", async () => {
    assert.equal(await latestVersion('desktop', respond({}, false)), null)
    assert.equal(await latestVersion('web', async () => { throw new Error('offline') }), null)
  })
})
