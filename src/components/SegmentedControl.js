import React from 'react'
import { Animated, Platform, Pressable, View } from 'react-native'
import { Text } from 'react-native-paper'

import styles, { SEGMENT_WIDTH } from '../style/styles'

// the native animation driver isn't available on web
const useNativeDriver = Platform.OS !== 'web'

/**
 * A labelled row of options with a highlight that springs across to the
 * chosen one, and a little squash on press
 * @param {string} label
 * @param {Array<{value: *, label: string, accessibilityLabel: string}>} options
 * @param {*} value - the chosen option's value
 * @param {function} onChange - called with the chosen option's value
 * @param {boolean} stacked - label above the options rather than beside them
 */
export default class SegmentedControl extends React.Component {
  constructor(props) {
    super(props)
    this.position = new Animated.Value(this.selectedIndex)
    this.pressScale = props.options.map(() => new Animated.Value(1))
  }

  get selectedIndex() {
    return Math.max(0, this.props.options.findIndex(o => o.value === this.props.value))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      Animated.spring(this.position, {
        toValue: this.selectedIndex,
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

  render () {
    const { label, options, onChange, stacked, style } = this.props
    const current = this.selectedIndex
    const translateX = this.position.interpolate({
      inputRange: [0, options.length - 1],
      outputRange: [0, SEGMENT_WIDTH * (options.length - 1)],
    })

    return (
      <View style={[styles.switchContainer, stacked && styles.fieldStacked, style]}>
        <Text style={stacked ? styles.fieldLabel : styles.switchText}>
          {label}
        </Text>

        <View style={styles.segments} role="radiogroup" aria-label={label}>
          <Animated.View style={[styles.segmentHighlight, { transform: [{ translateX }] }]} />

          {options.map((option, index) => (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
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
