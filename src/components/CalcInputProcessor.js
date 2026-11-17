import React from 'react'
import { View } from 'react-native'
import { Button, Icon, Menu, Text } from 'react-native-paper'

import { PROCESSORS, processorById } from '../lib/processors'
import styles from '../style/styles'
import theme from '../style/theme'

// Paper animates menus over 250ms x the theme's scale; quicker feels more responsive
const FAST_MENU = { animation: { scale: 0.4 } }

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
        style={this.props.stacked ? null : styles.processorButton}
      >
        {current.name}
      </Button>
    )

    return (
      <View style={[styles.switchContainer, this.props.stacked && styles.fieldStacked, this.props.style]}>
        <Text style={this.props.stacked ? styles.fieldLabel : styles.switchText}>
          {this.props.label}
        </Text>

        {this.state.mounted ? (
          <Menu
            visible={this.state.open}
            onDismiss={this.close}
            anchor={button}
            theme={FAST_MENU}
          >
            {PROCESSORS.map(p => (
              <Menu.Item
                key={p.id}
                title={
                  // a compact tick beside the chosen one; Paper's icon slot leaves a wide gap
                  <View style={styles.menuItemTitle}>
                    {p.id === current.id
                      ? <Icon source="check" size={18} color={theme.colors.primary} />
                      : <View style={styles.menuItemTickSpace} />}
                    <Text style={styles.menuItemText}>{p.name}</Text>
                  </View>
                }
                accessibilityState={{ checked: p.id === current.id }}
                onPress={() => this.select(p.id)}
              />
            ))}
          </Menu>
        ) : button}
      </View>
    )
  }
}
