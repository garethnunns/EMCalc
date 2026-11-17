import React from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native'
import { DataTable, Icon, IconButton, Text } from 'react-native-paper'

import ConnectorIcon from './ConnectorIcon'
import { timingRows } from '../lib/report'
import { ioRows } from '../lib/processors'
import styles from '../style/styles'
import theme from '../style/theme';

const TABS = ['Timing', 'I/O', 'Mac']

// the native animation driver isn't available on web
const useNativeDriver = Platform.OS !== 'web'

// how far the new tab's rows slide in from
const SLIDE = 32

export default class ResultsTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 0,
      direction: 1,
    }

    // underline under the chosen tab, moved to each tab's measured position
    this.tabLayouts = []
    this.indicatorX = new Animated.Value(0)
    this.indicatorWidth = new Animated.Value(0)

    // 0 -> 1 as a newly chosen tab's rows slide and fade in
    this.content = new Animated.Value(1)
  }

  onTabLayout = (index, { nativeEvent: { layout } }) => {
    this.tabLayouts[index] = layout
    if (index === this.state.page) {
      this.indicatorX.setValue(layout.x)
      this.indicatorWidth.setValue(layout.width)
    }
  }

  onPageChange = (page) => {
    if (page === this.state.page) return

    this.setState({ page, direction: page > this.state.page ? 1 : -1 })

    const layout = this.tabLayouts[page]
    if (layout) {
      // width can't use the native driver, so neither can its partner
      const spring = { friction: 9, tension: 90, useNativeDriver: false }
      Animated.parallel([
        Animated.spring(this.indicatorX, { ...spring, toValue: layout.x }),
        Animated.spring(this.indicatorWidth, { ...spring, toValue: layout.width }),
      ]).start()
    }

    this.content.setValue(0)
    Animated.timing(this.content, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    }).start()
  }

  formatEdid(edid) {
    return timingRows(edid).map(row =>
      <DataTable.Row key={row.name}>
        <DataTable.Cell>{row.name}</DataTable.Cell>
        <DataTable.Cell numeric>{row.value}</DataTable.Cell>
      </DataTable.Row>
    )
  }

  // one direction's status: tick, yellow (fits inside a broadcast format), cross, or – when absent
  status(conn, direction) {
    if (!conn) return <Text style={styles.ioAbsent} aria-label={`No ${direction}`}>–</Text>
    const [icon, color, label] = conn.ok ? ['check-circle', theme.colors.green, 'supported']
      : conn.partial ? ['minus-circle', theme.colors.yellow, 'fits inside a larger format']
      : ['close-circle', theme.colors.red, 'not supported']
    return <Icon source={icon} color={color} size={20} aria-label={`${direction} ${label}`} />
  }

  formatIO(conns) {
    return [
      <View key="header" style={styles.ioHeader}>
        <Text style={[styles.ioHeading, styles.ioMiddle]}>Connector</Text>
        <Text style={[styles.ioHeading, styles.ioSide]}>Input</Text>
        <Text style={[styles.ioHeading, styles.ioSide]}>Output</Text>
      </View>,
      ...ioRows(conns).map(row =>
        <DataTable.Row key={row.key}>
          <View style={[styles.ioMiddle, styles.connectorName]}>
            <View style={styles.connectorIconWrap}>
              <ConnectorIcon type={row.icon} color={theme.colors.textDark} />
            </View>
            <View style={styles.connectorText}>
              <Text>{row.name}</Text>
              {row.note ? <Text style={styles.connectorNote}>{row.note}</Text> : null}
            </View>
          </View>
          <View style={styles.ioSide}>{this.status(row.input, 'Input')}</View>
          <View style={styles.ioSide}>{this.status(row.output, 'Output')}</View>
        </DataTable.Row>
      ),
    ]
  }

  render() {
    const page = this.state.page
    const results = [
      () => this.formatEdid(this.props.value),
      () => this.formatIO(this.props.connections),
      () => this.props.renderMac(),
    ][page]()

    return (
      <DataTable>
        <View style={styles.resultsTableHeadingContainer}>
          <View style={styles.tabs} role="tablist">
            {TABS.map((tab, index) => (
              <Pressable
                key={tab}
                onPress={() => this.onPageChange(index)}
                onLayout={event => this.onTabLayout(index, event)}
                role="tab"
                aria-selected={index === page}
                style={styles.tab}
              >
                <Text style={[styles.tabText, index === page && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
            <Animated.View
              style={[styles.tabIndicator, { left: this.indicatorX, width: this.indicatorWidth }]}
            />
          </View>

          <View style={styles.resultsTableActions}>
            <IconButton
              icon="content-copy"
              accessibilityLabel="Copy results"
              size={20}
              onPress={this.props.onCopyResults}
            />
            <IconButton
              icon="link-variant"
              accessibilityLabel="Copy link to this format"
              size={20}
              onPress={this.props.onCopyLink}
            />
          </View>
        </View>

        {/* as tall as the longest tab, so the page doesn't jump when switching */}
        <View style={styles.resultsBody}>
          <Animated.View
            style={{
              opacity: this.content,
              transform: [{
                translateX: this.content.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SLIDE * this.state.direction, 0],
                }),
              }],
            }}
          >
            {results}
          </Animated.View>
        </View>
      </DataTable>
    )
  }
}
