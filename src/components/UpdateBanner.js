import { useEffect, useRef, useState } from 'react'
import { Linking, View } from 'react-native'
import { Button, IconButton, Text } from 'react-native-paper'

import packageJson from '../../package.json'
import { appKind, isNewer, latestVersion, RELEASES_URL } from '../lib/version'
import styles from '../style/styles'
import theme from '../style/theme'

// how often to look for a new version, and the least time between checks when
// the window comes back into view (GitHub allows 60 unauthenticated requests an hour)
const CHECK_EVERY = { desktop: 6 * 60 * 60 * 1000, web: 30 * 60 * 1000 }
const MIN_GAP = { desktop: 60 * 60 * 1000, web: 5 * 60 * 1000 }

/**
 * Says when a newer version is out: the desktop app offers to download it,
 * the website to reload into it
 */
export default function UpdateBanner() {
  const kind = appKind()
  const [latest, setLatest] = useState(null)
  const [dismissed, setDismissed] = useState(null)
  const lastCheck = useRef(0)

  useEffect(() => {
    if (!kind) return
    const check = async () => {
      if (Date.now() - lastCheck.current < MIN_GAP[kind]) return
      lastCheck.current = Date.now()
      const version = await latestVersion(kind)
      if (version && isNewer(version, packageJson.version)) setLatest(version.replace(/^v/, ''))
    }
    check()
    const timer = setInterval(check, CHECK_EVERY[kind])
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [kind])

  if (!latest || dismissed === latest) return null

  const reload = async () => {
    // pick up the new service worker too, then load the new version
    try { await (await navigator.serviceWorker?.getRegistration())?.update() } catch {}
    window.location.reload()
  }

  return (
    <View style={styles.updateBar} role="status">
      <Text style={styles.updateText}>EM Calc {latest} is available</Text>
      {kind === 'desktop' ? (
        <Button mode="contained" compact uppercase={false} onPress={() => Linking.openURL(RELEASES_URL)}>
          Download
        </Button>
      ) : (
        <Button mode="contained" compact uppercase={false} onPress={reload}>
          Reload
        </Button>
      )}
      <IconButton
        icon="close"
        size={18}
        iconColor={theme.colors.text}
        onPress={() => setDismissed(latest)}
        accessibilityLabel="Dismiss"
      />
    </View>
  )
}
