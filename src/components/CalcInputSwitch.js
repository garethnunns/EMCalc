import React from 'react'
import { View } from 'react-native'
import { Switch, Text } from 'react-native-paper'

import styles from '../style/styles'
import theme from '../style/theme'

export default class CalcInputSwitch extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isSwitchOn: false,
    }
  }

  onValueChange = () => {
    this.setState(state => ({
      isSwitchOn: !state.isSwitchOn
    }))
  }

  render () {
    return (
      <View 
        style={styles.switchContainer}>
        <Text 
          style={styles.switchText}>{this.props.label}</Text>
        <Switch
          name={this.props.name}
          value={this.state.isSwitchOn}
          onValueChange={this.onValueChange}
          style={styles.switchInput}
          color={theme.colors.primary}
        />
      </View>
    )
  }
}