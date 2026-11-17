import React from 'react'
import { Animated, Platform, Pressable, View } from 'react-native'
import { Text } from 'react-native-paper'

import styles, { SEGMENT_WIDTH } from '../style/styles'

const OPTIONS = [
  { value: 0, label: 'Off', accessibilityLabel: 'Reduced Blanking Off' },
  { value: 1, label: 'V1', accessibilityLabel: 'Reduced Blanking Version 1' },
  { value: 2, label: 'V2', accessibilityLabel: 'Reduced Blanking Version 2' },
]

// the native animation driver isn't available on web
const useNativeDriver = Platform.OS !== 'web'

const selectedIndex = ({ enabled, version }) => enabled ? version : 0

/**
 * Reduced blanking off/v1/v2, as a segmented control with a highlight that
 * springs across to the chosen option
 */
export default class CalcInputBlanking extends React.Component {
  constructor(props) {
    super(props)
    this.position = new Animated.Value(selectedIndex(props.value))
    this.pressScale = OPTIONS.map(() => new Animated.Value(1))
  }

  componentDidUpdate(prevProps) {
    const index = selectedIndex(this.props.value)
    if (index !== selectedIndex(prevProps.value)) {
      Animated.spring(this.position, {
        toValue: index,
        friction: 7,
        tension: 120,
        useNativeDriver,
      }).start()
    }
  }

  press = (index, down) => {
    Animated.spring(this.pressScale[index], {
      toValue: down ? 0.88 : 1,
      friction: 5,
      tension: 300,
      useNativeDriver,
    }).start()
  }

  select = (value) => {
    this.props.onChange({
      enabled: value !== 0,
      version: value !== 0 ? value : this.props.value.version,
    })
  }

  render () {
    const current = selectedIndex(this.props.value)
    const translateX = this.position.interpolate({
      inputRange: [0, OPTIONS.length - 1],
      outputRange: [0, SEGMENT_WIDTH * (OPTIONS.length - 1)],
    })

    return (
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {this.props.label}
        </Text>

        <View style={styles.segments} role="radiogroup" aria-label={this.props.label}>
          <Animated.View style={[styles.segmentHighlight, { transform: [{ translateX }] }]} />

          {OPTIONS.map((option, index) => (
            <Pressable
              key={option.value}
              onPress={() => this.select(option.value)}
              onPressIn={() => this.press(index, true)}
              onPressOut={() => this.press(index, false)}
              role="radio"
              aria-checked={current === index}
              aria-label={option.accessibilityLabel}
              style={styles.segment}
            >
              <Animated.Text
                style={[
                  styles.segmentText,
                  current === index && styles.segmentTextSelected,
                  { transform: [{ scale: this.pressScale[index] }] },
                ]}
              >
                {option.label}
              </Animated.Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }
}
