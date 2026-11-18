import React from 'react'
import { Dimensions, Platform, View } from 'react-native'
import { Portal, Snackbar } from 'react-native-paper'
import * as Clipboard from 'expo-clipboard'

import styles from '../style/styles'

import CalcInputBlanking from './CalcInputBlanking'
import CalcInputNum from './CalcInputNum'
import Dropdown from './Dropdown'
import FractionalToggle from './FractionalToggle'
import CapacityAndFreq from './CapacityAndFreq'
import FitSuggestions from './FitSuggestions'
import MacTab from './MacTab'
import ResultsTable from './ResultsTable'
import SavedFormats from './SavedFormats'
import SectionHeading from './SectionHeading'
import SegmentedControl from './SegmentedControl'
import Warnings from './Warnings'

import edid, { videoOptApplies } from '../lib/edid'
import { capacityNotes, connections, PROCESSORS } from '../lib/processors'
import { fromQuery, initialState, shareUrl, toQuery } from '../lib/params'
import { resultsText } from '../lib/report'
import { isWide } from '../lib/layout'
import { fitSuggestions } from '../lib/fit'
import { macFit } from '../lib/mac'
import { buildEdid } from '../lib/edidFile'

const PROCESSOR_OPTIONS = PROCESSORS.map(p => ({ value: p.id, label: p.name }))

const BIT_OPTIONS = [
  { value: 8, label: '8', accessibilityLabel: '8-bit' },
  { value: 10, label: '10', accessibilityLabel: '10-bit' },
]

const MARGIN_OPTIONS = [
  { value: false, label: 'Off', accessibilityLabel: 'Margins Off' },
  { value: true, label: 'On', accessibilityLabel: 'Margins On' },
]

// the ⓘ explanations beside the options
const INFO = {
  margins: 'Adds a black border (1.8% of the height) around the picture, inside the timing, for displays that crop the edges. Leave it off unless the display needs it.',
  redBlnk: 'Shortens the gaps between lines and frames, so the pixel clock is lower and larger formats fit on one connector. V2 trims them most and works at any refresh rate; turn it off only for displays that need standard CVT timing.',
}

// on the website and desktop app, keep the inputs in the URL and remember them
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'
const STORAGE_KEY = 'emcalc:last'

const linkQuery = () => isWeb ? window.location.search : ''

const storedQuery = () => {
  try { return isWeb ? window.localStorage.getItem(STORAGE_KEY) || '' : '' }
  catch { return '' }
}

const remember = (query) => {
  if (!isWeb) return
  try { window.localStorage.setItem(STORAGE_KEY, query) } catch {}
  try { window.history.replaceState(null, '', `?${query}`) } catch {}
}

