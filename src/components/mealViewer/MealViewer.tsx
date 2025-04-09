import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StyleSheet } from "react-native"; // Added StyleSheet
import { MealComponent } from "../meal/MealComponent"; // Adjust path if needed
import { styles } from "./MealViewerStyles"; 
const { height } = Dimensions.get("window");

// --- Interfaces (Make sure these match HomeScreen) ---
interface MealData {
  id: number;
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Define constants related to layout
  const bottomSheetVisibleHeightRatio = 0.6; // The portion of the screen the sheet wrapper takes initially
  const topContainerMarginTopRatio = 0.47; // The margin-top of the *first* top container relative to the sheet height

  const bottomSheetHeight = height * bottomSheetVisibleHeightRatio; // Actual height of the scrollable wrapper
  const firstTopContainerOffset = bottomSheetHeight * topContainerMarginTopRatio; // Calculate the offset where the first container starts

  // *** FIX: Restore the original logic for showing the top shadow ***
  // Show shadow when scroll position goes beyond the initial top offset of the *first* summary container
  const shouldShowTopShadow = scrollPosition > firstTopContainerOffset;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    onFooterVisibilityChange(offsetY < 5); // Keep footer visible only at the very top
    setScrollPosition(offsetY);
  };

  useEffect(() => {
    onFooterVisibilityChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateRemainingCalories = (consumed: number, goal: number): string => {
    const remaining = goal - consumed;
    return Math.max(0, remaining).toLocaleString('en-US');
  };

  const calculateProgress = (consumed: number, goal: number): number => {
    if (goal <= 0) return 0; // Prevent division by zero or negative goals
    return Math.min(1, Math.max(0, consumed / goal));
  };

  return (
    <View style={styles.bottomSheetWrapper}>
       {/* Top Shadow - Rendered conditionally based on the corrected logic */}
      {shouldShowTopShadow && (
        <View style={styles.bottomSheetTopShadow}>
          {/* Ensure handleBar style exists and is correct */}
          <View style={[styles.handleBar, { marginTop: -1 }]} />
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        style={styles.bottomSheetScrollView}
        // *** FIX: Adjust contentContainerStyle minHeight if needed ***
        // It should be large enough to allow scrolling past the first element trigger the shadow
        // If bottomSheetHeight is height * 0.6, and first element offset is 0.4 * (height * 0.6),
        // the content needs to be taller than the visible scroll view area.
        contentContainerStyle={[styles.bottomSheetContent, { minHeight: height }]} // Ensure minimum height allows scrolling
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="always"
      >
        {/* Map over each day's data */}
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
                    // *** FIX: Use the calculated offset for the first item's margin ***
                    marginTop: index === 0 ? firstTopContainerOffset : 0,
                    // Keep consistent border radius or adjust if needed
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                  },
                ]}
              >
                <View style={styles.bottomSheetHandle}>
                  {/* Show handle only on the very first container when not scrolled past its initial position */}
                  {index === 0 && scrollPosition <= firstTopContainerOffset && <View style={styles.handleBar} />}
                </View>
                <View style={[styles.peekContent, { paddingTop: 5 }]}>
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
      </ScrollView>
    </View>
  );
};