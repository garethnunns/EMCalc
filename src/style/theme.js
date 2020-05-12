import { Colors, DarkTheme } from 'react-native-paper'
import color from 'color'

export default {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.blue500,
    primaryLight: Colors.blue100,
    red: Colors.red200,
    green: Colors.green200,
    textDark: '#999999',
    surfaceLight: color(DarkTheme.colors.surface).lighten(0.24).rgb().string()
  }
};