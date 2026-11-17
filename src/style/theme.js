import { MD2Colors, MD2DarkTheme } from 'react-native-paper'
import color from 'color'

export default {
  ...MD2DarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    primary: MD2Colors.blue500,
    primaryLight: MD2Colors.blue100,
    red: MD2Colors.red200,
    green: MD2Colors.green200,
    yellow: MD2Colors.amber200,
    textDark: '#999999',
    surfaceLight: color(MD2DarkTheme.colors.surface).lighten(0.24).rgb().string()
  }
};
