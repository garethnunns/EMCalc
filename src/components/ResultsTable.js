import React from 'react';
import { View } from 'react-native'
import { DataTable, IconButton, Text } from 'react-native-paper'

import ConnectorIcon from './ConnectorIcon'
import { timingRows } from '../lib/report'
import styles from '../style/styles'
import theme from '../style/theme';

export default class ResultsTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 0
    }
  }

  onPageChange = (page) => {
    this.setState({
      page: page
    })
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
    var title, results

    switch (this.state.page) {
      case 0:
        title = "EDID Timing"
        results = this.formatEdid(this.props.value)
        break;
      case 1:
        title = "Possible Inputs"
        results = this.formatConns(this.props.connections.input)
        break;
      case 2:
        title = "Recommended Outputs"
        results = this.formatConns(this.props.connections.output)
        break;
    }

    return (
      <DataTable>
        <View style={styles.resultsTableHeadingContainer}>
          <Text style={styles.resultsTableHeading}>{title}</Text>

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

          <DataTable.Pagination
            page={this.state.page}
            numberOfPages={3}
            onPageChange={(page) => this.onPageChange(page)}
          />
        </View>

        {results}
      </DataTable>
    )
  }
}