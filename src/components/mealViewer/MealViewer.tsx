import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { MealComponent } from "../meal/MealComponent";
import { MealEditScreen } from "../../Screens/mealEdit/MealEditScreen";
import { styles } from "./MealViewerStyles";
const { height } = Dimensions.get("window");

interface MealViewerProps {
  mealData: MealData[];
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  styles: any;
  onFooterVisibilityChange: (visible: boolean) => void;
}

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

export const MealViewer: React.FC<MealViewerProps> = ({
  mealData,
  proteinConsumed,
  proteinGoal,
  carbsConsumed,
  carbsGoal,
  fatConsumed,
  fatGoal,
  styles,
  onFooterVisibilityChange,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetHeight = height * 0.7;
  const topContainerPosition = bottomSheetHeight * 0.4;
  const shouldShowTopShadow = scrollPosition > topContainerPosition;
  
  // Calculate progress percentages
  const proteinProgress = proteinConsumed / proteinGoal;
  const carbsProgress = carbsConsumed / carbsGoal;
  const fatProgress = fatConsumed / fatGoal;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    onFooterVisibilityChange(offsetY < 5);
    setScrollPosition(offsetY);
  };

  const handleMealPress = (meal: MealData) => {
    setSelectedMeal(meal);
  };

  const handleCloseMealEdit = () => {
    setSelectedMeal(null);
  };

  const handleSaveMeal = () => {
    // Here you would save the meal data
    setSelectedMeal(null);
  };

  useEffect(() => {
    onFooterVisibilityChange(true);
  }, []);

  return (
    <View style={styles.bottomSheetWrapper}>
      {shouldShowTopShadow && (
        <View style={styles.bottomSheetTopShadow}>
          <View style={[styles.handleBar, { marginTop: 0 }]} />
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        style={styles.bottomSheetScrollView}
        contentContainerStyle={[styles.bottomSheetContent, { minHeight: bottomSheetHeight * 2 }]}
        bounces={true}
        bouncesZoom={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={1}
        overScrollMode="always"
      >
        <View
          style={[
            styles.topContainer,
            {
              marginTop: bottomSheetHeight * 0.4,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            },
          ]}
        >
          <View style={styles.bottomSheetHandle}>{!shouldShowTopShadow && <View style={styles.handleBar} />}</View>
          <View style={[styles.peekContent, { paddingTop: 5 }]}>
            <View style={styles.calorieSection}>
              <Text style={styles.calorieTitle}>2.000</Text>
              <Text style={styles.calorieSubtitle}>REMAINING</Text>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, styles.proteinBar, { width: `${proteinProgress * 100}%` }]} />
                </View>
                <Text style={styles.macroValue}>
                  {proteinConsumed + " "}/{" " + proteinGoal + " "}g
                </Text>
              </View>
              <View style={styles.macroColumn}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, styles.carbsBar, { width: `${carbsProgress * 100}%` }]} />
                </View>
                <Text style={styles.macroValue}>
                  {carbsConsumed + " "}/{" " + carbsGoal + " "}g
                </Text>
              </View>

              <View style={styles.macroColumn}>
                <Text style={styles.macroLabel}>Fat</Text>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, styles.fatBar, { width: `${fatProgress * 100}%` }]} />
                </View>
                <Text style={styles.macroValue}>
                  {fatConsumed + " "}/{" " + fatGoal + " "}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.expandedContent}>
            {/* Date line */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>Friday, Mar 14</Text>
            </View>

            {/* Separator line */}
            <View style={styles.separator} />

            {/* Meal components */}
            <View style={styles.mealsContainer}>
              {mealData.map((meal) => (
                <MealComponent
                  key={meal.id}
                  mealName={meal.mealName}
                  protein={meal.protein}
                  carbs={meal.carbs}
                  fat={meal.fat}
                  date={meal.date}
                  calories={meal.calories}
                  loggedTime={meal.loggedTime}
                  imageUrl={meal.imageUrl}
                  onPress={() => handleMealPress(meal)}
                />
              ))}
            </View>

            <View style={{ height: 80 }} />
          </View>
        </View>
      </ScrollView>

      {/* Meal Edit Screen */}
      {selectedMeal && (
        <MealEditScreen
          mealName={selectedMeal.mealName}
          protein={selectedMeal.protein}
          carbs={selectedMeal.carbs}
          fat={selectedMeal.fat}
          calories={selectedMeal.calories}
          sugar={selectedMeal.sugar}
          fibers={selectedMeal.fibers}
          sodium={selectedMeal.sodium}
          loggedTime={selectedMeal.loggedTime}
          date={selectedMeal.date}
          imageUrl={selectedMeal.imageUrl}
          onClose={handleCloseMealEdit}
          onSave={handleSaveMeal}
        />
      )}
    </View>
  );
};