import React from 'react'
import { View } from 'react-native'
import { Button, DataTable, Icon, Text } from 'react-native-paper'

import Dropdown from './Dropdown'
import SegmentedControl from './SegmentedControl'
import {
  betterDisplayHelps, keynoteCanvas, MAC_CONNECTIONS, MAC_MODELS, macosFor,
  maxDisplays, modelById, powerPointCanvas, validMac,
} from '../lib/mac'
import styles from '../style/styles'
import theme from '../style/theme'

const MODEL_OPTIONS = MAC_MODELS.map(m => ({ value: m.id, label: m.name }))
const CONNECTION_OPTIONS = MAC_CONNECTIONS.map(c => ({ value: c.id, label: c.name, accessibilityLabel: c.name }))
const ON_OFF = [
  { value: false, label: 'Off', accessibilityLabel: 'BetterDisplay Off' },
  { value: true, label: 'On', accessibilityLabel: 'BetterDisplay On' },
]

const Row = ({ label, children }) => (
  <DataTable.Row>
    <DataTable.Cell>{label}</DataTable.Cell>
    <View style={styles.macValue}>{children}</View>
  </DataTable.Row>
)

/**
 * Sending the format from an Apple silicon Mac: whether it can, and the
 * nearest format it can if not
 */
export default function MacTab({ mac, fit, refresh, onChange, onUse }) {
  const set = (changes) => onChange(validMac({ ...mac, ...changes }))
  const chips = modelById(mac.model).chips.map(c => ({ value: c, label: c }))
  const versions = macosFor(mac.chip).map(v => ({ value: v.id, label: v.name }))
  const best = fit.best
  const displays = maxDisplays(mac.model, mac.chip)

  return (
    <View>
      <View style={styles.inputRow}>
        <View style={[styles.inputCell, styles.toggleCell]}>
          <Dropdown label="Mac" options={MODEL_OPTIONS} value={mac.model} onChange={model => set({ model })} stacked />
        </View>
        <View style={[styles.inputCell, styles.toggleCell]}>
          <Dropdown label="Chip" options={chips} value={mac.chip} onChange={chip => set({ chip })} stacked />
        </View>
      </View>
      <View style={styles.inputRow}>
        <View style={[styles.inputCell, styles.toggleCell]}>
          <Dropdown label="macOS" options={versions} value={mac.macos} onChange={macos => set({ macos })} stacked />
        </View>
        <View style={[styles.inputCell, styles.toggleCell]}>
          <SegmentedControl
            label={betterDisplayHelps(mac.chip) ? 'BetterDisplay' : 'BetterDisplay (no help on M1)'}
            options={ON_OFF}
            value={mac.betterDisplay}
            onChange={betterDisplay => set({ betterDisplay })}
            stacked
          />
        </View>
      </View>
      <View style={styles.inputRow}>
        <View style={[styles.inputCell, styles.toggleCell]}>
          <SegmentedControl
            label="Connection"
            options={CONNECTION_OPTIONS}
            value={mac.connection}
            onChange={connection => set({ connection })}
            segmentWidth={88}
            stacked
          />
        </View>
      </View>

      <Row label="Widest this Mac sends">
        <Text>{fit.maxWidth}px</Text>
      </Row>
      <Row label="This format">
        <View style={styles.macStatus}>
          {fit.reason ? <Text style={styles.macReason}>{fit.reason}</Text> : null}
          <Icon
            source={fit.ok ? 'check-circle' : 'close-circle'}
            color={fit.ok ? theme.colors.green : theme.colors.red}
            size={20}
          />
        </View>
      </Row>
      {!fit.ok && best && (
        <Row label="Scaled">
          <View style={styles.macStatus}>
            <Text>{best.hPx} × {best.vPx} @ {refresh}</Text>
            <Button mode="outlined" compact uppercase={false} onPress={() => onUse(best.hPx, best.vPx)}
              accessibilityLabel={`Use ${best.hPx} by ${best.vPx}`}>
              Use
            </Button>
          </View>
        </Row>
      )}
      {fit.perCable && (
        <Row label="Each connector">
          <View style={styles.macStatus}>
            <Text>{fit.perCable[0]} × {fit.perCable[1]} @ {refresh}</Text>
            <Button mode="outlined" compact uppercase={false} onPress={() => onUse(fit.perCable[0], fit.perCable[1])}
              accessibilityLabel={`Use ${fit.perCable[0]} by ${fit.perCable[1]} for each connector`}>
              Use
            </Button>
          </View>
        </Row>
      )}
      {displays && (
        <Row label="Displays this Mac drives">
          <Text>{displays}</Text>
        </Row>
      )}
      {best && (
        <>
          <Row label="Keynote canvas">
            <Text>{keynoteCanvas(best.hPx, best.vPx).join(' × ')}</Text>
          </Row>
          <Row label="PowerPoint canvas">
            <Text>{powerPointCanvas(best.hPx, best.vPx).join(' × ')} in</Text>
          </Row>
        </>
      )}
    </View>
  )
}
