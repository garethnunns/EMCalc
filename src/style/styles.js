import { StyleSheet } from 'react-native'
import theme from './theme'

const inputPaddingH = 10
const inputPaddingV = 5

export default StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },

  numContainer: {
    paddingHorizontal: inputPaddingH,
    paddingVertical: inputPaddingV,
    flexDirection: 'row',
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

  capacityAndClockContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  capacityAndClock: {
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

  capacityAndClockTitle: {
    fontSize: 10,
    textAlign: 'center',
    color: theme.colors.textDark
  },

  capacityAndClockValue: {
    paddingVertical: 10,
    fontSize: 30,
    textAlign: 'center',
    color: theme.colors.primaryLight,
  },

  capacityAndClockNote: {
    fontSize: 10,
    textAlign: 'center',
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
});