export default class Calc extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      ...initialState(linkQuery(), storedQuery()),
      snack: '',
      wide: isWide(),
    }

    this.edid = new edid(
      this.state.hPx,
      this.state.vPx,
      this.state.refresh,
      this.state.margins,
      this.state.redBlnk.enabled,
      this.state.redBlnk.version,
      this.state.videoOpt
    )
  }

  componentDidMount() {
    remember(toQuery(this.inputs))
    this.resize = Dimensions.addEventListener('change', () => this.setState({ wide: isWide() }))
  }

  componentWillUnmount() {
    this.resize?.remove()
  }

  componentDidUpdate(prevProps, prevState) {
    const query = toQuery(this.inputs)
    if (query !== toQuery(prevState)) remember(query)
  }

  get inputs() {
    const { snack, wide, ...inputs } = this.state
    return inputs
  }

  notify = (snack) => this.setState({ snack })

  copyLink = async () => {
    await Clipboard.setStringAsync(shareUrl(this.inputs))
    this.notify('Link copied')
  }

  copyResults = async () => {
    const result = this.edid.calcEdid(this.edidParams)
    await Clipboard.setStringAsync(resultsText(this.inputs, result, connections(result, this.state.processor, this.state.bits)))
    this.notify('Results copied')
  }

  // save the format as an EDID file (website and desktop app)
  downloadEdid = () => {
    const file = buildEdid(this.edidParams, { bits: this.state.bits })
    if (!file) return this.notify('No EDID for this format')

    const url = URL.createObjectURL(new Blob([file.bytes], { type: 'application/octet-stream' }))
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)

    this.notify(file.displayId
      ? `EDID saved, with ${file.fallback.hPx} × ${file.fallback.vPx} for devices without DisplayID`
      : 'EDID saved')
  }

  onChange = (name,value) => {
    this.setState({
      [name]: value
    })
  }

  get edidParams() {
    return {
      hPx: this.state.hPx,
      vPx: this.state.vPx,
      refresh: this.state.refresh,
      margins: this.state.margins,
      redBlnk: this.state.redBlnk.enabled,
      redBlnkV: this.state.redBlnk.version,
      videoOpt: this.state.videoOpt
    }
  }

  render () {
    const customFormat = this.edid.calcEdid(this.edidParams)
    const conns = connections(customFormat, this.state.processor, this.state.bits)
    const notes = capacityNotes(customFormat, this.state.processor, conns, this.state.bits)

    const wide = this.state.wide

    // video optimised is only part of reduced blanking v2
    const videoOptOn = videoOptApplies({ videoOpt: true, redBlnk: this.state.redBlnk.enabled, redBlnkV: this.state.redBlnk.version })

    // kept in the browser, so only on the website and desktop app
    const saved = isWeb ? (
      <SavedFormats
        query={toQuery(this.inputs)}
        onLoad={query => this.setState(fromQuery(query))}
      />
    ) : null

    const capacity = (
      <CapacityAndFreq
        links={customFormat.links}
        freq={customFormat.freq}
        {...notes}
      />
    )

    return (
      <View style={wide ? styles.columns : styles.container}>
        <View style={wide ? styles.column : null}>
          <View>
            <SectionHeading>Format</SectionHeading>

            <View style={styles.inputRow}>
              <CalcInputNum
                name="hPx"
                label="Width"
                value={this.state.hPx}
                onChange={value => this.onChange('hPx',value)}
                min="1"
                max="4096"
                helperText={this.state.hPx > 4096 ? "≥4096 only supported by DP 1.2 with EM ≥7.1" : ""}
                style={styles.inputCell}
              />
              <CalcInputNum
                name="vPx"
                label="Height"
                value={this.state.vPx}
                onChange={value => this.onChange('vPx',value)}
                min="1"
                max="4096"
                helperText={this.state.vPx > 4096 ? "Must be ≤4096 for EM spec" : ""}
                style={styles.inputCell}
              />
              <CalcInputNum
                name="refresh"
                label={customFormat.videoOpt ? `Refresh Rate · ${customFormat.vRate}` : 'Refresh Rate'}
                value={this.state.refresh}
                onChange={value => this.onChange('refresh',value)}
                min="1"
                helperText=""
                style={styles.inputCell}
                accessory={
                  <FractionalToggle
                    // shown off when it doesn't apply, but remembered for going back to v2
                    value={this.state.videoOpt}
                    onChange={value => this.onChange('videoOpt',value)}
                    disabled={!videoOptOn}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputCell, styles.toggleCell]}>
              <SegmentedControl
                label="Margins"
                options={MARGIN_OPTIONS}
                value={this.state.margins}
                onChange={value => this.onChange('margins',value)}
                stacked
                info={INFO.margins}
              />
            </View>
            <View style={[styles.inputCell, styles.toggleCell, styles.blankingCell]}>
              <CalcInputBlanking
                label="Reduced Blanking"
                value={this.state.redBlnk}
                onChange={value => this.onChange('redBlnk',value)}
                stacked
                info={INFO.redBlnk}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputCell, styles.toggleCell]}>
              <SegmentedControl
                label="Bit Depth"
                options={BIT_OPTIONS}
                value={this.state.bits}
                onChange={value => this.onChange('bits',value)}
                stacked
              />
            </View>
            <View style={[styles.inputCell, styles.toggleCell, styles.blankingCell]}>
              <Dropdown
                label="Processor"
                options={PROCESSOR_OPTIONS}
                value={this.state.processor}
                onChange={value => this.onChange('processor',value)}
                stacked
              />
            </View>
          </View>

          <View>
            <SectionHeading>Results</SectionHeading>
            {capacity}

            <FitSuggestions
              suggestions={fitSuggestions(this.edidParams, this.state.processor, this.state.bits)}
              refresh={this.state.refresh}
              onUse={(hPx, vPx) => this.setState({ hPx: String(hPx), vPx: String(vPx) })}
            />

            <Warnings
              warnings={customFormat.warnings}
            />
          </View>

          {wide ? saved : null}
        </View>

        <View style={wide ? [styles.column, styles.resultsColumn] : null}>
          <ResultsTable 
            value={customFormat}
            connections={conns}
            onCopyLink={this.copyLink}
            onCopyResults={this.copyResults}
            onDownloadEdid={isWeb ? this.downloadEdid : null}
            renderMac={() => (
              <MacTab
                mac={this.state.mac}
                processor={this.state.processor}
                fit={macFit(this.edidParams, this.state.mac, this.state.processor, this.state.bits)}
                refresh={this.state.refresh}
                onChange={mac => this.setState({ mac })}
                onUse={(hPx, vPx) => this.setState({ hPx: String(hPx), vPx: String(vPx) })}
              />
            )}
          />
        </View>

        {wide ? null : saved}

        <Portal>
          <Snackbar
            visible={!!this.state.snack}
            onDismiss={() => this.notify('')}
            duration={2000}
          >
            {this.state.snack}
          </Snackbar>
        </Portal>
      </View>
    )
  }
}