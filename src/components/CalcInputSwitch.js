import React from 'react'
import { View } from 'react-native'
import { Switch, Text } from 'react-native-paper'

import styles from '../style/styles'
import theme from '../style/theme'

export default class CalcInputSwitch extends React.Component {
  render () {
    return (
      <View 
        style={styles.switchContainer}>
        <Text 
          style={styles.switchText}>
          {this.props.label}
        </Text>
        <Switch
          name={this.props.name}
          value={this.props.value}
          onValueChange={this.props.onChange}
          style={styles.switchInput}
          color={theme.colors.primary}
        />
      </View>
    )
  }
}