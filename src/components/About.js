import React from 'react'
import { Image, Linking, Platform, Pressable, View } from 'react-native'
import { Button, Dialog, Paragraph, Portal, Subheading, Text } from 'react-native-paper'

import packageJson from '../../package.json'
import styles from '../style/styles'

// backdrop-filter only exists on web (incl. Electron); passed inline to skip StyleSheet validation
const backdropBlur = Platform.OS == 'web'
  ? { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }
  : null

export default class About extends React.Component {
  render() {
    return (
      <Portal>
        {this.props.visible && (
          <View style={[styles.aboutBackdrop, backdropBlur]} />
        )}
        <Dialog
          visible={this.props.visible}
          onDismiss={this.props.onCloseAbout}
          style={styles.aboutDialog}
        >
          <Dialog.Content>
            <View style={styles.aboutHeader}>
              <Image
                source={require('../../assets/icon-squircle.png')}
                style={styles.aboutAppIcon}
                accessibilityIgnoresInvertColors
              />
              <View>
                <Text style={styles.aboutTitle}>{packageJson.build.productName}</Text>
                <Subheading style={styles.aboutVersion}>
                  {packageJson.version}
                </Subheading>
              </View>
            </View>

            <Paragraph>
              This tool is designed to help calculate custom formats for the Barco 
              Event Master range of products. This isn't a Barco product and 
              there's no gaurantee it'll work.
            </Paragraph>

            <Paragraph>
              The logic is largely based from the&nbsp;
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://www.facebook.com/groups/Barcofolsom/permalink/2524750314238262/')}
              >
                spreadsheet
              </Text>
              &nbsp;created by Graham Loveridge, Syed Athar Hussain & Scott Gershick.
            </Paragraph>

            <Paragraph>
              For the latest downloads, source code, to report bugs and for feature requests,&nbsp;
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://github.com/garethnunns/EMCalc')}
              >
                view the project on GitHub
              </Text>
              .
            </Paragraph>

            <Pressable
              style={styles.aboutFooter}
              onPress={() => Linking.openURL('https://generativenoise.com')}
              accessibilityRole="link"
              accessibilityLabel="Generative Noise"
            >
              <Image
                source={require('../../assets/gn-logo.png')}
                style={styles.aboutGnLogo}
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.link}>&copy; Generative Noise 2020</Text>
            </Pressable>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={this.props.onCloseAbout}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }
}