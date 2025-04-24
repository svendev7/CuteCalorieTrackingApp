import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SimpleToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'loading';
  onDismiss: () => void;
  duration?: number;
}

const SimpleToast: React.FC<SimpleToastProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 2000, // Default 2 seconds
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Show/hide toast based on visibility
  useEffect(() => {
    if (visible) {
      // Slide in and fade in animation - quick (300ms)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration only for non-loading types
      if (type !== 'loading' && duration > 0) {
        timer.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [visible, type, duration]);

  const handleDismiss = () => {
    // Slide out and fade out animation - slower (500ms)
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 500, // 0.5 seconds as requested
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500, // 0.5 seconds as requested
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
      // Reset position for next time
      translateY.setValue(-100);
      opacity.setValue(0);
    });
  };

  // Define icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MaterialCommunityIcons name="check-circle" size={24} color="#45A557" />;
      case 'error':
        return <MaterialCommunityIcons name="alert-circle" size={24} color="#FF3B30" />;
      case 'info':
        return <MaterialCommunityIcons name="information" size={24} color="#007AFF" />;
      case 'loading':
        return <MaterialCommunityIcons name="loading" size={24} color="#FFFFFF" />;
      default:
        return <MaterialCommunityIcons name="check-circle" size={24} color="#45A557" />;
    }
  };

  // If not visible, don't render anything
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <MaterialCommunityIcons name="close" size={18} color="#A0A0A0" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: '100%',
  },
  message: {
    color: '#EDEDED',
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  }
});

export default SimpleToast; 