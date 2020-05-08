import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';

import { Button, Text } from 'react-native-material-ui';

export default function App() {
  let [fontsLoaded] = useFonts({
    'Roboto': require('./assets/fonts/Roboto-Regular.ttf')
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
        <Text>E2 Calc</Text>
        <Button primary raised={true} text="Primary" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    //justifyContent: 'center',
  },
});
