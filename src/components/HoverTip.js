import React from 'react'
import { Dimensions, Platform, View } from 'react-native'
import { Portal, Text } from 'react-native-paper'

import styles from '../style/styles'

// a mouse or trackpad to hover with (the website and desktop app on a computer)
export const canHover = () => {
  try {
    return Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  } catch {
    return false
  }
}

const GAP = 6
const EDGE = 8

/**
 * A tooltip shown while hovering over its children. It goes in a portal over
 * the whole app, as every view on web is its own layer and the controls
 * further down would otherwise cover it.
 * @param {string} text
 * @param {boolean=} disabled - don't show it, e.g. while the text is shown elsewhere
 * @param {function=} onHoverChange - (hovering) => void
 */
export default function HoverTip({ text, disabled, onHoverChange, children }) {
  const anchor = React.useRef(null)
  // where the tooltip goes in the window, while hovering
  const [at, setAt] = React.useState(null)

  const show = () => {
    onHoverChange?.(true)
    if (!canHover()) return
    anchor.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width
      const top = y + height + GAP
      // grow away from the nearer edge of the window
      setAt(x + width / 2 > windowWidth / 2
        ? { top, right: Math.max(EDGE, windowWidth - x - width) }
        : { top, left: Math.max(EDGE, x - EDGE) })
    })
  }

  const hide = () => {
    onHoverChange?.(false)
    setAt(null)
  }

  return (
    <View ref={anchor} collapsable={false} onPointerEnter={show} onPointerLeave={hide}>
      {children}

      {at && !disabled &&
        <Portal>
          <View style={[styles.hoverTip, at]} pointerEvents="none" role="tooltip">
            <Text style={styles.hoverTipText}>{text}</Text>
          </View>
        </Portal>
      }
    </View>
  )
}
