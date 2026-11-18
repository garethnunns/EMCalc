import { Pressable } from 'react-native'
import { Text } from 'react-native-paper'

import HoverTip from './HoverTip'
import styles from '../style/styles'

const TIP = 'Fractional rate (VESA\'s video optimised timing): slows the pixel clock by 1000/1001, so 60 becomes 59.94, 30 becomes 29.97 and 24 becomes 23.976. Only with reduced blanking V2.'

/**
 * The ÷1.001 switch inside the refresh rate box
 * @param {boolean} value
 * @param {function} onChange - (on) => void
 * @param {boolean} disabled - when it doesn't apply (not reduced blanking v2)
 */
export default function FractionalToggle({ value, onChange, disabled }) {
  const on = value && !disabled

  return (
    <HoverTip text={TIP}>
      <Pressable
        onPress={() => onChange(!value)}
        disabled={disabled}
        role="switch"
        aria-checked={on}
        aria-disabled={disabled || undefined}
        aria-label="Fractional rate, divide by 1.001"
        hitSlop={6}
        style={[styles.fractional, on && styles.fractionalOn, disabled && styles.disabled]}
      >
        <Text style={[styles.fractionalText, on && styles.fractionalTextOn]}>÷1.001</Text>
      </Pressable>
    </HoverTip>
  )
}
