import React from 'react';
import { View } from 'react-native'
import { Colors, DataTable, IconButton, Text } from 'react-native-paper'

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
    let results = [
      {
        name: 'H Total',
        value: edid.hTotal
      },
      {
        name: 'H Front Porch',
        value: edid.hFrontPorch
      },
      {
        name: 'H Active',
        value: edid.hActive
      },
      {
        name: 'H Sync',
        value: edid.hSync
      },
      {
        name: 'H Polarity',
        value: edid.hPolarity ? '+' : '-'
      },
      {
        name: 'V Total',
        value: edid.hFrontPorch
      },
      {
        name: 'V Front Porch',
        value: edid.vFrontPorch
      },
      {
        name: 'V Active',
        value: edid.vActive
      },
      {
        name: 'V Sync',
        value: edid.vSync
      },
      {
        name: 'V Polarity',
        value: edid.vPolarity ? '+' : '-'
      },
      {
        name: 'V Rate',
        value: edid.vRate
      }
    ]

    return results.map((result, index) => 
      <DataTable.Row key={index}>
        <DataTable.Cell>{result.name}</DataTable.Cell>
        <DataTable.Cell numeric>{result.value}</DataTable.Cell>
      </DataTable.Row>
    )
  }

  formatConns(conns) {
    let results = [
      {
        name: 'DVI-D',
        value: conns.dvid
      },
      {
        name: 'HDMI 1.4',
        value: conns.hdmi14
      },
      {
        name: 'HDMI 2.0',
        value: conns.hdmi20
      },
      {
        name: 'DP 1.1',
        value: conns.dp11
      },
      {
        name: 'DP 1.2',
        value: conns.dp12
      },
    ]

    return results.map((result, index) => 
      <DataTable.Row key={index}>
        <DataTable.Cell>{result.name}</DataTable.Cell>
        <IconButton
          icon={result.value ? 'check-circle' : 'close-circle'}
          color={result.value ? theme.colors.green : theme.colors.red}
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
        results = this.formatConns(this.props.value.possConns.input)
        break;
      case 2:
        title = "Recommended Outputs"
        results = this.formatConns(this.props.value.possConns.output)
        break;
    }

    return (
      <DataTable>
        <View style={styles.resultsTableHeadingContainer}>
          <Text style={styles.resultsTableHeading}>{title}</Text>

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