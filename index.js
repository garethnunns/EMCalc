import { registerRootComponent } from 'expo'
import { Platform } from 'react-native'

import App from './App'

// react-native-paper's components ask for the native animation driver, which
// doesn't exist on web, so react-native-web warns and falls back to JS
// animation. That fallback is expected here, so drop just that warning.
if (Platform.OS === 'web') {
  const warn = console.warn
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('Animated: `useNativeDriver` is not supported')) return
    warn(...args)
  }
}

registerRootComponent(App)
