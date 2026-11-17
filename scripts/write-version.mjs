// Writes web-build/version.json with the app version, so an open website can
// tell when a newer one has been deployed
import { readFileSync, writeFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
writeFileSync(new URL('../web-build/version.json', import.meta.url), JSON.stringify({ version }) + '\n')
console.log(`web-build/version.json: ${version}`)
