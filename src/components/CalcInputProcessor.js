import React from 'react'
import { View } from 'react-native'
import { Button, Menu, Text } from 'react-native-paper'

import { PROCESSORS, processorById } from '../lib/processors'
import styles from '../style/styles'

export default class CalcInputProcessor extends React.Component {
  // Paper's Menu focuses its anchor when it first mounts closed (it treats that
  // as closing), so only mount it once it's first opened
  state = { open: false, mounted: false }

  open = () => this.setState({ open: true, mounted: true })
  close = () => this.setState({ open: false })

  select = (id) => {
    this.close()
    this.props.onChange(id)
  }

  render () {
    const current = processorById(this.props.value)

    const button = (
      <Button
        mode="outlined"
        uppercase={false}
        icon="chevron-down"
        contentStyle={{ flexDirection: 'row-reverse' }}
        onPress={this.open}
        accessibilityLabel={`${this.props.label}: ${current.name}`}
        style={styles.processorButton}
      >
        {current.name}
      </Button>
    )

    return (
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {this.props.label}
        </Text>

        {this.state.mounted ? (
          <Menu
            visible={this.state.open}
            onDismiss={this.close}
            anchor={button}
          >
            {PROCESSORS.map(p => (
              <Menu.Item
                key={p.id}
                title={p.name}
                leadingIcon={p.id === current.id ? 'check' : undefined}
                onPress={() => this.select(p.id)}
              />
            ))}
          </Menu>
        ) : button}
      </View>
    )
  }
}
