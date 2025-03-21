import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Text style={{ color: 'white' }}>Settings Content Here</Text>
    </View>
  );
};