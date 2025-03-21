import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { styles } from './HomeStyles';
import HeartIcon from '@assets/Heart.svg';
import FlameIcon from '@assets/Vector.svg';
import CogIcon from '@assets/Settings.svg';
import StoreIcon from '@assets/Store.svg';
const { width, height } = Dimensions.get('window');

const SvgIcon = ({ path, size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={path} fill={color} />
  </Svg>
);
export const HomeScreen = () => {
  const [imageError, setImageError] = useState(false);
  return (
    <View style={styles.container}>
      {/* Top Left Section */}
      <View style={styles.topLeft}>
        <Text style={styles.name}>Kekke steen</Text>
        <View style={styles.heartsContainer}>
          {[...Array(5)].map((_, i) => (
            <HeartIcon
            key={`heart-${i}`}
            width={width * 0.05}
            height={width * 0.05}
            fill="red"
            style={styles.heartIcon}
          />
          ))}
        </View>
      </View>

      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        accessibilityLabel="Open settings"
      >
       <CogIcon
          width={width * 0.08}
          height={width * 0.08}
          fill="white"
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.storeContainer}>
        <StoreIcon
          width={width * 0.08}
          height={width * 0.08}
          fill="white"
        />
        <Text style={styles.iconText}>Store</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.flameContainer}>
        <FlameIcon
          width={width * 0.08}
          height={width * 0.08}
          fill="orange"
        />
        <Text style={styles.iconText}>150</Text>
        </TouchableOpacity>

      {/* Center Image */}
      {imageError ? (
        <Text style={styles.errorText}>Failed to load image</Text>
      ) : (
        <Image
          source={require('@assets/home/PebblyPal.png')}
          style={styles.centerImage}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      )}
    </View>
  );
};