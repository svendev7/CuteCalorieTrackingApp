import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { styles } from './HomeStyles';
import HeartIcon from '@assets/Heart.svg';
import FlameIcon from '@assets/Vector.svg';
import CogIcon from '@assets/Settings.svg';
import StoreIcon from '@assets/Store.svg';
import Stats from '@assets/Stats.svg';
const { width, height } = Dimensions.get('window');
import { PebblyPal } from '../../components/pebblypal';
// Background dot pattern
const DotPattern = () => (
  <Svg width={width} height={height} style={styles.backgroundDots}>
    <Defs>
      <Pattern id="dotPattern" width={40} height={40} patternUnits="userSpaceOnUse">
        <Circle cx="20" cy="20" r="0.5" fill="rgb(120, 120, 120)" />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#dotPattern)" />
  </Svg>
);

const SvgIcon = ({ path, size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={path} fill={color} />
  </Svg>
);

export const HomeScreen = ({ onFooterVisibilityChange }) => {
  const [imageError, setImageError] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollViewRef = useRef(null);
  const bottomSheetHeight = height * 0.7; // 70% of screen height
  const peekHeight = 180; // Height visible at bottom
  
  // Calculate when the top container is about to be cut off
  const topContainerPosition = bottomSheetHeight * 0.4;
  const shouldShowTopShadow = scrollPosition > topContainerPosition;
  
  // Define a simple threshold based on scroll position
  const hideElementsThreshold = 80;
  
  // Simple boolean visibility flag for icons only
  const shouldShowIcons = scrollPosition < hideElementsThreshold;
  
  // Calories progress
  const caloriesConsumed = 1250;
  const caloriesGoal = 2000;
  const caloriesProgress = Math.min(caloriesConsumed / caloriesGoal, 1);
  
  // Macronutrient tracking
  const proteinConsumed = 100; // example value
  const proteinGoal = 150;
  const proteinProgress = proteinConsumed / proteinGoal;
  
  const carbsConsumed = 60; // example value
  const carbsGoal = 100;
  const carbsProgress = carbsConsumed / carbsGoal;
  
  const fatConsumed = 15; // example value
  const fatGoal = 45;
  const fatProgress = fatConsumed / fatGoal;
  
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
      {/* Background Elements */}
      <View style={styles.backgroundShape1} />
      <View style={styles.backgroundShape2} />
      <View style={styles.backgroundShape3} />
      <View style={styles.backgroundShape5} />
      
      {/* Pattern Elements */}
      <DotPattern />
      
      {/* Top Left Section */}
      <View style={styles.topLeft}>
        <Text style={styles.name}>Kekke steen</Text>
        <View style={styles.heartsContainer}>
          {[...Array(5)].map((_, i) => (
            <HeartIcon
              key={`heart-${i}`}
              width={width * 0.06}
              height={width * 0.06}
              fill="#FF3B30"
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
          width={width * 0.07}
          height={width * 0.07}
          fill="white"
        />
      </TouchableOpacity>

      {/* Center Image */}
      {imageError ? (
        <Text style={styles.errorText}>Failed to load image</Text>
      ) : (
        <PebblyPal
          style={styles.centerImage}
        />
      )}
      
      {/* Store and Flame buttons with immediate visibility */}
      {shouldShowIcons && (
        <TouchableOpacity 
          style={styles.storeContainer}
        >
          <StoreIcon
            width={width * 0.08}
            height={width * 0.08}
            fill="white"
          />
          <Text style={styles.iconText}>Store</Text>
        </TouchableOpacity>
      )}

      {shouldShowIcons && (
        <TouchableOpacity 
          style={styles.flameContainer}
        >
          <FlameIcon
            width={width * 0.08}
            height={width * 0.08}
            fill="#FF9500"
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
            { minHeight: bottomSheetHeight * 2 }
          ]}
          bounces={true}
          bouncesZoom={true}
          alwaysBounceVertical={true}
          decelerationRate="normal"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={1}
          overScrollMode="always"
        >
          <View style={[
            styles.topContainer, 
            { 
              marginTop: bottomSheetHeight * 0.4, 
              borderTopLeftRadius: 15, 
              borderTopRightRadius: 15 
            }
          ]}>
            <View style={styles.bottomSheetHandle}>
              {!shouldShowTopShadow && <View style={styles.handleBar} />}
            </View>
            <View style={[styles.peekContent, { paddingTop: 5 }]}>
              {/* Calorie Counter Section */}
              <View style={styles.calorieSection}>
                <Text style={styles.calorieTitle}>2.000</Text>
                <Text style={styles.calorieSubtitle}>REMAINING</Text>
              </View>
              
              {/* Macronutrient Section - Side by side */}
              <View style={styles.macroRow}>
                {/* Protein */}
                <View style={styles.macroColumn}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <View style={styles.macroBarContainer}>
                    <View style={[styles.macroBar, styles.proteinBar, { width: `${proteinProgress * 100}%` }]} />
                  </View>
                  <Text style={styles.macroValue}>{proteinConsumed+ " "}/{ " " + proteinGoal + " "}g</Text>
                </View>
                
                {/* Carbs */}
                <View style={styles.macroColumn}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <View style={styles.macroBarContainer}>
                    <View style={[styles.macroBar, styles.carbsBar, { width: `${carbsProgress * 100}%` }]} />
                  </View>
                  <Text style={styles.macroValue}>{carbsConsumed+ " "}/{ " " + carbsGoal + " "}g</Text>
                </View>
                
                {/* Fat */}
                <View style={styles.macroColumn}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <View style={styles.macroBarContainer}>
                    <View style={[styles.macroBar, styles.fatBar, { width: `${fatProgress * 100}%` }]} />
                  </View>
                  <Text style={styles.macroValue}>{fatConsumed+ " "}/{ " " + fatGoal + " "}g</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.bottomContainer}>
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Today's Summary</Text>
              
              <Text style={[styles.expandedTitle, { marginTop: 20 }]}>Recent Meals</Text>
              <Text style={styles.expandedText}>
                Track your daily progress here with detailed statistics about your meals
                and nutritional intake. Add meals and snacks to keep your PebblyPal happy!
              </Text>
              
              {/* The rest of the content remains similar but with updated styling */}
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