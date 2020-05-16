import React from 'react'
import { Linking, Platform } from 'react-native'
import { Button, Dialog, Paragraph, Portal, Subheading, Text } from 'react-native-paper'

import packageJson from '../../package.json'
import styles from '../style/styles'

export default class About extends React.Component {
  render() {
    let dialogStyle = [styles.aboutDialog]
    if(Platform.OS == 'web') {
      dialogStyle.push(styles.aboutDialogWeb)
    }

    return (
      <Portal>
        <Dialog
          visible={this.props.visible}
          onDismiss={this.props.onCloseAbout}
          style={dialogStyle}
        >
          <Dialog.Title>{packageJson.build.productName}</Dialog.Title>
          <Dialog.Content>
            <Subheading>{packageJson.version}</Subheading>
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

            <Paragraph
              style={styles.link}
              onPress={() => Linking.openURL('https://garethnunns.com')}
            >
              &copy; Gareth Nunns 2020
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={this.props.onCloseAbout}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }
}