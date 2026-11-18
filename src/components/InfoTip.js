import React from 'react'
import { Pressable, View } from 'react-native'
import { Icon, Text } from 'react-native-paper'

import HoverTip from './HoverTip'
import styles from '../style/styles'
import theme from '../style/theme'

/**
 * An ⓘ beside a field's label. Hovering shows the explanation as a tooltip;
 * tapping (or pressing it from the keyboard) calls onToggle, so the field can
 * show it under the control, which is how it reads on a phone.
 * @param {string} label - the field it explains
 * @param {string} text - a sentence or two
 * @param {boolean} open - whether the field is showing it
 * @param {function} onToggle
 */
export default function InfoTip({ label, text, open, onToggle }) {
  const [hover, setHover] = React.useState(false)

  return (
    <View style={styles.infoTip}>
      <HoverTip text={text} disabled={open} onHoverChange={setHover}>
        <Pressable
          onPress={onToggle}
          role="button"
          aria-label={`About ${label}`}
          aria-expanded={open}
          hitSlop={8}
          style={styles.infoTipButton}
        >
          <Icon
            source={open ? 'information' : 'information-outline'}
            size={15}
            color={open || hover ? theme.colors.primary : theme.colors.textDark}
          />
        </Pressable>
      </HoverTip>
    </View>
  )
}

/** The explanation shown under a field once its ⓘ is tapped */
export const InfoText = ({ text }) => (
  <Text style={styles.infoText}>{text}</Text>
)
