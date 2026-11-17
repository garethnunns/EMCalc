import Svg, { Circle, Path, Rect } from 'react-native-svg'

// Front-on outlines of each connector's port, drawn on a 32x20 grid

// HDMI type A: wide top, angled lower corners, contact strip inside
const Hdmi = ({ color }) => (
  <>
    <Path d="M2 4H30V9.5L25 16H7L2 9.5Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Rect x={8.5} y={8} width={15} height={3} rx={0.5} fill={color} />
  </>
)

// DisplayPort: rectangle with one chamfered corner, contact strip inside
const DisplayPort = ({ color }) => (
  <>
    <Path d="M2 4H30V16H10L2 8Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Rect x={11} y={8.5} width={15} height={3} rx={0.5} fill={color} />
  </>
)

// DVI-D: tapered shell, 3 rows of 8 pins and the flat blade
const pins = [6.5, 10, 13.5].flatMap(cy =>
  [6, 8, 10, 12, 14, 16, 18, 20].map(cx => ({ cx, cy }))
)

const Dvi = ({ color }) => (
  <>
    <Path d="M1.5 3H30.5L28 17H4Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    {pins.map(({ cx, cy }) => (
      <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0.75} fill={color} />
    ))}
    <Rect x={22.5} y={9.25} width={4.5} height={1.5} rx={0.4} fill={color} />
  </>
)

// SDI (BNC): round shell with bayonet lugs, insulator ring and centre pin
const Bnc = ({ color }) => (
  <>
    <Circle cx={16} cy={10} r={7.5} stroke={color} strokeWidth={1.6} fill="none" />
    <Circle cx={16} cy={10} r={4} stroke={color} strokeWidth={1} fill="none" />
    <Circle cx={16} cy={10} r={1.4} fill={color} />
    <Rect x={5.5} y={9} width={3} height={2} rx={0.5} fill={color} />
    <Rect x={23.5} y={9} width={3} height={2} rx={0.5} fill={color} />
  </>
)

const shapes = { hdmi: Hdmi, dp: DisplayPort, dvi: Dvi, sdi: Bnc }

/**
 * Outline icon of a video connector's port
 * @param {'hdmi'|'dp'|'dvi'|'sdi'} type
 */
export default function ConnectorIcon({ type, color, size = 28 }) {
  const Shape = shapes[type]
  return (
    <Svg width={size} height={size * 20 / 32} viewBox="0 0 32 20" accessibilityElementsHidden importantForAccessibility="no">
      <Shape color={color} />
    </Svg>
  )
}
