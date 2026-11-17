import { Dimensions } from 'react-native'

// settings and results side by side from this window width
export const WIDE = 1000

// widest the content gets, in each layout
export const NARROW_MAX = 600
export const WIDE_MAX = 1200

export const isWide = () => Dimensions.get('window').width >= WIDE

export const contentMaxWidth = (wide) => wide ? WIDE_MAX : NARROW_MAX
