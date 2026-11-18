import { DEFAULTS, fromQuery } from './params.js'
import { processorById } from './processors.js'
import { videoOptApplies } from './edid.js'

/**
 * Saved formats: the ones someone uses often, e.g. an LED wall, each kept as
 * its share link query with an optional name, newest first.
 */

export const MAX_SAVED = 30

const inputs = (query) => ({ ...DEFAULTS, ...fromQuery(query) })

// video optimised only means anything with reduced blanking v2
const videoOpt = (s) => videoOptApplies({ videoOpt: s.videoOpt, redBlnk: s.redBlnk.enabled, redBlnkV: s.redBlnk.version })

/** What makes two saved formats the same: everything but the Mac tab's setup */
export function formatKey(query) {
  const s = inputs(query)
  return [
    Number(s.hPx), Number(s.vPx), Number(s.refresh), s.margins ? 1 : 0,
    s.redBlnk.enabled ? s.redBlnk.version : 0, videoOpt(s) ? 1 : 0, s.bits, s.processor,
  ].join('|')
}

/** Read the saved list, dropping anything that isn't a saved format */
export function parseSaved(json) {
  try {
    const list = JSON.parse(json || '[]')
    if (!Array.isArray(list)) return []
    return list
      .filter(item => item && typeof item.query === 'string' && fromQuery(item.query).hPx)
      .map(item => ({ name: typeof item.name === 'string' ? item.name : '', query: item.query }))
      .slice(0, MAX_SAVED)
  } catch {
    return []
  }
}

/** Save a format at the top, replacing the same format if it's already saved */
export function addSaved(list, { name = '', query }) {
  const key = formatKey(query)
  return [
    { name: name.trim(), query },
    ...list.filter(item => formatKey(item.query) !== key),
  ].slice(0, MAX_SAVED)
}

export const removeSaved = (list, query) => {
  const key = formatKey(query)
  return list.filter(item => formatKey(item.query) !== key)
}

/** The saved format matching a query, if any */
export const findSaved = (list, query) => {
  const key = formatKey(query)
  return list.find(item => formatKey(item.query) === key) || null
}

/**
 * How a saved format reads in the list
 * @returns {{format: string, detail: string}} e.g. '3840 × 2160 @ 60' and 'RB v2 · 10-bit · E2 Gen 2'
 */
export function describeSaved(query) {
  const s = inputs(query)
  return {
    format: `${s.hPx} × ${s.vPx} @ ${s.refresh}${videoOpt(s) ? ' ÷1.001' : ''}`,
    detail: [
      s.redBlnk.enabled ? `RB v${s.redBlnk.version}` : 'No RB',
      s.margins ? 'Margins' : null,
      s.bits !== 8 ? `${s.bits}-bit` : null,
      s.processor !== DEFAULTS.processor ? processorById(s.processor).name : null,
    ].filter(Boolean).join(' · '),
  }
}
