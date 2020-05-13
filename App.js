import React from 'react';
import { ScrollView } from 'react-native'
import { Appbar, Provider as PaperProvider } from 'react-native-paper'

import About from './src/components/About'
import Calc from './src/components/Calc'

import theme from './src/style/theme'
import styles from './src/style/styles'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      about: false
    }
  }

  onCloseAbout = () => {
    this.setState({
      about: false
    })
  }

  render() {
    return (
      <PaperProvider theme={theme}>
        <Appbar.Header>
          <Appbar.Content
            title="EM Calc"
            style={styles.appBarTitle}
          />
          <Appbar.Action
            icon="information"
            onPress={() => this.setState({about: true})}
          />
        </Appbar.Header>
        <About 
          visible={this.state.about}
          onCloseAbout={this.onCloseAbout}
        />
        <ScrollView 
          style={{backgroundColor:theme.colors.surface}}
        >
          <Calc />
        </ScrollView>
      </PaperProvider>
    )
  }
}