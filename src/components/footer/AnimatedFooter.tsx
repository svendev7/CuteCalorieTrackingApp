import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// App colors from HomeStyles.ts
const COLORS = {
  background: '#1C1C1E',
  accent: '#06D6A0',
  text: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.3)'
};

interface AnimatedFooterProps {
  isVisible: boolean;
  onAddPress?: () => void;
  onRocketPress?: () => void;
  onStatsPress?: () => void;
}

const AnimatedFooter: React.FC<AnimatedFooterProps> = ({ 
  isVisible, 
  onAddPress,
  onRocketPress, 
  onStatsPress 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideOutAnim = useRef(new Animated.Value(0)).current;
  const footerVisibilityAnim = useRef(new Animated.Value(isVisible ? 0 : 100)).current;
  
  // Animation for toggling the menu
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    // Start multiple animations together
    Animated.parallel([
      // Rotate plus to cross
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Scale and fade menu items
      Animated.timing(scaleAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Fade menu items
      Animated.timing(fadeAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsOpen(!isOpen);
  };

  // Animation for footer visibility
  useEffect(() => {
    // Close the menu if it's open when hiding the footer
    if (!isVisible && isOpen) {
      setIsOpen(false);
      rotateAnim.setValue(0);
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }

    // Animate the footer in or out
    Animated.timing(footerVisibilityAnim, {
      toValue: isVisible ? 0 : 100,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [isVisible]);
  
  // Animation for sliding the footer out of screen when pressing a button
  const animateOut = (callback: () => void) => {
    // First close the menu
    if (isOpen) {
      toggleMenu();
    }
    
    // Execute the callback immediately
    callback();
  };

  // Calculate rotation for plus/cross animation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg']
  });

  // Calculate footer visibility transform for sliding in/out of screen
  const footerVisibilityTransform = {
    transform: [
      {
        translateY: footerVisibilityAnim
      }
    ],
    opacity: footerVisibilityAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0]
    })
  };

  // Handle menu button presses
  const handleButtonPress = (action: () => void) => {
    // Animate out
    animateOut(action);
  };

  return (
    <Animated.View style={[styles.container, footerVisibilityTransform]}>
      {/* Menu Items - Vertical layout DIRECTLY above button */}
      <Animated.View style={[
        styles.menuContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0]
            })}
          ]
        }
      ]}>
        {/* Log Meal Button */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleButtonPress(onAddPress || (() => {}))}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="fast-food" size={20} color={COLORS.accent} />
            <Text style={styles.menuText}>Log Meal</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Button */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleButtonPress(onStatsPress || (() => {}))}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="stats-chart" size={20} color={COLORS.accent} />
            <Text style={styles.menuText}>Stats</Text>
          </View>
        </TouchableOpacity>

        {/* Rocket Button */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleButtonPress(onRocketPress || (() => {}))}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="rocket" size={20} color={COLORS.accent} />
            <Text style={styles.menuText}>Games</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={36} color={COLORS.text} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
    zIndex: 100,
  },
  toggleButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 75, // Direct placement above the button
    right: 0,
    alignItems: 'center',
    width: 120, // Fixed width for all menu items
  },
  menuItem: {
    width: '100%',
    marginBottom: 5, // Tiny gap between items
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    width: '100%',
  },
  menuText: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default AnimatedFooter; 