import React from 'react'
import { View } from 'react-native'
import { Button, Divider, Text, Switch, TextInput } from 'react-native-paper'

import styles from './../style/styles'
import theme from './../style/theme'

import ResultsTable from './ResultsTable'

class CalcInputNum extends React.Component {
  render () {
    return (
      <View 
        style={styles.numContainer}>
        <TextInput
          name={this.props.name}
          label={this.props.label}
          value={this.props.value}
          keyboardType={'numeric'}
          style={styles.numInput}
        />
      </View>
    )
  }
}

class CalcInputSwitch extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isSwitchOn: false,
    }
  }

  _onToggleSwitch = () => this.setState(state => ({ isSwitchOn: !state.isSwitchOn }));

  render () {
    return (
      <View 
        style={styles.switchContainer}>
        <Text 
          style={styles.switchText}>{this.props.label}</Text>
        <Switch
          name={this.props.name}
          value={this.state.isSwitchOn}
          onValueChange={this._onToggleSwitch}
          style={styles.switchInput}
          color={theme.colors.primary}
        />
      </View>
    )
  }
}

class CalcInputBlanking extends React.Component {
  render () {
    return (
      <View 
        style={styles.switchContainer}>
        <Text 
          style={styles.switchText}>
          {this.props.label}
        </Text>
        <Button
          mode="outlined"
          onPress={() => console.log('Pressed')}
          compact={true}>
          Off
        </Button>
        <Button
          mode="outlined"
          onPress={() => console.log('Pressed')}
          compact={true}>
          V1
        </Button>
        <Button
          mode="contained"
          onPress={() => console.log('Pressed')}
          compact={true}>
          V2
        </Button>
      </View>
    )
  }
}

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
          label="Reduce Blanking"
        />

        <Divider />

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