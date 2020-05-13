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
      hPx: '1920',
      vPx: '1080',
      refresh: '60',
      margins: false,
      redBlnk: {
        enabled: true,
        version: 2
      },

      warning: []
    }
  }

  onChange = (name,value) => {
    this.setState({
      [name]: value
    })
  }

  _onDismissSnackBar = () => this.setState({ visible: false });


  render () {
    const customEdid = new edid(
      this.state.hPx,
      this.state.vPx,
      this.state.refresh,
      this.state.margins,
      this.state.redBlnk.enabled,
      this.state.redBlnk.version
    )

    const customFormat = customEdid.calcEdid()

    console.log(customFormat.warnings)
    console.log(this.state)

    return (
      <View style={styles.container}>
        <CalcInputNum
          name="hPx"
          label="Horizontal Pixels"
          value={this.state.hPx}
          onChange={value => this.onChange('hPx',value)}
          min="1"
          max="4096"
          helperText="Must be ≤4096 for EM spec"
        />
        <CalcInputNum
          name="vPx"
          label="Vertical Pixels"
          value={this.state.vPx}
          onChange={value => this.onChange('vPx',value)}
          min="1"
          max="4096"
          helperText="Must be ≤4096 for EM spec"
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