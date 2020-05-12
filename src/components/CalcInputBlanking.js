import React from 'react'
import { View } from 'react-native'
import { Button, Text, ToggleButton } from 'react-native-paper'

import styles from '../style/styles'
import theme from '../style/theme'

export default class CalcInputBlanking extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 2
    }
  }

  onChange = (v) => {
    if(v !== null) {
      this.props.onChange({
        enabled: v ? true : false, 
        version: v ? v : this.props.value.version
      })
    }
  }

  render () {
    return (
      <View 
        style={styles.switchContainer}>
        <Text 
          style={styles.switchText}>
          {this.props.label}
        </Text>

        <ToggleButton.Row
          value={this.props.value.version}
          onValueChange={value => this.onChange(value)}
        >
          <ToggleButton
            icon={require('../../assets/off.png')}
            value={0}
            accessibilityLabel="Reduced Blanking Off"
            style={!this.props.value.enabled && {backgroundColor: theme.colors.primary}}
          />
          <ToggleButton
            icon={require('../../assets/v1.png')}
            value={1}
            accessibilityLabel="Reduced Blanking Version 1"
            style={this.props.value.enabled && this.props.value.version == 1 && {backgroundColor: theme.colors.primary}}
            onPress={() => this.onChange(1)}
          />
          <ToggleButton
            icon={require('../../assets/v2.png')}
            value={2}
            accessibilityLabel="Reduced Blanking Version 1"
            style={this.props.value.enabled && this.props.value.version == 2 && {backgroundColor: theme.colors.primary}}
            onPress={() => this.onChange(2)}
          />
        </ToggleButton.Row>
      </View>
    )
  }
}

/*
<Button
          mode={!this.props.value.enabled ? 'contained' : 'outlined'}
          onPress={() => this.onChange(false,this.props.value.version)}
          compact={true}>
          Off
        </Button>
        <Button
          mode={this.props.value.enabled && this.props.value.version == 1 ? 'contained' : 'outlined'}
          onPress={() => this.onChange(true,1)}
          compact={true}>
          V1
        </Button>
        <Button
          mode={this.props.value.enabled && this.props.value.version == 2 ? 'contained' : 'outlined'}
          onPress={() => this.onChange(true,2)}
          compact={true}>
          V2
        </Button>
        */