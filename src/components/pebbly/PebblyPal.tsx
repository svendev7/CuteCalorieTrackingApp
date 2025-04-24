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
  
  const positionY = useRef(new Animated.Value(-400)).current;  
  const squashStretch = useRef(new Animated.Value(1)).current; 
  const stretchY = useRef(new Animated.Value(1)).current;      
  const shadowWidth = useRef(new Animated.Value(30)).current;  
  const shadowOpacity = useRef(new Animated.Value(0.3)).current; 
  
  useEffect(() => {
    startFallingAnimation();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const startFallingAnimation = () => {
    positionY.setValue(-600);  
    squashStretch.setValue(1);
    stretchY.setValue(1);      
    shadowWidth.setValue(30);
    shadowOpacity.setValue(0.3);
    

    const gravity = 1.5;   
    const fallGravity = 0.5;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 750 * 1.3,  
          easing: Easing.quad,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.1,   
          duration: 600,  
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
          toValue: 0.9,  
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: -60,
          duration: 300 * gravity,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 0.95,
          duration: 180 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.05,  
          duration: 180 * gravity,
          useNativeDriver: true,
        }),
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
      
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 300 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.03,  
          duration: 250 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,    
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
      

      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.9,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.95,  
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
        Animated.timing(squashStretch, {
          toValue: 0.98,
          duration: 150 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.02,  
          duration: 150 * gravity,
          useNativeDriver: true,
        }),
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
      
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 240 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.02,  
          duration: 200 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 1,    
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
      

      Animated.parallel([
        Animated.timing(squashStretch, {
          toValue: 0.95,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 0.96,  
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: -25,
          duration: 200 * gravity,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(squashStretch, {
          toValue: 0.99,
          duration: 120 * gravity,
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.01,  
          duration: 120 * gravity,
          useNativeDriver: true,
        }),
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
      
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: 0,
          duration: 200 * gravity,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(stretchY, {
          toValue: 1.01,  
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
          toValue: 1,   
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
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!isPressedRef.current) {
        setIsShocked(false);
      }
    }, 500);
  };

  const handlePressOut = () => {
    isPressedRef.current = false;
    const pressDuration = Date.now() - pressStartTimeRef.current;
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
        
        <Animated.View
          style={{
            transform: [
              { translateY: positionY },
              { scaleX: squashStretch }, 
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