import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import styles from './../style/styles'
import theme from '../style/theme'

export default class CapacityAndFreq extends React.Component {
  render() {
    const warningStyle = {color: theme.colors.red}

    let linksStyle = [styles.capacityAndFreqValue]
    if(this.props.links == 'Over 4K') {
      linksStyle.push(warningStyle)
    }

    let linksNoteStyle = [styles.capacityAndFreqNote]
    if(this.props.linksNote.includes("too high")) {
      linksNoteStyle.push(warningStyle)
    }

    let freqStyle = [styles.capacityAndFreqValue]
    let freqNoteStyle = [styles.capacityAndFreqNote]
    if(this.props.freq > 660) {
      freqStyle.push(warningStyle)
      freqNoteStyle.push(warningStyle)
    }

    return (
      <View style={styles.capacityAndFreqContainer}>
        <View style={[styles.capacityAndFreq, styles.capacity]}>
          <Text style={styles.capacityAndFreqTitle}>
            Connector Capacity
          </Text>
          <Text style={linksStyle}>
            {this.props.links}
          </Text>
          {this.props.linksNote.length > 0 &&
            <Text style={linksNoteStyle}>
              {this.props.linksNote}
            </Text>
          }
        </View>
        <View style={styles.capacityAndFreq}>
          <Text style={styles.capacityAndFreqTitle}>
            Pixel Freq (MHz)
          </Text>
          <Text style={freqStyle}>
            {this.props.freq}
          </Text>
          {this.props.freqNote.length > 0 &&
            <Text style={freqNoteStyle}>
              {this.props.freqNote}
            </Text>
          }
        </View>
      </View>
    )
  }
}