import { StyleSheet } from 'react-native'
import theme from './theme'

const inputPaddingH = 10
const inputPaddingV = 5

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
    borderRadius: 4,
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
    paddingHorizontal: 15,
  },

  aboutDialog: {
    width: '95%',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  
  aboutDialogWeb: {
    position: 'relative',
    top: '-25%',
  },
  
  aboutBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  aboutVersion: {
    paddingBottom: 10,
    color: theme.colors.disabled,
  },

  link: {
    color: theme.colors.primary,
  },
});