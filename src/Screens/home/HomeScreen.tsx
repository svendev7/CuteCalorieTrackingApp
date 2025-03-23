import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollViewRef = useRef(null);
  const bottomSheetHeight = height * 0.8; // 80% of screen height
  const peekHeight = 150; // Height visible at bottom
  
  // Calculate when the top container is about to be cut off
  // This is based on the marginTop value (bottomSheetHeight * 0.4) of the topContainer
  const topContainerPosition = bottomSheetHeight * 0.4;
  const shouldShowTopShadow = scrollPosition > topContainerPosition;
  
  // Center image position variables (from styles)
  const centerImageTopPosition = height * 0.3; // Approximate position from the top based on styles
  
  // Icon positions based on styles (bottom position from the top of the screen)
  const iconsBottomPosition = height * 0.75; // Approximate position where icons are
  
  // Bottom sheet's initial position from the bottom of the screen
  const bottomSheetInitialBottom = height * 0.117;
  
  // Calculate when the top of the scroll view reaches the icons
  // This happens when scrollPosition + the height of visible part of bottom sheet = icon position from top
  const bottomSheetVisibleHeight = height - bottomSheetInitialBottom - peekHeight;
  const scrollReachesIconsPosition = iconsBottomPosition - bottomSheetVisibleHeight;
  
  // Calculate fade for icons based on when they're about to be covered
  const iconFadeStart = 70; // Start fading when scrolled this many pixels
  const iconFadeDuration = 25; // Complete fade over this many pixels 
  
  // Calculate icon opacity directly
  const calculateIconOpacity = () => {
    if (scrollPosition < iconFadeStart) return 1;
    if (scrollPosition > iconFadeStart + iconFadeDuration) return 0;
    return 1 - ((scrollPosition - iconFadeStart) / iconFadeDuration);
  };
  
  const storeOpacity = calculateIconOpacity();
  const flameOpacity = calculateIconOpacity();
  
  // Common fade settings for the center image
  const fadeStartPosition = topContainerPosition * 0.6 - 20; // Start fading earlier
  const fadeEndPosition = topContainerPosition * 0.95; // Complete fade sooner
  
  // Calculate opacity value based on scroll position (1 = fully visible, 0 = invisible)
  const calculateOpacity = (startPos, endPos) => {
    if (scrollPosition <= startPos) return 1; // Fully visible until start position
    if (scrollPosition >= endPos) return 0; // Fully transparent after end position
    
    // Gradually decrease opacity between start and end positions
    return 1 - ((scrollPosition - startPos) / (endPos - startPos));
  };
  
  // Different fade rates for different elements
  const centerImageOpacity = calculateOpacity(fadeStartPosition, fadeEndPosition);
  
  // Monitor scroll position to control footer visibility
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Show footer when bottom sheet is at or near the bottom
    onFooterVisibilityChange(offsetY < 5);
    setScrollPosition(offsetY);
  };

  // Ensure footer is visible on initial render
  useEffect(() => {
    onFooterVisibilityChange(true);
  }, []);

  // Scroll to initial position (fully dragged down)
  useEffect(() => {
    // Wait a bit to make sure components are rendered
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        // Start with the sheet fully dragged down
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
      
      {/* Center Image */}
      {imageError ? (
        <Text style={styles.errorText}>Failed to load image</Text>
      ) : (
        centerImageOpacity > 0 && (
          <Image
            source={require('@assets/home/PebblyPal.png')}
            style={[styles.centerImage, { opacity: centerImageOpacity }]}
            onError={() => setImageError(true)}
            resizeMode="contain"
          />
        )
      )}
      
      {/* Store and Flame buttons with calculated opacity */}
      {storeOpacity > 0 && (
        <TouchableOpacity 
          style={[styles.storeContainer, { opacity: storeOpacity }]}
        >
          <StoreIcon
            width={width * 0.08}
            height={width * 0.08}
            fill="white"
          />
          <Text style={styles.iconText}>Store</Text>
        </TouchableOpacity>
      )}

      {flameOpacity > 0 && (
        <TouchableOpacity 
          style={[styles.flameContainer, { opacity: flameOpacity }]}
        >
          <FlameIcon
            width={width * 0.08}
            height={width * 0.08}
            fill="orange"
          />
          <Text style={styles.iconText}>150</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet - Simplified with ScrollView */}
      <View style={styles.bottomSheetWrapper}>
        {shouldShowTopShadow && (
          <View style={styles.bottomSheetTopShadow}>
            <View style={[styles.handleBar, { marginTop: 0 }]} />
          </View>
        )}
        <ScrollView
          ref={scrollViewRef}
          style={styles.bottomSheetScrollView}
          contentContainerStyle={[
            styles.bottomSheetContent,
            { minHeight: bottomSheetHeight * 2 } // Changed from height to minHeight and increased multiplier
          ]}
          bounces={true}
          bouncesZoom={true}
          alwaysBounceVertical={true}
          decelerationRate="normal"
          showsVerticalScrollIndicator={false} // Show scroll indicator
          onScroll={handleScroll}
          scrollEventThrottle={16}
          overScrollMode="always" // For Android
        >
          <View style={[
            styles.topContainer, 
            { 
              marginTop: bottomSheetHeight * 0.4, 
              borderTopLeftRadius: 10, 
              borderTopRightRadius: 10 
            }
          ]}>
            <View style={styles.bottomSheetHandle}>
              {!shouldShowTopShadow && <View style={styles.handleBar} />}
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
              {/* Add more content to ensure scrollability */}
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>Additional Content</Text>
                <Text style={styles.expandedText}>
                  Here's some additional content to make sure we have enough
                  to scroll through. This ensures you can see the elastic
                  bounce effect when you reach the top or bottom of the content.
                </Text>
              </View>
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>More Information</Text>
                <Text style={styles.expandedText}>
                  Even more content to ensure there's plenty to scroll through.
                  This makes the elastic bounce effect more noticeable and useful.
                </Text>
              </View>
              
              {/* Additional content sections */}
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>Daily Stats</Text>
                <Text style={styles.expandedText}>
                  Track your daily progress here with detailed statistics about your activity.
                  You can view calories burned, steps taken, and active minutes throughout the day.
                  Compare your performance with previous days to see your improvement over time.
                </Text>
              </View>
              
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>Nutrition Information</Text>
                <Text style={styles.expandedText}>
                  Monitor your nutritional intake including macronutrients, vitamins, and minerals.
                  Set goals for daily calorie consumption and track how well you're meeting your targets.
                  Get personalized recommendations based on your activity level and dietary preferences.
                </Text>
              </View>
              
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>Exercise Routines</Text>
                <Text style={styles.expandedText}>
                  Browse through customized workout plans designed specifically for your fitness level.
                  Each routine includes detailed instructions, estimated calorie burn, and difficulty rating.
                  Follow along with animated guides to ensure proper form and maximize your results.
                </Text>
              </View>
              
              <View style={{ marginTop: 30 }}>
                <Text style={styles.expandedTitle}>Sleep Analysis</Text>
                <Text style={styles.expandedText}>
                  Review your sleep patterns including duration, quality, and consistency.
                  Learn how your daily habits affect your rest and what changes could improve your sleep.
                  Set sleep goals and receive notifications to help maintain a healthy sleep schedule.
                </Text>
              </View>
              
              {/* Add extra bottom space */}
              <View style={{ height: 80 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};