// components/Footer.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Union from '@assets/Union.svg';
import Plus from '@assets/Plus.svg';
import Rocket from '@assets/Rocket.svg';
import Stats from '@assets/Stats.svg';
import Meal from '@assets/Meal.svg';
import Scan from '@assets/Scan.svg';
import Custom from '@assets/Custom.svg';

const { width, height } = Dimensions.get('window');

const Footer = ({ onPlusPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const MealAnim = useRef(new Animated.Value(0)).current;
  const ScanAnim = useRef(new Animated.Value(0)).current;
  const CustomAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.spring(MealAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.spring(ScanAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.spring(CustomAnim, {
        toValue,
        useNativeDriver: true,
      })
    ]).start();
    
    setIsExpanded(!isExpanded);
    onPlusPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg']
  });

  const button1Y = MealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.12]
  });

  const button2Y = ScanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.08]
  });

  const button3Y = CustomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.08]
  });

  const button1X = MealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.15]
  });

  const button3X = CustomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.15]
  });

  const opacity = MealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <View style={styles.footerContainer}>
      <Union width="100%" height={height * 0.15} style={styles.backgroundSvg} />

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button1Y }],
        opacity 
      }]}>
        <TouchableOpacity onPress={() => console.log('Button 1 pressed')}>
          <Meal width={width * 0.15} height={width * 0.15} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button2Y }, { translateX: button1X }],
        opacity 
      }]}>
        <TouchableOpacity onPress={() => console.log('Button 2 pressed')}>
          <Scan width={width * 0.15} height={width * 0.15} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button3Y }, { translateX: button3X }],
        opacity 
      }]}>
        <TouchableOpacity onPress={() => console.log('Button 3 pressed')}>
          <Custom width={width * 0.15} height={width * 0.15} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.centerButton, { transform: [{ rotate: rotation }] }]}>
          <Plus width={width * 0.15} height={width * 0.15} onPress={toggleMenu} />
      </Animated.View>

      <TouchableOpacity style={[styles.sideButton, styles.leftButton]}>
        <Rocket width={width * 0.08} height={width * 0.08} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.sideButton, styles.rightButton]}>
        <Stats width={width * 0.08} height={width * 0.08} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: -height * 0.016,
    width: '100%',
    height: height * 0.115,
    zIndex: 100,
  },
  backgroundSvg: {
    position: 'absolute',
    bottom: 0,
  },
  sideButton: {
    position: 'absolute',
    padding: width * 0.04,
    bottom: height * 0.037,
  },
  leftButton: {
    left: width * 0.128,
  },
  rightButton: {
    right: width * 0.128,
  },
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: height * 0.065,
    zIndex: 101,
  },
  popoutButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: height * 0.05,
  },
});

export default Footer;