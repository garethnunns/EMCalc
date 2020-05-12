import React from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import styles from '../style/styles'

export default class CalcInputBlanking extends React.Component {
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