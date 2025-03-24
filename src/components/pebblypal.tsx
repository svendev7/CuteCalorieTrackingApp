import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';
import AngrySvg from '@assets/Pebbly/Angry.svg';
import WinkRightSvg from '@assets/Pebbly/WinkRight.svg';
import WinkLeftSvg from '@assets/Pebbly/WinkLeft.svg';
import ShockedSvg from '@assets/Pebbly/Shocked.svg';
import NormalSvg from '@assets/Pebbly/Normal.svg';
interface PebblyPalProps {
  style?: any;
}

export const PebblyPal = ({ style }: PebblyPalProps) => {
  const [expression, setExpression] = useState<'default' | 'right' | 'left' | 'shocked'>('default');
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lastActionTime = useRef(Date.now());
  const animationQueue = useRef<(() => void)[]>([]);
  const isAnimating = useRef(false);

  // Unified animation coordinator
  const queueAnimation = (animation: () => void) => {
    if (!isAnimating.current && Date.now() - lastActionTime.current > 5000) {
      animation();
    } else {
      animationQueue.current.push(animation);
    }
  };

  // Process animation queue
  const processQueue = () => {
    if (animationQueue.current.length > 0 && !isAnimating.current) {
      const nextAnimation = animationQueue.current.shift();
      nextAnimation?.();
    }
  };

  // Smooth blink animation with fade
  const performBlink = (side: 'left' | 'right') => {
    isAnimating.current = true;
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setExpression(side);
      setTimeout(() => {
        setExpression('default');
        isAnimating.current = false;
        lastActionTime.current = Date.now();
        processQueue();
      }, 200);
    });
  };

  // Bounce animation with physics
  const performBounce = () => {
    isAnimating.current = true;
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -30,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false;
      lastActionTime.current = Date.now();
      processQueue();
    });
  };

  // Random animation triggers
  useEffect(() => {
    const scheduleNextAction = () => {
      const delay = 5000 + Math.random() * 10000;
      const action = Math.random() > 0.5 ? 
        () => queueAnimation(performBounce) : 
        () => queueAnimation(() => performBlink(Math.random() > 0.5 ? 'left' : 'right'));

      setTimeout(() => {
        action();
        scheduleNextAction();
      }, delay);
    };

    scheduleNextAction();
  }, []);

  // Press handler with shock animation
  const handlePress = () => {
    if (isAnimating.current) return;

    // Interrupt current animations
    bounceAnim.stopAnimation();
    fadeAnim.stopAnimation();
    animationQueue.current = [];
    
    setExpression('shocked');
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setExpression('default');
        lastActionTime.current = Date.now();
        isAnimating.current = false;
        processQueue();
      }, 1000);
    });
  };

  // Get current expression component with smooth transitions
  const getExpressionComponent = () => {
    switch (expression) {
      case 'right': return (
        <Animated.View style={{ opacity: fadeAnim }}>
          <WinkRightSvg width={200} height={200} />
        </Animated.View>
      );
      case 'left': return (
        <Animated.View style={{ opacity: fadeAnim }}>
          <WinkLeftSvg width={200} height={200} />
        </Animated.View>
      );
      case 'shocked': return <ShockedSvg width={200} height={200} />;
      default: return <NormalSvg width={200} height={200} />;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      style={{ alignItems: 'center' }}
    >
      <Animated.View 
        style={[
          style,
          { 
            transform: [{ translateY: bounceAnim }],
            overflow: 'visible' 
          }
        ]}
      >
        {getExpressionComponent()}
      </Animated.View>
    </TouchableOpacity>
  );
};