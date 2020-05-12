import React from 'react';
import { ScrollView } from 'react-native';

import { Appbar, Provider as PaperProvider } from 'react-native-paper';

import Calc from './src/components/Calc'
import theme from './src/style/theme'

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
        <Calc />
      </ScrollView>
    </PaperProvider>
  );
}