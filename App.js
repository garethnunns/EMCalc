import React from 'react';
import { Dimensions, Image, ScrollView, View } from 'react-native'
import { Appbar, Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import About from './src/components/About'
import Calc from './src/components/Calc'
import UpdateBanner from './src/components/UpdateBanner'

import theme from './src/style/theme'
import styles from './src/style/styles'
import { contentMaxWidth, isWide } from './src/lib/layout'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      about: false,
      wide: isWide(),
    }
  }

  componentDidMount() {
    this.resize = Dimensions.addEventListener('change', () => this.setState({ wide: isWide() }))
  }

  componentWillUnmount() {
    this.resize?.remove()
  }

  onCloseAbout = () => {
    this.setState({
      about: false
    })
  }

  render() {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Appbar.Header nativeID="appbar">
            <View style={[styles.appBarInner, { maxWidth: contentMaxWidth(this.state.wide) }]}>
              <View style={styles.appBarIconWrap} nativeID="appbar-logo">
                <Image
                  source={require('./assets/icon-squircle.png')}
                  style={styles.appBarIcon}
                  accessibilityLabel="EM Calc"
                />
              </View>
              <Appbar.Content
                title="EM Calc"
                style={styles.appBarTitle}
              />
              <Appbar.Action
                icon="information"
                color={theme.colors.text}
                accessibilityLabel="About"
                onPress={() => this.setState({about: true})}
              />
            </View>
          </Appbar.Header>
          <UpdateBanner />
          <About 
            visible={this.state.about}
            onCloseAbout={this.onCloseAbout}
          />
          <ScrollView 
            style={{backgroundColor:theme.colors.surface}}
            contentContainerStyle={styles.scrollContent}
          >
            <Calc />
          </ScrollView>
        </PaperProvider>
      </SafeAreaProvider>
    )
  }
}