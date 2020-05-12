import React from 'react'
import { View } from 'react-native'

import styles from '../style/styles'

import CalcInputNum from './CalcInputNum'
import CalcInputSwitch from './CalcInputSwitch'
import CalcInputBlanking from './CalcInputBlanking'
import ResultsTable from './ResultsTable'
import CapacityAndClock from './CapacityAndClock'

import { edid } from '../lib/edid'

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
      }
    }
  }

  onChange = (name,value) => {
    this.setState({
      [name]: value
    })
  }

  render () {
    console.log(this.state)

    return (
      <View style={styles.container}>
        <CalcInputNum
          name="hPx"
          label="Horizontal Pixels"
          value={this.state.hPx}
          onChange={value => this.onChange('hPx',value)}
        />
        <CalcInputNum
          name="vPx"
          label="Vertical Pixels"
          value={this.state.vPx}
          onChange={value => this.onChange('vPx',value)}
        />
        <CalcInputNum
          name="refresh"
          label="Refresh Rate"
          value={this.state.refresh}
          onChange={value => this.onChange('refresh',value)}
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

        <CapacityAndClock 
          links="4K"
          linksNote="Pixel Clock too high for ALL Gen 1 Cards"
          freq="560.004"
          freqNote="Above DVI, HDMI 1.4 and DP 1.1 Spec"
        />

        <ResultsTable 
          value={{
            links: '4K',
            freq: '560.004',

            hTotal: 4058,
            hFrontPorch: 8,
            hActive: 3840,
            hSync: 32,
            hPolarity: true,

            vTotal: 2300,
            vFrontPorch: 50,
            vActive: 2160,
            vSync: 8,
            vPolarity: false,
            vRate: 60,

            possConns: {
              input: {
                dvid: false,
                hdmi14: false,
                hdmi20: true,
                dp11: false,
                dp12: true
              },
              output: {
                dvid: false,
                hdmi14: false,
                hdmi20: false,
                dp11: false,
                dp12: true
              }
            }
          }}
        />
      </View>
    )
  }
}