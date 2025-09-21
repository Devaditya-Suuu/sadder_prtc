import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="light" backgroundColor={Colors.primary} />
    </NavigationContainer>
  );
}
