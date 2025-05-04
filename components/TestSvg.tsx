import React from 'react';
import { View, Text } from 'react-native';
import TestIcon from '../assets/TestIcon.svg';

export const TestSvg = () => {
  return (
    <View style={{ padding: 20 }}>
      <Text>SVG Test Component</Text>
      <TestIcon width={50} height={50} />
    </View>
  );
}; 