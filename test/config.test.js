import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const readJson = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url)))

describe('Project config', () => {
  const pkg = readJson('package.json')
  const app = readJson('app.json').expo

  it('app.json version matches package.json', () => {
    assert.equal(app.version, pkg.version)
  })

  it('app name matches the desktop product name', () => {
    assert.equal(app.name, pkg.build.productName)
  })
})
