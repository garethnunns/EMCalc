import React from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native'
import { DataTable, IconButton, Text } from 'react-native-paper'

import ConnectorIcon from './ConnectorIcon'
import { timingRows } from '../lib/report'
import styles from '../style/styles'
import theme from '../style/theme';

const TABS = ['Timing', 'Inputs', 'Outputs']

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

  formatConns(conns) {
    return conns.map(conn =>
      <DataTable.Row key={conn.key}>
        <DataTable.Cell>
          <View style={styles.connectorName}>
            <ConnectorIcon type={conn.icon} color={theme.colors.textDark} />
            <View style={styles.connectorText}>
              <Text>{conn.name}</Text>
              {conn.note ? <Text style={styles.connectorNote}>{conn.note}</Text> : null}
            </View>
          </View>
        </DataTable.Cell>
        <IconButton
          icon={conn.ok ? 'check-circle' : 'close-circle'}
          iconColor={conn.ok ? theme.colors.green : theme.colors.red}
          accessibilityLabel={conn.ok ? 'Supported' : 'Not supported'}
          size={20}
        />
      </DataTable.Row>
    )
  }

  render() {
    const page = this.state.page
    const results = [
      () => this.formatEdid(this.props.value),
      () => this.formatConns(this.props.connections.input),
      () => this.formatConns(this.props.connections.output),
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
