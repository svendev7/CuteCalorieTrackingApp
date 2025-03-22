import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
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

export const HomeScreen = ({ onFooterVisibilityChange }) => {
  const [imageError, setImageError] = useState(false);
  
  // Bottom sheet animation
  const bottomSheetHeight = height * 0.8; // 80% of screen height
  const peekHeight = 150; // Height visible at bottom
  const pan = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);
  const currentPosition = useRef(0);
  const resistance = 0.001; // Resistance factor for elastic effect
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Track footer visibility based on bottom sheet position
  useEffect(() => {
    const listener = pan.addListener(({ value }) => {
      // Show footer when bottom sheet is at or near the bottom (within 5px)
      onFooterVisibilityChange(value > -5);
    });

    return () => {
      pan.removeListener(listener);
    };
  }, [pan, onFooterVisibilityChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical movements
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animation
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
        // Store the current position when starting to drag
        lastGestureDy.current = currentPosition.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = lastGestureDy.current + gestureState.dy;
        
        // Calculate elastic resistance with smoother curve
        let finalPosition = newPosition;
        
        // If trying to scroll past the top
        if (newPosition < -bottomSheetHeight + peekHeight) {
          const overScroll = -bottomSheetHeight + peekHeight - newPosition;
          finalPosition = -bottomSheetHeight + peekHeight - (overScroll * resistance * 0.3); // Reduced resistance further
        }
        // If trying to scroll past the bottom
        else if (newPosition > 0) {
          const overScroll = newPosition;
          finalPosition = overScroll * resistance * 0.3; // Reduced resistance further
        }
        
        currentPosition.current = finalPosition;
        pan.setValue(finalPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentPos = currentPosition.current;
        
        // Determine the target position based on current position and velocity
        let targetPosition;
        
        // If moving very fast, snap in that direction with velocity-based threshold
        if (Math.abs(velocity) > 1.2) { // Increased velocity threshold for more controlled movement
          targetPosition = velocity > 0 ? 0 : -bottomSheetHeight + peekHeight;
        }
        // If trying to go past boundaries, snap back
        else if (currentPos > 0) {
          targetPosition = 0;
        }
        else if (currentPos < -bottomSheetHeight + peekHeight) {
          targetPosition = -bottomSheetHeight + peekHeight;
        }
        // Otherwise, snap to nearest position based on current position
        else {
          const snapThreshold = (-bottomSheetHeight + peekHeight) / 2;
          targetPosition = currentPos < snapThreshold ? -bottomSheetHeight + peekHeight : 0;
        }
        
        // Animate to the target position with smoother spring animation
        animationRef.current = Animated.spring(pan, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: 35, // Reduced tension for smoother movement
          friction: 12, // Increased friction to prevent overshooting
          velocity: Math.min(Math.max(velocity, -0.5), 0.5), // Reduced velocity range
        });
        animationRef.current.start();
      },
    })
  ).current;

  // Limit pan value to prevent dragging too far with smoother interpolation
  const panY = pan.interpolate({
    inputRange: [-bottomSheetHeight + peekHeight - 200, -bottomSheetHeight + peekHeight, 0, 200],
    outputRange: [-bottomSheetHeight + peekHeight - 80, -bottomSheetHeight + peekHeight, 0, 80], // Reduced overscroll
    extrapolate: 'clamp',
  });

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    >
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

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            transform: [{ translateY: panY }],
            elevation: 999,
          },
        ]}
      >
        <View style={styles.topContainer}>
          <View style={styles.bottomSheetHandle}>
            <View style={styles.handleBar} />
          </View>
          <View style={styles.peekContent}>
            <Text style={styles.peekText}>Pull up for more info</Text>
          </View>
        </View>
        
        <View style={styles.bottomContainer}>
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Expanded Content</Text>
            <Text style={styles.expandedText}>
              This is the expanded content area that shows when you pull up the sheet.
              You can add any components here that you want to display.
              Drag back down to hide this content.
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};