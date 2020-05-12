import { DarkTheme } from 'react-native-paper'
import color from 'color'

export default {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#2196f3',
    surfaceLight: color(DarkTheme.colors.surface).lighten(0.24).rgb().string()
  }
};