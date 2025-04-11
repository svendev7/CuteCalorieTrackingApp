// components/StoneCharacter.js
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';

const StoneCharacter = ({ width = 200, height = 200 }) => {
  return (
    <View style={{ width, height }}>
      <Svg viewBox="0 0 200 200" width="100%" height="100%">
        {/* Stone body */}
        <Path
          d="M100,180 C155,180 170,120 170,100 C170,60 140,30 100,30 C60,30 30,60 30,100 C30,120 45,180 100,180 Z"
          fill="#666666"
          stroke="#555555"
          strokeWidth="2"
        />

        {/* Eyes */}
        <Ellipse cx="75" cy="90" rx="8" ry="12" fill="white" />
        <Ellipse cx="125" cy="90" rx="8" ry="12" fill="white" />

        {/* Pupils */}
        <Ellipse cx="75" cy="92" rx="4" ry="6" fill="black" />
        <Ellipse cx="125" cy="92" rx="4" ry="6" fill="black" />

        {/* Blush */}
        <Ellipse cx="65" cy="110" rx="10" ry="5" fill="#555555" opacity="0.5" />
        <Ellipse cx="135" cy="110" rx="10" ry="5" fill="#555555" opacity="0.5" />

        {/* Smile */}
        <Path
          d="M85,115 C85,125 115,125 115,115"
          fill="none"
          stroke="#555555"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default StoneCharacter;