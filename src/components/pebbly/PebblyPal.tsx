import React from 'react';
import { View } from 'react-native';
import NormalSvg from '@assets/Pebbly/Normal.svg';

interface PebblyPalProps {
  style?: any;
}
// make it so you can bounce pebbly off screen with the scrollview and then he bounces back down(cool right)
export const PebblyPal = ({ style }: PebblyPalProps) => {
  return (
    <View style={style}>
      <NormalSvg width={175} height={175} />
    </View>
  );
};