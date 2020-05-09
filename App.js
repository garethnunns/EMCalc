import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import { DataTable, Switch, TextInput, Appbar, DarkTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#2196f3'
  }
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content
          title="EM Calc"
        />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
      <ScrollView style={{backgroundColor:theme.colors.surface}}>
        <TextInput
          label='Horizontal Pixels'
          mode='outlined'
          keyboardType={'numeric'}
        />
        <TextInput
          label='Vertical Pixels'
          mode='outlined'
          keyboardType={'numeric'}
        />
        <TextInput
          label='Refresh Rate'
          mode='outlined'
          keyboardType={'numeric'}
        />
        <Switch
        />

        <DataTable>
          <DataTable.Header>
            <DataTable.Title>EDID Timing</DataTable.Title>
          </DataTable.Header>

          <DataTable.Row>
            <DataTable.Cell>H Total</DataTable.Cell>
            <DataTable.Cell numeric>2080</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>H Front Porch</DataTable.Cell>
            <DataTable.Cell numeric>48</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>H Active</DataTable.Cell>
            <DataTable.Cell numeric>1920</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>H Sync</DataTable.Cell>
            <DataTable.Cell numeric>32</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>H Polarity</DataTable.Cell>
            <DataTable.Cell numeric>32</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    //justifyContent: 'center',
  },
});
