import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import styles from './../style/styles'
import theme from '../style/theme'

export default class CapacityAndClock extends React.Component {
  render() {
    let linksStyle = [styles.capacityAndClockValue]
    if(this.props.links == 'Over 4K') {
      linksStyle.push({color: theme.colors.red})
    }

    let linksNoteStyle = [styles.capacityAndClockNote]
    if(this.props.linksNote.includes("too high")) {
      linksNoteStyle.push({color: theme.colors.red})
    }

    return (
      <View style={styles.capacityAndClockContainer}>
        <View style={[styles.capacityAndClock, styles.capacity]}>
          <Text style={styles.capacityAndClockTitle}>
            Connector Capacity
          </Text>
          <Text style={linksStyle}>
            {this.props.links}
          </Text>
          {this.props.linksNote &&
            <Text style={linksNoteStyle}>
              {this.props.linksNote}
            </Text>
          }
        </View>
        <View style={styles.capacityAndClock}>
          <Text style={styles.capacityAndClockTitle}>
            Pixel Clock (MHz)
          </Text>
          <Text style={styles.capacityAndClockValue}>
            {this.props.freq}
          </Text>
          {this.props.freqNote &&
            <Text style={styles.capacityAndClockNote}>
              {this.props.freqNote}
            </Text>
          }
        </View>
      </View>
    )
  }
}