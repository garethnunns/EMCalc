import { DEFAULT_PROCESSOR, PROCESSORS } from './processors.js'

export const SITE_URL = 'https://e2.garethnunns.com/'

export const DEFAULTS = {
  hPx: '2560',
  vPx: '2000',
  refresh: '60',
  margins: false,
  redBlnk: { enabled: true, version: 2 },
  processor: DEFAULT_PROCESSOR,
}

const NUMBER = /^\d+(\.\d+)?$/

/**
 * Encode the calculator inputs as a query string, e.g. h=2560&v=2000&hz=60&m=0&rb=2&p=all
 * @param {Object} state - calculator state
 * @returns {string} query string without the leading ?
 */
export function toQuery(state) {
  return new URLSearchParams({
    h: state.hPx,
    v: state.vPx,
    hz: state.refresh,
    m: state.margins ? '1' : '0',
    rb: state.redBlnk.enabled ? String(state.redBlnk.version) : '0',
    p: state.processor,
  }).toString()
}

/**
 * Read calculator inputs from a query string, ignoring anything missing or invalid
 * @param {string} query - with or without the leading ?
 * @returns {Object} the valid inputs found, to merge over the defaults
 */
export function fromQuery(query) {
  const q = new URLSearchParams(query || '')
  const found = {}

  if (NUMBER.test(q.get('h') || '')) found.hPx = q.get('h')
  if (NUMBER.test(q.get('v') || '')) found.vPx = q.get('v')
  if (NUMBER.test(q.get('hz') || '')) found.refresh = q.get('hz')
  if (['0', '1'].includes(q.get('m'))) found.margins = q.get('m') === '1'

  const rb = q.get('rb')
  if (rb === '0') found.redBlnk = { enabled: false, version: 2 }
  if (rb === '1' || rb === '2') found.redBlnk = { enabled: true, version: Number(rb) }

  if (PROCESSORS.some(p => p.id === q.get('p'))) found.processor = q.get('p')

  return found
}

/**
 * Starting inputs: the defaults, then the last used values, then any in the link
 * @param {string} linkQuery - the page's query string
 * @param {string} storedQuery - the last used values, saved as a query string
 */
export function initialState(linkQuery, storedQuery) {
  return { ...DEFAULTS, ...fromQuery(storedQuery), ...fromQuery(linkQuery) }
}

/** A link to the website with these inputs filled in */
export const shareUrl = (state) => `${SITE_URL}?${toQuery(state)}`
