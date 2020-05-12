import React from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'

import styles from '../style/styles'

export default class CalcInputNum extends React.Component {
  render () {
    return (
      <View 
        style={styles.numContainer}>
        <TextInput
          name={this.props.name}
          label={this.props.label}
          value={this.props.value}
          onChangeText={this.props.onChange}
          keyboardType={'numeric'}
          style={styles.numInput}
        />
      </View>
    )
  }
}