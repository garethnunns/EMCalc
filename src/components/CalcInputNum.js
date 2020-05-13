import React from 'react'
import { View } from 'react-native'
import { HelperText, TextInput } from 'react-native-paper'

import styles from '../style/styles'

export default class CalcInputNum extends React.Component {
  render () {
    const value = Number(this.props.value)
    const invalid = value == NaN || value < this.props.min || value > this.props.max

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
          error={invalid}
        />
        {this.props.helperText.length > 0 && invalid &&
          <HelperText
            type="error"
            visible={invalid}
          >
            {this.props.helperText}
          </HelperText>
        }
      </View>
    )
  }
}