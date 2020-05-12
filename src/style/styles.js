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
    flexDirection: "row",
  },

  numInput: {
    flex: 1
  },

  switchContainer: {
    flexDirection: "row",
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
    //paddingHorizontal: inputPaddingH
  },

  switchInput: {
    
  },
});