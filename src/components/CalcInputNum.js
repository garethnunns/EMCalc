import React from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'

import styles from '../style/styles'

export default class CalcInputNum extends React.Component {
  render () {
    const value = this.props.value
    const invalid = isNaN(value) || value < this.props.min || value > this.props.max

    return (
      <View 
        style={styles.numContainer}>
        <TextInput
          name={this.props.name}
          label={this.props.label}
          value={value}
          onChangeText={this.props.onChange}
          keyboardType={'numeric'}
          style={styles.numInput}
          error={invalid}
        />
      </View>
    )
  }
}