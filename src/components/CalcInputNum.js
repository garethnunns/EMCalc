import React from 'react'
import { Animated, Easing, Platform, View } from 'react-native'
import { HelperText, TextInput } from 'react-native-paper'

import styles from '../style/styles'
import theme from '../style/theme'

// the native animation driver isn't available on web
const useNativeDriver = Platform.OS !== 'web'

export default class CalcInputNum extends React.Component {
  // 0 -> 1 as the focus line grows out from the centre
  focus = new Animated.Value(0)

  animateFocus = (toValue) => {
    Animated.timing(this.focus, {
      toValue,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    }).start()
  }

  render () {
    const value = Number(this.props.value)
    const invalid = Number.isNaN(value) || value < this.props.min || value > this.props.max
    const lineColor = invalid ? theme.colors.error : theme.colors.primary

    return (
      <View
        style={[styles.numContainer, this.props.style]}>
        <View>
          <TextInput
            name={this.props.name}
            label={this.props.label}
            aria-label={this.props.label}
            value={this.props.value}
            onChangeText={this.props.onChange}
            onFocus={() => this.animateFocus(1)}
            onBlur={() => this.animateFocus(0)}
            keyboardType={'numeric'}
            style={styles.numInput}
            underlineStyle={styles.hiddenUnderline}
            error={invalid}
            contentStyle={this.props.accessory ? styles.numInputWithAccessory : null}
          />
          {/* e.g. a switch inside the box, on the right */}
          {this.props.accessory &&
            <View style={styles.numAccessory}>{this.props.accessory}</View>
          }
          {/* Paper's underline switches instantly, so draw our own */}
          <View style={[styles.inputLine, invalid && { backgroundColor: theme.colors.error }]} />
          <Animated.View
            style={[
              styles.inputLineFocus,
              { backgroundColor: lineColor, transform: [{ scaleX: this.focus }] },
            ]}
          />
        </View>
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
