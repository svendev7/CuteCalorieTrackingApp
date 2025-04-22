import React, { useState, useRef, useEffect } from "react";
import { View, Text, Animated, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { MealComponent } from "../meal/MealComponent";
import { styles } from "./MealViewerStyles"; 
const { height } = Dimensions.get("window");

// --- Interfaces (Make sure these match HomeScreen) ---
interface MealData {
  id: string;
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  loggedTime: string;
  date: string;
  imageUrl: string;
}

interface DayData {
  date: string;
  mealData: MealData[];
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  totalCaloriesConsumed: number;
  calorieGoal: number;
}

interface MealViewerProps {
  daysData: DayData[];
  onFooterVisibilityChange: (visible: boolean) => void;
  onLoadPreviousDay: () => void;
  canLoadMore: boolean;
  onMealPress: (meal: MealData) => void;
}

export const MealViewer: React.FC<MealViewerProps> = ({
  daysData,
  onFooterVisibilityChange,
  onLoadPreviousDay,
  canLoadMore,
  onMealPress,
}) => {
  // Use Animated.Value for better performance
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  
  // Track raw scroll position using state
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Define constants related to layout
  const bottomSheetVisibleHeightRatio = 0.6;
  const topContainerMarginTopRatio = 0.47;
  const bottomSheetHeight = height * bottomSheetVisibleHeightRatio;
  const firstTopContainerOffset = bottomSheetHeight * topContainerMarginTopRatio;

  // Always keep footer visible
  useEffect(() => {
    onFooterVisibilityChange(true);
  }, []);

  // Handle scroll events to update scroll position
  const handleScroll = (event) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const calculateRemainingCalories = (consumed: number, goal: number): string => {
    const remaining = goal - consumed;
    return Math.max(0, remaining).toLocaleString('en-US');
  };

  const calculateProgress = (consumed: number, goal: number): number => {
    if (goal <= 0) return 0;
    return Math.min(1, Math.max(0, consumed / goal));
  };

  // Opacity for the fixed top shadow (appears when scrolled past the threshold)
  const fixedShadowOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [0, 1], // Instant transition 0 -> 1
    extrapolate: 'clamp'
  });

  // Opacity for the handle bar inside the scroll view (disappears when scrolled past threshold)
  const scrollableHandleOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [1, 0], // Instant transition 1 -> 0
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.bottomSheetWrapper}>
      {/* Fixed Top Shadow - Always rendered, opacity controlled */}
      <Animated.View 
        style={[
          styles.bottomSheetTopShadow, // Base styles (background, radius, height)
          {
            opacity: fixedShadowOpacity, // Animated opacity
            zIndex: 20 // Ensure it's above scroll content
          }
        ]}
        pointerEvents="none" // Make it non-interactive
      >
        {/* Handle bar within the fixed shadow */}
        <View style={styles.handleBar} />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.bottomSheetScrollView}
        contentContainerStyle={[styles.bottomSheetContent, { minHeight: height }]}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1} // Use 1 for highest fidelity
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } // Use native driver for performance
        )}
        overScrollMode="always"
      >
        {daysData.map((day, index) => {
          const proteinProgress = calculateProgress(day.proteinConsumed, day.proteinGoal);
          const carbsProgress = calculateProgress(day.carbsConsumed, day.carbsGoal);
          const fatProgress = calculateProgress(day.fatConsumed, day.fatGoal);
          const remainingCalories = calculateRemainingCalories(day.totalCaloriesConsumed, day.calorieGoal);

          return (
            <React.Fragment key={day.date}>
              {/* Top Container (Summary for the day) */}
              <View
                style={[
                  styles.topContainer,
                  {
                    marginTop: index === 0 ? firstTopContainerOffset : 0,
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                  },
                ]}
              >
                {/* Handle Container inside ScrollView - Opacity controlled */}
                {index === 0 && (
                  <Animated.View 
                    style={[
                      styles.bottomSheetHandle, // Container for positioning
                      { opacity: scrollableHandleOpacity } // Animated opacity
                    ]}
                  >
                    {/* The actual handle bar element */}
                    <View style={styles.handleBar} />
                  </Animated.View>
                )}
                
                <View style={[styles.peekContent, { paddingTop: index === 0 ? 5 : 30 }]}>
                  <View style={styles.calorieSection}>
                    <Text style={styles.calorieTitle}>{remainingCalories}</Text>
                    <Text style={styles.calorieSubtitle}>REMAINING</Text>
                  </View>
                  <View style={styles.macroRow}>
                    {/* Protein */}
                    <View style={styles.macroColumn}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, styles.proteinBar, { width: `${proteinProgress * 100}%` }]} />
                      </View>
                      <Text style={styles.macroValue}>
                        {`${Math.round(day.proteinConsumed)} / ${day.proteinGoal} g`}
                      </Text>
                    </View>
                    {/* Carbs */}
                    <View style={styles.macroColumn}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, styles.carbsBar, { width: `${carbsProgress * 100}%` }]} />
                      </View>
                      <Text style={styles.macroValue}>
                         {`${Math.round(day.carbsConsumed)} / ${day.carbsGoal} g`}
                      </Text>
                    </View>
                    {/* Fat */}
                    <View style={styles.macroColumn}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, styles.fatBar, { width: `${fatProgress * 100}%` }]} />
                      </View>
                      <Text style={styles.macroValue}>
                         {`${Math.round(day.fatConsumed)} / ${day.fatGoal} g`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Container (Meals for the day) */}
              <View style={[styles.bottomContainer, { marginTop: 10 }]}>
                <View style={styles.expandedContent}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{day.date}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.mealsContainer}>
                    {day.mealData.length > 0 ? (
                       day.mealData.map((meal) => (
                         <MealComponent
                           key={`${day.date}-${meal.id}`}
                           mealName={meal.mealName}
                           protein={meal.protein}
                           carbs={meal.carbs}
                           fat={meal.fat}
                           date={meal.date}
                           calories={meal.calories}
                           loggedTime={meal.loggedTime}
                           imageUrl={meal.imageUrl}
                           onPress={() => onMealPress(meal)}
                         />
                       ))
                    ) : (
                       <Text style={styles.noMealsText}>No meals logged for this day.</Text>
                    )}
                  </View>
                  <View style={{ height: 20 }} />
                </View>
              </View>

              {/* Gap between days */}
              {index < daysData.length - 1 && <View style={{ height: 15 }} />}
            </React.Fragment>
          );
        })}

        {/* Load Previous Day Button */}
        {canLoadMore && (
          <TouchableOpacity
            style={styles.loadPreviousDayButton}
            onPress={onLoadPreviousDay}
            activeOpacity={0.7}
          >
            <Text style={styles.loadPreviousDayButtonText}>Load Previous Day</Text>
          </TouchableOpacity>
        )}

        {/* Final padding */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};