export const RELEASES_URL = 'https://github.com/garethnunns/EMCalc/releases/latest'
const LATEST_RELEASE_API = 'https://api.github.com/repos/garethnunns/EMCalc/releases/latest'

/**
 * Whether version a is newer than b, comparing each number in turn, so 1.10.0
 * is newer than 1.9.0. A leading v is ignored.
 * @param {string} a
 * @param {string} b
 */
export function isNewer(a, b) {
  const parts = (v) => String(v).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0)
  }
  return false
}

/**
 * The newest version available: the latest GitHub release for the desktop
 * app, or the deployed site's version.json for the website
 * @param {'desktop'|'web'} kind
 * @param {function} fetchFn
 * @returns {Promise<string|null>} null if it can't tell (offline, rate limited)
 */
export async function latestVersion(kind, fetchFn = fetch) {
  try {
    if (kind === 'desktop') {
      const res = await fetchFn(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } })
      return res.ok ? (await res.json()).tag_name : null
    }
    // no-store, and the service worker lets this through, so it's never a cached copy
    const res = await fetchFn('/version.json', { cache: 'no-store' })
    return res.ok ? (await res.json()).version : null
  } catch {
    return null
  }
}

/** Where this copy is running: the desktop app, the website, or neither (dev server, native) */
export function appKind() {
  if (typeof location === 'undefined') return null
  // the desktop app serves the site over its own app:// scheme
  if (location.protocol === 'app:') return 'desktop'
  if (!location.protocol.startsWith('http')) return null
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return null
  return 'web'
}
