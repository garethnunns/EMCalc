import { useState } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import InfoTip, { InfoText } from './InfoTip'
import styles from '../style/styles'

/**
 * A small heading above a group of the calculator, e.g. "Format"
 * @param {string=} info - an explanation behind an ⓘ beside it
 */
export default function SectionHeading({ children, info }) {
  const [open, setOpen] = useState(false)

  const heading = (
    <Text style={[styles.sectionHeading, info && styles.sectionHeadingInRow]} role="heading" aria-level={2}>
      {children}
    </Text>
  )

  if (!info) return heading

  return (
    <View style={styles.sectionHeadingWithInfo}>
      <View style={styles.labelRow}>
        {heading}
        <InfoTip label={children} text={info} open={open} onToggle={() => setOpen(!open)} />
      </View>
      {open && <InfoText text={info} />}
    </View>
  )
}
