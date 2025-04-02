import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableWithoutFeedback, Animated, Easing } from 'react-native';

interface PebblyPalProps {
  style?: any;
}

export const PebblyPal = ({ style }: PebblyPalProps) => {
  const [isShocked, setIsShocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const pressStartTimeRef = useRef(0);
  
  // Animation values
  const positionY = useRef(new Animated.Value(-400)).current;  // Much higher starting point (-600 instead of -200)
  const squashStretch = useRef(new Animated.Value(1)).current; // For squash and stretch effect
  const stretchY = useRef(new Animated.Value(1)).current;      // Added subtle Y stretch for fluid movement
  const shadowWidth = useRef(new Animated.Value(30)).current;  // Shadow width starts small
  const shadowOpacity = useRef(new Animated.Value(0.3)).current; // Shadow opacity
  
  // Clear timeout on unmount
  useEffect(() => {
    // Start the falling animation sequence when component mounts
    startFallingAnimation();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  // Function to handle the falling animation with physics-based bouncing
  const startFallingAnimation = () => {
    // Reset animations
    positionY.setValue(-600);  // Much higher starting point
    squashStretch.setValue(1);
    stretchY.setValue(1);      // Reset Y stretch
    shadowWidth.setValue(30);
    shadowOpacity.setValue(0.3);
    
    // Physics constants
    const gravity = 1.5;   // Higher = faster falling
    const fallGravity = 0.5;
    // Create sequence with initial fall and multiple realistic bounces
    Animated.sequence([
      // Initial fall from much higher off-screen
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 750 * 1.3,  // Longer duration for higher fall
          easing: Easing.quad,
          useNativeDriver: true,
        }),
        // Subtle stretch while falling
        Animated.timing(stretchY, {
          toValue: 1.1,   // Subtle vertical stretch while falling
          duration: 600,  // Slightly shorter than the fall
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shadowWidth, {
          toValue: 125,
          duration: 750,
          easing: Easing.quad,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 750,
          easing: Easing.quad,
          useNativeDriver: false,
        }),
      ]),
      
      // First impact - squash
      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.9,  // Compress vertically on impact
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
      
      // --- FIRST BOUNCE (highest, 70px) ---
      Animated.parallel([
        // Up
        Animated.timing(positionY, {
          toValue: -60,
          duration: 300 * gravity,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Shape returns and slightly stretches vertically while going up
        Animated.timing(squashStretch, {
          toValue: 0.95,
          duration: 180 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.05,  // Slight vertical stretch going up
          duration: 180 * gravity,
          useNativeDriver: true,
        }),
        // Shadow changes
        Animated.timing(shadowWidth, {
          toValue: 70,
          duration: 300 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.4,
          duration: 300 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // Down
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 300 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Stretch vertically again as it falls
        Animated.timing(stretchY, {
          toValue: 1.03,  // Slightly stronger stretch falling down
          duration: 250 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,    // Return to normal width
          duration: 250 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(shadowWidth, {
          toValue: 125,
          duration: 300 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 300 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // --- SECOND BOUNCE (42px) ---
      // Impact squash
      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.9,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.95,  // Compress vertically on impact
          duration: 70,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        // Up
        Animated.timing(positionY, {
          toValue: -42,
          duration: 240 * gravity,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Shape returns and slightly stretches vertically
        Animated.timing(squashStretch, {
          toValue: 0.98,
          duration: 150 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.02,  // Slightly less stretch on smaller bounce
          duration: 150 * gravity,
          useNativeDriver: true,
        }),
        // Shadow
        Animated.timing(shadowWidth, {
          toValue: 85,
          duration: 240 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.5,
          duration: 240 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // Down
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 240 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Stretch vertically again as it falls
        Animated.timing(stretchY, {
          toValue: 1.02,  // Less stretch on smaller fall
          duration: 200 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,    // Return to normal width
          duration: 200 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(shadowWidth, {
          toValue: 125,
          duration: 240 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 240 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // --- THIRD BOUNCE (25px) ---
      // Impact squash
      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.95,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.96,  // Less compression on smaller impact
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        // Up
        Animated.timing(positionY, {
          toValue: -25,
          duration: 200 * gravity,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Shape returns
        Animated.timing(squashStretch, {
          toValue: 0.99,
          duration: 120 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.01,  // Even less stretch on smaller bounce
          duration: 120 * gravity,
          useNativeDriver: true,
        }),
        // Shadow
        Animated.timing(shadowWidth, {
          toValue: 100,
          duration: 200 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.6,
          duration: 200 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // Down
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 200 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Small stretch vertically again
        Animated.timing(stretchY, {
          toValue: 1.01,  // Continuing to decrease stretch
          duration: 160 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,
          duration: 160 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(shadowWidth, {
          toValue: 125,
          duration: 200 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 200 * gravity,
          useNativeDriver: false,
        }),
      ]),
      
      // Continue with remaining bounces - adding subtle stretch effects to each...
      // --- FOURTH BOUNCE (15px) ---
      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.98,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.99,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 60 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shadowWidth, {
          toValue: 125,
          duration: 60 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 60 * gravity,
          useNativeDriver: false,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,
          duration: 60 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1,   // Return to normal height
          duration: 60 * gravity,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handlePressIn = () => {
    isPressedRef.current = true;
    pressStartTimeRef.current = Date.now();
    setIsShocked(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Set timeout to revert after 500ms
    timeoutRef.current = setTimeout(() => {
      if (!isPressedRef.current) {
        setIsShocked(false);
      }
    }, 500);
  };

  const handlePressOut = () => {
    isPressedRef.current = false;
    const pressDuration = Date.now() - pressStartTimeRef.current;
    // If held longer than 500ms, set new timeout after release
    if (pressDuration >= 500) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsShocked(false);
      }, 500);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[style, { alignItems: 'center', justifyContent: 'flex-end' }]}>
        {/* Shadow ellipse - positioned 10px lower */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: -10,
            width: shadowWidth,
            height: 23,
            borderRadius: 50,
            backgroundColor: '#181818',
            opacity: shadowOpacity,
          }}
        />
        
        {/* PebblyPal character with realistic physics bouncing */}
        <Animated.View
          style={{
            transform: [
              { translateY: positionY },
              { scaleX: squashStretch }, // Added Y-scaling for fluid stretching
            ]
          }}
        >
          <Image
            source={isShocked 
              ? require('@assets/Pebbly/Shocked.png') 
              : require('@assets/Pebbly/Normal.png')}
            style={{ width: 175, height: 145 }}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};