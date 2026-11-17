import SegmentedControl from './SegmentedControl'

const OPTIONS = [
  { value: 0, label: 'Off', accessibilityLabel: 'Reduced Blanking Off' },
  { value: 1, label: 'V1', accessibilityLabel: 'Reduced Blanking Version 1' },
  { value: 2, label: 'V2', accessibilityLabel: 'Reduced Blanking Version 2' },
]

/**
 * Reduced blanking off/v1/v2. Turning it off keeps the last version, so
 * turning it back on returns to it.
 */
export default function CalcInputBlanking({ label, value, onChange, stacked, style }) {
  return (
    <SegmentedControl
      label={label}
      options={OPTIONS}
      value={value.enabled ? value.version : 0}
      onChange={v => onChange({ enabled: v !== 0, version: v !== 0 ? v : value.version })}
      stacked={stacked}
      style={style}
    />
  )
}
