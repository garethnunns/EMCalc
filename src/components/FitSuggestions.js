import React from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import styles from '../style/styles'

/**
 * When a format's too much for one input on the chosen processor, suggest the
 * largest same-aspect format that fits one input, and splitting it across two
 */
export default function FitSuggestions({ suggestions, refresh, onUse }) {
  if (!suggestions) return null
  const { scaled, split } = suggestions

  return (
    <View style={styles.fitBox} role="region" aria-label="Fitting this format">
      <Text style={styles.fitTitle}>Too much for one input on this processor</Text>

      {scaled ? (
        <View style={styles.fitRow}>
          <View style={styles.fitText}>
            <Text style={styles.fitLabel}>Same aspect ratio on one input</Text>
            <Text style={styles.fitValue}>
              {scaled.hPx} × {scaled.vPx} @ {refresh} · {scaled.result.freq} MHz
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            uppercase={false}
            onPress={() => onUse(scaled.hPx, scaled.vPx)}
            accessibilityLabel={`Use ${scaled.hPx} by ${scaled.vPx}`}
          >
            Use
          </Button>
        </View>
      ) : (
        <Text style={styles.fitLabel}>No smaller format with the same aspect ratio fits one input</Text>
      )}

      {split && (
        <View style={styles.fitRow}>
          <View style={styles.fitText}>
            <Text style={styles.fitLabel}>Or split across two inputs (Ultrawide Input, EM 10.1+)</Text>
            <Text style={styles.fitValue}>
              2 × {split.hPx} × {split.vPx} @ {refresh} · {split.result.freq} MHz each
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
