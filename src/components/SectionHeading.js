import { Text } from 'react-native-paper'

import styles from '../style/styles'

/** A small heading above a group of the calculator, e.g. "Format" */
export default function SectionHeading({ children }) {
  return (
    <Text style={styles.sectionHeading} role="heading" aria-level={2}>
      {children}
    </Text>
  )
}
