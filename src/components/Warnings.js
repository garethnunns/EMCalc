import React from 'react'
import { Banner, Text } from 'react-native-paper'

import styles from '../style/styles'

export default class Warnings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dismissed: []
    }
  }

  onDismiss = warnings => {
    this.setState({
      dismissed: warnings
    })
  }

  render() {
    const visible = this.props.warnings.length &&
      JSON.stringify(this.props.warnings) != JSON.stringify(this.state.dismissed)

    return (
      <Banner
        visible={visible}
        actions={[
          {
            label: 'Dismiss',
            onPress: () => this.onDismiss(this.props.warnings)
          },
        ]}
        icon="alert-circle"
      >
        <Text
          style={styles.warningTitle}
        >
          Warning{this.props.warnings.length > 1 ? 's' : ''}
        </Text>
        {this.props.warnings.map((warning, index) => {
          return (
            <Text
              key={index}
              style={styles.warningItem}
            >
              {"\n"}{warning}
            </Text>)
        })}
      </Banner>
    )
  }
}