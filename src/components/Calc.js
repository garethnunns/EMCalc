import React from 'react'
import { View } from 'react-native'

import styles from '../style/styles'

import CalcInputBlanking from './CalcInputBlanking'
import CalcInputNum from './CalcInputNum'
import CalcInputSwitch from './CalcInputSwitch'
import CapacityAndFreq from './CapacityAndFreq'
import ResultsTable from './ResultsTable'
import Warnings from './Warnings'

import edid from '../lib/edid'

export default class Calc extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      hPx: '2560',
      vPx: '2000',
      refresh: '60',
      margins: false,
      redBlnk: {
        enabled: true,
        version: 2
      },
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

    console.log(customFormat)

    return (
      <View style={styles.container}>
        <CalcInputNum
          name="hPx"
          label="Horizontal Pixels"
          value={this.state.hPx}
          onChange={value => this.onChange('hPx',value)}
          min="1"
          max="4096"
          helperText={this.state.hPx > 4096 ? "≥4096 only supported by DP 1.2 with EM ≥7.1" : ""}
        />
        <CalcInputNum
          name="vPx"
          label="Vertical Pixels"
          value={this.state.vPx}
          onChange={value => this.onChange('vPx',value)}
          min="1"
          max="4096"
          helperText={this.state.vPx > 4096 ? "Must be ≤4096 for EM spec" : ""}
        />
        <CalcInputNum
          name="refresh"
          label="Refresh Rate"
          value={this.state.refresh}
          onChange={value => this.onChange('refresh',value)}
          min="1"
          helperText=""
        />

        <CalcInputSwitch
          name="margins"
          label="Margins"
          value={this.state.margins}
          onChange={value => this.onChange('margins',value)}
        />

        <CalcInputBlanking 
          label="Reduced Blanking"
          value={this.state.redBlnk}
          onChange={value => this.onChange('redBlnk',value)}
        />

        <CapacityAndFreq 
          links={customFormat.links}
          linksNote={customFormat.linksNote}
          freq={customFormat.freq}
          freqNote={customFormat.freqNote}
        />

        <Warnings
          warnings={customFormat.warnings}
        />

        <ResultsTable 
          value={customFormat}
        />
      </View>
    )
  }
}