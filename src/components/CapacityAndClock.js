import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import styles from './../style/styles'

export default class CapacityAndClock extends React.Component {
  render() {
    return (
      <View style={styles.capacityAndClockContainer}>
        <View style={[styles.capacityAndClock, styles.capacity]}>
          <Text style={styles.capacityAndClockTitle}>Connector Capacity</Text>
          <Text style={styles.capacityAndClockValue}>{this.props.links}</Text>
          {this.props.linksNote &&
            <Text style={styles.capacityAndClockNote}>{this.props.linksNote}</Text>
          }
        </View>
        <View style={styles.capacityAndClock}>
          <Text style={styles.capacityAndClockTitle}>Pixel Clock (MHz)</Text>
          <Text style={styles.capacityAndClockValue}>{this.props.freq}</Text>
          {this.props.freqNote &&
            <Text style={styles.capacityAndClockNote}>{this.props.freqNote}</Text>
          }
        </View>
      </View>
    )
  }
}