import React from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'

import styles from '../style/styles'

import CalcInputNum from './CalcInputNum'
import CalcInputSwitch from './CalcInputSwitch'
import CalcInputBlanking from './CalcInputBlanking'
import ResultsTable from './ResultsTable'
import CapacityAndClock from './CapacityAndClock'

export default class Calc extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <View style={styles.container}>
        <CalcInputNum
          name="hPx"
          label="Horizontal Pixels"
          value="1920"
        />
        <CalcInputNum
          name="vPx"
          label="Vertical Pixels"
          value="1080"
        />
        <CalcInputNum
          name="refresh"
          label="Refresh Rate"
          value="60"
        />

        <CalcInputSwitch
          name="margins"
          label="Margins"
        />

        <CalcInputBlanking 
          label="Reduced Blanking"
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