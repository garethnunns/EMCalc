import React from 'react'
import { Animated, Platform, Pressable, View } from 'react-native'
import { Text } from 'react-native-paper'

import InfoTip, { InfoText } from './InfoTip'
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
 * @param {number=} segmentWidth - width of each option, for longer labels
 * @param {string=} info - an explanation behind an ⓘ beside the label
 */
export default class SegmentedControl extends React.Component {
  constructor(props) {
    super(props)
    this.position = new Animated.Value(this.selectedIndex)
    this.pressScale = props.options.map(() => new Animated.Value(1))
    this.state = { infoOpen: false }
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
    const { label, options, onChange, stacked, style, info } = this.props
    const width = this.props.segmentWidth || SEGMENT_WIDTH
    const current = this.selectedIndex
    const translateX = this.position.interpolate({
      inputRange: [0, options.length - 1],
      outputRange: [0, width * (options.length - 1)],
    })

    return (
      <View style={[styles.switchContainer, stacked && styles.fieldStacked, style]}>
        <View style={[styles.labelRow, !stacked && styles.switchText]}>
          <Text style={stacked ? styles.fieldLabel : null}>
            {label}
          </Text>
          {info &&
            <InfoTip
              label={label}
              text={info}
              open={this.state.infoOpen}
              onToggle={() => this.setState({ infoOpen: !this.state.infoOpen })}
            />
          }
        </View>

        <View style={styles.segments} role="radiogroup" aria-label={label}>
          <Animated.View style={[styles.segmentHighlight, { width, transform: [{ translateX }] }]} />

          {options.map((option, index) => (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              onPressIn={() => this.press(index, true)}
              onPressOut={() => this.press(index, false)}
              role="radio"
              aria-checked={current === index}
              aria-label={option.accessibilityLabel}
              style={[styles.segment, { width }]}
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

        {info && this.state.infoOpen && <InfoText text={info} />}
      </View>
    )
  }
}
