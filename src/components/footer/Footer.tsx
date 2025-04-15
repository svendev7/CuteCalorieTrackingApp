import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import Union from '@assets/Union.svg';
import Plus from '@assets/Plus.svg';
import Rocket from '@assets/Rocket.svg';
import Stats from '@assets/Stats.svg';
import { styles } from './FooterStyles';
const { width, height } = Dimensions.get('window');

// Interface for Footer props - Simplified
interface FooterProps {
  isVisible: boolean;
  onAddPress?: () => void; // Renamed for clarity
  onRocketPress?: () => void;
  onStatsPress?: () => void;
}

const Footer = ({ isVisible, onAddPress, onRocketPress, onStatsPress }: FooterProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 0 : 1,
      useNativeDriver: true,
      tension: 15,
      friction: 10,
    }).start();
  }, [isVisible, slideAnim]); // Added slideAnim dependency

  // Calculate footer slide animation
  const footerSlide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.15] // Slide down by footer height
  });

  return (
    <Animated.View style={[
      styles.footerContainer,
      {
        transform: [{ translateY: footerSlide }]
      }
    ]}>
      <Union
        width="100%"
        height={height * 0.15}
        style={styles.backgroundSvg}
        fill="#3F4E4F" // Or use appropriate color from your theme
      />

      <TouchableOpacity style={styles.centerButton} onPress={onAddPress}>
          <Plus width={width * 0.15} height={width * 0.15} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.sideButton, styles.leftButton]} onPress={onRocketPress}>
        <Rocket width={width * 0.08} height={width * 0.08} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.sideButton, styles.rightButton]} onPress={onStatsPress}>
        <Stats width={width * 0.08} height={width * 0.08} />
      </TouchableOpacity>

    </Animated.View>
  );
};

export default Footer;