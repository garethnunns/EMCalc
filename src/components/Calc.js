import React from 'react'
import { Dimensions, Platform, View } from 'react-native'
import { Portal, Snackbar } from 'react-native-paper'
import * as Clipboard from 'expo-clipboard'

import styles from '../style/styles'

import CalcInputBlanking from './CalcInputBlanking'
import CalcInputNum from './CalcInputNum'
import CalcInputProcessor from './CalcInputProcessor'
import CapacityAndFreq from './CapacityAndFreq'
import ResultsTable from './ResultsTable'
import SectionHeading from './SectionHeading'
import SegmentedControl from './SegmentedControl'
import Warnings from './Warnings'

import edid from '../lib/edid'
import { capacityNotes, connections } from '../lib/processors'
import { initialState, shareUrl, toQuery } from '../lib/params'
import { resultsText } from '../lib/report'
import { isWide } from '../lib/layout'

const MARGIN_OPTIONS = [
  { value: false, label: 'Off', accessibilityLabel: 'Margins Off' },
  { value: true, label: 'On', accessibilityLabel: 'Margins On' },
]

// on the website and desktop app, keep the inputs in the URL and remember them
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'
const STORAGE_KEY = 'emcalc:last'

const linkQuery = () => isWeb ? window.location.search : ''

const storedQuery = () => {
  try { return isWeb ? window.localStorage.getItem(STORAGE_KEY) || '' : '' }
  catch (e) { return '' }
}

const remember = (query) => {
  if (!isWeb) return
  try { window.localStorage.setItem(STORAGE_KEY, query) } catch (e) {}
  try { window.history.replaceState(null, '', `?${query}`) } catch (e) {}
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
      this.state.redBlnk.version
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
    await Clipboard.setStringAsync(resultsText(this.inputs, result, connections(result, this.state.processor)))
    this.notify('Results copied')
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
      redBlnkV: this.state.redBlnk.version
    }
  }

  render () {
    const customFormat = this.edid.calcEdid(this.edidParams)
    const conns = connections(customFormat, this.state.processor)
    const notes = capacityNotes(customFormat, this.state.processor, conns)

    const wide = this.state.wide

    const capacity = (
      <CapacityAndFreq
        links={customFormat.links}
        freq={customFormat.freq}
        {...notes}
      />
    )

    return (
      <View style={wide ? styles.columns : styles.container}>
        {/* on wide windows the groups spread out to match the table's height */}
        <View style={wide ? [styles.column, styles.spreadColumn] : null}>
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
                label="Refresh Rate"
                value={this.state.refresh}
                onChange={value => this.onChange('refresh',value)}
                min="1"
                helperText=""
                style={styles.inputCell}
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
              />
            </View>
            <View style={[styles.inputCell, styles.toggleCell, styles.blankingCell]}>
              <CalcInputBlanking
                label="Reduced Blanking"
                value={this.state.redBlnk}
                onChange={value => this.onChange('redBlnk',value)}
                stacked
              />
            </View>
          </View>

          <CalcInputProcessor
            label="Cards"
            value={this.state.processor}
            onChange={value => this.onChange('processor',value)}
          />

          <View>
            <SectionHeading>Results</SectionHeading>
            {capacity}

            <Warnings
              warnings={customFormat.warnings}
            />
          </View>
        </View>

        <View style={wide ? [styles.column, styles.resultsColumn] : null}>
          <ResultsTable 
            value={customFormat}
            connections={conns}
            onCopyLink={this.copyLink}
            onCopyResults={this.copyResults}
          />
        </View>

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