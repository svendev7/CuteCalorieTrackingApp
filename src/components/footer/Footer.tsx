import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import Union from '@assets/Union.svg';
import Plus from '@assets/Plus.svg';
import Rocket from '@assets/Rocket.svg';
import Stats from '@assets/Stats.svg';
import Meal from '@assets/Meal.svg';
import Scan from '@assets/Scan.svg';
import Custom from '@assets/Custom.svg';
import { styles } from './FooterStyles';
const { width, height } = Dimensions.get('window');

// Interface for Footer props
interface FooterProps {
  isVisible: boolean;
  onOpenCustomMeal?: () => void;
  onOpenSavedMeals?: () => void;
  onOpenScanQR?: () => void;
}

const Footer = ({ isVisible, onOpenCustomMeal, onOpenSavedMeals, onOpenScanQR }: FooterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const MealAnim = useRef(new Animated.Value(0)).current;
  const ScanAnim = useRef(new Animated.Value(0)).current;
  const CustomAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 0 : 1,
      useNativeDriver: true,
      tension: 15,
      friction: 10,
    }).start();
  }, [isVisible]);

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
  };

  const handleMealPress = () => {
    if (onOpenSavedMeals) {
      onOpenSavedMeals();
    }
    toggleMenu();
  };

  const handleScanPress = () => {
    if (onOpenScanQR) {
      onOpenScanQR();
    }
    toggleMenu();
  };

  const handleCustomPress = () => {
    if (onOpenCustomMeal) {
      onOpenCustomMeal();
    }
    toggleMenu();
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
        fill="#3F4E4F" 
      />

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button1Y }],
        opacity 
      }]}>
        <TouchableOpacity onPress={handleMealPress}>
          <Meal width={width * 0.15} height={width * 0.15} />
          <Text style={{ color: '#FFFFFF', fontSize: 10, textAlign: 'center', marginTop: 2 }}>Saved</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button2Y }, { translateX: button1X }],
        opacity 
      }]}>
        <TouchableOpacity onPress={handleScanPress}>
          <Scan width={width * 0.15} height={width * 0.15} />
          <Text style={{ color: '#FFFFFF', fontSize: 10, textAlign: 'center', marginTop: 2 }}>Scan QR</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.popoutButton, { 
        transform: [{ translateY: button3Y }, { translateX: button3X }],
        opacity 
      }]}>
        <TouchableOpacity onPress={handleCustomPress}>
          <Custom width={width * 0.15} height={width * 0.15} />
          <Text style={{ color: '#FFFFFF', fontSize: 10, textAlign: 'center', marginTop: 2 }}>Custom</Text>
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
    </Animated.View>
  );
};

export default Footer;