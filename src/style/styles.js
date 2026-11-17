import { StyleSheet } from 'react-native'
import theme from './theme'
import { NARROW_MAX, WIDE_MAX } from '../lib/layout'

const inputPaddingH = 10
const inputPaddingV = 5

// width of each option in the reduced blanking control
export const SEGMENT_WIDTH = 46

export default StyleSheet.create({
  // the top bar's contents line up with the content below
  appBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginHorizontal: 'auto',
  },

  appBarTitle: {
    alignItems: 'center',
  },

  // same footprint as an Appbar.Action so the title stays centred
  appBarIconWrap: {
    width: 40,
    height: 40,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  appBarIcon: {
    width: 32,
    height: 32,
  },

  updateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingVertical: 4,
    backgroundColor: theme.colors.surfaceLight,
  },

  updateText: {
    flexShrink: 1,
  },

  // centre the content vertically when it's shorter than the window
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },

  container: {
    width: '100%',
    maxWidth: NARROW_MAX,
    marginHorizontal: 'auto',
  },

  // inputs and results side by side on wide windows
  columns: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: WIDE_MAX,
    marginHorizontal: 'auto',
    gap: 24,
  },

  column: {
    flex: 1,
    minWidth: 0,
  },

  spreadColumn: {
    justifyContent: 'space-between',
  },

  // line the table's tabs up with the Format heading
  resultsColumn: {
    paddingTop: 8,
  },

  sectionHeading: {
    paddingHorizontal: inputPaddingH * 2,
    paddingTop: 16,
    paddingBottom: 4,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textDark,
  },

  numContainer: {
    flexDirection: 'column',
  },

  numInput: {
    flex: 1,
  },

  // Paper's underline switches instantly, so CalcInputNum draws its own
  hiddenUnderline: {
    display: 'none',
  },

  // resting underline under the number inputs
  inputLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.disabled,
    pointerEvents: 'none',
  },

  // focus underline, grown out from the centre with scaleX
  inputLineFocus: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    pointerEvents: 'none',
  },

  // inputs and toggles side by side
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: inputPaddingH / 2,
  },

  inputCell: {
    flex: 1,
    paddingHorizontal: inputPaddingH / 2,
  },

  // toggles beside each other match the inputs' padding, and fill the row's height
  toggleCell: {
    paddingVertical: inputPaddingV,
  },

  blankingCell: {
    flex: 1.4,
  },

  // label above the control, like the inputs
  fieldStacked: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginVertical: 0,
    paddingVertical: 6,
    gap: 6,
  },

  fieldLabel: {
    fontSize: 12,
    color: theme.colors.textDark,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: inputPaddingH,
    marginVertical: inputPaddingV,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
    padding: inputPaddingH,
    backgroundColor: theme.colors.surfaceLight,
  },

  switchText: {
    flex: 0.7,
  },

  segments: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  segmentHighlight: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: SEGMENT_WIDTH,
    bottom: 3,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
  },

  segment: {
    width: SEGMENT_WIDTH,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  segmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textDark,
  },

  segmentTextSelected: {
    color: '#ffffff',
  },

  capacityAndFreqContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  capacityAndFreq: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 0.5,
    marginVertical: 12,
    paddingHorizontal: 20,
  },

  capacity: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.disabled,
  },

  capacityAndFreqTitle: {
    fontSize: 10,
    textAlign: 'center',
    color: theme.colors.textDark
  },

  capacityAndFreqValue: {
    paddingVertical: 10,
    fontSize: 30,
    textAlign: 'center',
    color: theme.colors.primaryLight,
  },

  capacityAndFreqNote: {
    fontSize: 10,
    textAlign: 'center',
  },

  macValue: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 16,
  },

  macStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  macNote: {
    color: theme.colors.textDark,
  },

  macReason: {
    fontSize: 13,
    color: theme.colors.red,
    textAlign: 'right',
    flexShrink: 1,
  },

  fitBox: {
    marginHorizontal: inputPaddingH,
    marginBottom: 8,
    padding: 12,
    gap: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.red,
    backgroundColor: theme.colors.surfaceLight,
  },

  fitTitle: {
    fontWeight: '600',
    color: theme.colors.red,
  },

  fitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  fitText: {
    flex: 1,
  },

  fitLabel: {
    fontSize: 12,
    color: theme.colors.textDark,
  },

  fitValue: {
    fontSize: 15,
  },

  warningTitle: {
    lineHeight: 30,
    fontWeight: 'bold',
  },

  warningItem: {
    lineHeight: 25,
  },

  resultsTableHeadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.disabled,
  },
  
  tabs: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    position: 'relative',
  },

  tab: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    cursor: 'pointer',
  },

  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
  },

  tabText: {
    fontSize: 15,
    color: theme.colors.textDark,
  },

  tabTextActive: {
    color: theme.colors.text,
  },

  // as tall as the tallest tab (Mac: its settings and 7 rows), so the page
  // doesn't jump when switching tabs
  resultsBody: {
    minHeight: 590,
    overflow: 'hidden',
  },

  resultsTableActions: {
    flexDirection: 'row',
  },

  connectorName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectorText: {
    marginLeft: 12,
    flexShrink: 1,
  },

  // keep the icon its size when a long note needs the room
  connectorIconWrap: {
    flexShrink: 0,
  },

  ioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.disabled,
  },

  ioHeading: {
    fontSize: 12,
    color: theme.colors.textDark,
  },

  ioSide: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },

  ioMiddle: {
    flex: 1,
    paddingRight: 8,
  },

  ioAbsent: {
    color: theme.colors.textDark,
    fontSize: 16,
  },

  connectorNote: {
    fontSize: 12,
    color: theme.colors.textDark,
  },

  menuItemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuItemTickSpace: {
    width: 18,
  },

  menuItemText: {
    fontSize: 16,
  },

    processorButton: {
    marginLeft: 8,
  },

  aboutDialog: {
    width: '95%',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  
  aboutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },

  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  aboutAppIcon: {
    width: 64,
    height: 64,
    marginRight: 16,
  },

  aboutTitle: {
    fontSize: 22,
  },

  aboutVersion: {
    color: theme.colors.disabled,
  },

  aboutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },

  aboutGnLogo: {
    width: 80,
    height: 45.5,
  },

  link: {
    color: theme.colors.primary,
  },
});