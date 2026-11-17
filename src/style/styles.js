import { StyleSheet } from 'react-native'
import theme from './theme'

const inputPaddingH = 10
const inputPaddingV = 5

// width of each option in the reduced blanking control
export const SEGMENT_WIDTH = 52

export default StyleSheet.create({
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

  container: {
    width: '100%',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },

  numContainer: {
    paddingHorizontal: inputPaddingH,
    paddingVertical: inputPaddingV,
    flexDirection: 'column',
  },

  numInput: {
    flex: 1,
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
    marginVertical: 20,
    paddingHorizontal: 20,
  },

  capacity: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.primaryLight,
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
    paddingVertical: inputPaddingV,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.disabled,
  },
  
  resultsTableHeading: {
    flex: 1,
    paddingHorizontal: 15,
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
  },

  connectorNote: {
    fontSize: 12,
    color: theme.colors.textDark,
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