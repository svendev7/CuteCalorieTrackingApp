"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, Alert, ImageBackground, Animated, StyleSheet } from "react-native"
import HeartIcon from "@assets/Heart.svg"
import FlameIcon from "@assets/Vector.svg"
import CogIcon from "@assets/Settings.svg"
import StoreIcon from "@assets/Store.svg"
const { width, height } = Dimensions.get("window")
import { PebblyPal } from "../../components/pebbly/PebblyPal"
import { MealViewer } from "../../components/mealViewer/MealViewer"
import MealEditScreen from "../editting/MealEditScreen"
import AnimatedFooter from "../../components/footer/AnimatedFooter"
import type { Meal } from "../../services/mealService"
import { getMealsByDate, updateMeal, deleteMeal } from "../../services/mealService"
import { useAuth } from "../../hooks/useAuth"

// Helper function to calculate daily totals
const calculateDailyTotals = (meals: Meal[]) => {
  if (!meals || meals.length === 0) {
    return { proteinConsumed: 0, carbsConsumed: 0, fatConsumed: 0, totalCaloriesConsumed: 0 }
  }
  return meals.reduce(
    (totals, meal) => {
      totals.proteinConsumed += meal.protein || 0
      totals.carbsConsumed += meal.carbs || 0
      totals.fatConsumed += meal.fat || 0
      totals.totalCaloriesConsumed += meal.calories || 0
      return totals
    },
    { proteinConsumed: 0, carbsConsumed: 0, fatConsumed: 0, totalCaloriesConsumed: 0 },
  )
}

// Helper function to format date as "Day, Month Date" (e.g., "Friday, Mar 14")
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  }
  return date.toLocaleDateString("en-US", options)
}

// Helper function to get previous date
const getPreviousDate = (dateString: string): string => {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0]
}

// Helper function to format time (e.g., "10:44 AM")
const formatTime = (timeString: string): string => {
  const date = new Date(timeString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Default nutrition goals - could be fetched from user profile in a real app
const DEFAULT_GOALS = {
  protein: 150,
  carbs: 200,
  fat: 65,
  calories: 2000,
}

interface MealData {
  id: string
  mealName: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sugar: number
  fibers: number
  sodium: number
  loggedTime: string
  date: string
  imageUrl: string
}

interface DayData {
  date: string
  mealData: MealData[]
  proteinConsumed: number
  proteinGoal: number
  carbsConsumed: number
  carbsGoal: number
  fatConsumed: number
  fatGoal: number
  totalCaloriesConsumed: number
  calorieGoal: number
}

export const HomeScreen = ({ onFooterVisibilityChange, onSettingsPress, customBackground, navigation }) => {
  const [imageError, setImageError] = useState(false)
  const [displayedDaysData, setDisplayedDaysData] = useState<DayData[]>([])
  const [loadedDates, setLoadedDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null)
  const [showMealEdit, setShowMealEdit] = useState(false)
  const [preventFooter, setPreventFooter] = useState(false)
  const [footerVisible, setFooterVisible] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const footerAnim = useRef(new Animated.Value(0)).current
  const { user } = useAuth()

  // Load today's meals initially
  useEffect(() => {
    if (user) {
      loadMealsForDate(getTodayDate())
    }
  }, [user])

  // Add a function to refresh the current view
  const refreshCurrentView = () => {
    if (user) {
      // Refresh all loaded dates
      const promises = loadedDates.map(date => loadMealsForDate(date))
      return Promise.all(promises)
    }
    return Promise.resolve()
  }

  // Expose the refresh method to the navigation
  useEffect(() => {
    if (navigation && typeof navigation.setParams === 'function') {
      // Make refreshCurrentView available to other components via the navigation param
      navigation.setParams({ refreshHomeScreen: refreshCurrentView })
    } else if (navigation) {
      // Alternative approach when setParams is not available
      navigation.refreshHomeScreen = refreshCurrentView
    }
  }, [navigation, loadedDates, user])

  // Listen for focus events to refresh data when returning to this screen
  useEffect(() => {
    let unsubscribeFocus

    if (navigation && navigation.addListener) {
      unsubscribeFocus = navigation.addListener("focus", () => {
        // Refresh data when screen comes into focus
        refreshCurrentView()
        
        // Wait until navigation completes before allowing footer to show again
        setTimeout(() => {
          setPreventFooter(false)
          setFooterVisible(true)
        }, 300)
      })
    }

    return () => {
      if (unsubscribeFocus && typeof unsubscribeFocus.remove === "function") {
        unsubscribeFocus.remove()
      }
    }
  }, [navigation, refreshCurrentView])

  // Handle footer visibility changes from scroll
  const handleFooterVisibility = (visible: boolean) => {
    // Update internal footer visibility state
    setFooterVisible(visible && !preventFooter)

    // Also call the parent's handler if it exists
    if (onFooterVisibilityChange) {
      onFooterVisibilityChange(visible && !preventFooter)
    }
  }

  // Navigate to log meal screen
  const handleNavigateToLogMeal = () => {
    // Lock footer in hidden state
    setPreventFooter(true)
    setFooterVisible(false)

    // Navigate after animation starts
    setTimeout(() => {
      navigation.navigate("LogMeal")
    }, 50)
  }

  // Navigate to stats screen
  const handleNavigateToStats = () => {
    setPreventFooter(true)
    setFooterVisible(false)

    setTimeout(() => {
      navigation.navigate("Stats")
    }, 50)
  }

  // Navigate to games screen
  const handleNavigateToGames = () => {
    setPreventFooter(true)
    setFooterVisible(false)

    setTimeout(() => {
      navigation.navigate("Games")
    }, 50)
  }

  // Load meals for a specific date
  const loadMealsForDate = async (dateString: string) => {
    if (!user) return

    try {
      setIsLoading(true)

      // Fetch meals for this date from Firebase
      const meals = await getMealsByDate(user.uid, dateString)

      // Calculate totals
      const dailyTotals = calculateDailyTotals(meals)

      // Format meals for the component
      const formattedMeals = meals.map((meal) => ({
        id: meal.id,
        mealName: meal.mealName,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        calories: meal.calories,
        sugar: meal.sugar || 0,
        fibers: meal.fibers || 0,
        sodium: meal.sodium || 0,
        loggedTime: meal.loggedTime ? formatTime(meal.loggedTime) : "12:00 PM",
        date: formatDate(dateString),
        imageUrl: meal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400",
      }))

      // Create the day data
      const dayData: DayData = {
        date: formatDate(dateString),
        mealData: formattedMeals,
        ...dailyTotals,
        proteinGoal: DEFAULT_GOALS.protein,
        carbsGoal: DEFAULT_GOALS.carbs,
        fatGoal: DEFAULT_GOALS.fat,
        calorieGoal: DEFAULT_GOALS.calories,
      }

      // Add to displayed days
      setDisplayedDaysData((prevDays) => {
        // If we already loaded this date, replace it
        if (loadedDates.includes(dateString)) {
          return prevDays.map((day) => (day.date === formatDate(dateString) ? dayData : day))
        }
        // Otherwise add it to the list
        return [...prevDays, dayData]
      })

      // Keep track of loaded dates
      setLoadedDates((prev) => {
        if (!prev.includes(dateString)) {
          return [...prev, dateString]
        }
        return prev
      })
    } catch (error) {
      console.error("Error loading meals for date:", error)
      Alert.alert("Error", "Failed to load meals")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadPreviousDay = () => {
    // Find the oldest date we've loaded
    if (loadedDates.length === 0) return

    // Sort dates to find the oldest one
    const sortedDates = [...loadedDates].sort()
    const oldestDate = sortedDates[0]

    // Get the previous date
    const previousDate = getPreviousDate(oldestDate)

    // Load meals for the previous date
    loadMealsForDate(previousDate)
  }

  const handleMealPress = (meal: MealData) => {
    setSelectedMeal(meal)
    setShowMealEdit(true)
  }

  const handleCloseMealEdit = () => {
    setSelectedMeal(null)
    setShowMealEdit(false)
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      // Delete the meal from Firebase
      await deleteMeal(mealId)
      
      // Close the edit screen
      handleCloseMealEdit()
      
      // Refresh the current view to remove the deleted meal
      refreshCurrentView()
      
      // Show success message
      Alert.alert("Success", "Meal deleted successfully")
    } catch (error) {
      console.error("Error deleting meal:", error)
      Alert.alert("Error", "Failed to delete meal")
    }
  }

  const handleSaveMeal = async (updatedMeal: Meal) => {
    try {
      // If the meal doesn't have a date at all, get it from the original meal via selectedMeal
      if (!updatedMeal.date && selectedMeal) {
        // Try to find a valid date from selectedMeal
        if (selectedMeal.date) {
          const isISODateFormat = /^\d{4}-\d{2}-\d{2}$/.test(selectedMeal.date);
          if (isISODateFormat) {
            updatedMeal.date = selectedMeal.date;
          } else {
            // Extract date from formatted string if possible
            const dateMatch = selectedMeal.date.match(/\w+, \w+ (\d+)/);
            if (dateMatch) {
              const day = dateMatch[1];
              const month = new Date().getMonth() + 1;
              const year = new Date().getFullYear();
              updatedMeal.date = `${year}-${month.toString().padStart(2, "0")}-${day.padStart(2, "0")}`;
            }
          }
        }
      }
      
      // Last resort - if still no date, use today
      if (!updatedMeal.date) {
        updatedMeal.date = getTodayDate();
      }
      
      // Update the meal in Firebase - the updateMeal function now preserves date and loggedTime
      await updateMeal(updatedMeal.id, updatedMeal);

      // Reload meals for the affected date
      await loadMealsForDate(updatedMeal.date);

      // Close edit screen
      handleCloseMealEdit();

      // Show success message
      Alert.alert("Success", "Meal updated successfully");
    } catch (error) {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to update meal");
    }
  }

  // Convert MealData to Meal type for MealEditScreen
  const convertToMealType = (mealData: MealData): Meal => {
    // Preserve the original date if it exists in the data
    let originalDate = null;
    
    // Get the date from the meal to determine the format
    if (mealData.date) {
      // Check if date is in ISO format or formatted date
      const isISODateFormat = /^\d{4}-\d{2}-\d{2}$/.test(mealData.date);
      
      if (isISODateFormat) {
        // Already in ISO format, use directly
        originalDate = mealData.date;
      } else {
        // Try to extract date from formatted string
        try {
          // Extract the day from formatted date (e.g., "Monday, July 12")
          const dateMatch = mealData.date.match(/\w+, \w+ (\d+)/);
          if (dateMatch) {
            const day = dateMatch[1];
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            originalDate = `${year}-${month.toString().padStart(2, "0")}-${day.padStart(2, "0")}`;
          } else {
            // Fallback to today if unable to extract
            originalDate = getTodayDate();
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          originalDate = getTodayDate();
        }
      }
    } else {
      // No date in the meal data, use today
      originalDate = getTodayDate();
    }

    return {
      id: mealData.id,
      userId: user?.uid || "",
      mealName: mealData.mealName,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      calories: mealData.calories,
      sugar: mealData.sugar,
      fibers: mealData.fibers,
      sodium: mealData.sodium,
      loggedTime: mealData.loggedTime,
      date: originalDate,
      imageUrl: mealData.imageUrl,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    }
  }

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      {customBackground && (
        <ImageBackground source={{ uri: customBackground }} blurRadius={8} style={styles.imgBackground}>
          <View style={[{ backgroundColor: "rgba(0,0,0,0.4)", flex: 1 }]} />
        </ImageBackground>
      )}
      <View style={styles.backgroundShape1} />
      <View style={styles.backgroundShape2} />
      <View style={styles.backgroundShape3} />
      <View style={styles.backgroundShape5} />

      {/* Top UI Elements */}
      <View style={styles.topLeft}>
        <Text style={styles.name}>{user?.displayName || "User"}</Text>
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

      <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
        <CogIcon width={24} height={24} />
      </TouchableOpacity>

      {/* Pebbly Character */}
      {imageError ? (
        <Text style={styles.errorText}>Failed to load image</Text>
      ) : (
        <PebblyPal style={styles.centerImage} />
      )}

      {/* Store Button */}
      <TouchableOpacity
        style={styles.storeContainer}
        onPress={onSettingsPress}
        accessibilityLabel="Open Cosmetics Store"
      >
        <StoreIcon width={width * 0.08} height={width * 0.08} fill="white" />
        <Text style={styles.iconText}>Store</Text>
      </TouchableOpacity>

      {/* Streak Button */}
      <TouchableOpacity style={styles.flameContainer} onPress={onSettingsPress} accessibilityLabel="Open Streaks Page">
        <FlameIcon width={width * 0.08} height={width * 0.08} fill="#FF9500" />
        <Text style={styles.iconText}>150</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <MealViewer
          daysData={displayedDaysData}
          onLoadPreviousDay={handleLoadPreviousDay}
          onMealPress={handleMealPress}
          onFooterVisibilityChange={handleFooterVisibility}
          canLoadMore={true}
        />
      </View>

      {/* Animated Footer */}
      <AnimatedFooter
        isVisible={footerVisible}
        activeTab={activeTab}
        onAddPress={handleNavigateToLogMeal}
        onStatsPress={handleNavigateToStats}
        onRocketPress={handleNavigateToGames}
      />

      {/* Meal Edit Modal */}
      {selectedMeal && (
        <MealEditScreen
          meal={convertToMealType(selectedMeal)}
          onClose={handleCloseMealEdit}
          onSave={handleSaveMeal}
          onDelete={handleDeleteMeal}
          visible={showMealEdit}
        />
      )}
    </View>
  )
}

const colors = {
  background: '#000000',    
  text: '#FFFFFF',             
  secondary: '#A0A0A0',        
  subtleText: '#FFFFFF',       
  handleBar: '#8E8E8E',        
  cardBackground: '#1C1C1E',   
  cardBorder: '#2E2E2E',
  backgroundShape: '#0A0A0A',
  backgroundOpacity: 0.8, 
  protein: '#EF476F',          
  carbs: '#06D6A0',            
  fat: '#FFD166',             
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 60,
  },
  imgBackground:{
    backgroundColor: colors.backgroundShape,
  },
  container: {
    flex: 1,
    paddingTop: height * 0.1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  topLeft: {
    position: 'absolute',
    top: height * 0.09,
    left: width * 0.07,
    zIndex: 1,
    flexDirection: 'column', 
    justifyContent: 'flex-start',
    gap: width * 0.01,
  },
  name: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Geist Sans',
  },
  heartsContainer: {
    flexDirection: 'row',
    left: width * 0.005,
    marginTop: 2,
  },
  heartIcon: {
    marginRight: width * 0.007,
  },
  storeContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    left: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  flameContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    right: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  iconText: {
    color: colors.secondary,
    fontSize: Math.min(width, height) * 0.03,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: height * 0.09,
    right: width * 0.05,
    padding: width * 0.02,
    zIndex: 1,
    borderRadius: width * 0.04,
  },
  firebaseButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  firebaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centerImage: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: height * 0.18,
    zIndex: 1,
  },
  errorText: {
    color: '#FF3B30',
    alignSelf: 'center',
    marginTop: height * 0.3,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSheetWrapper: {
    position: 'absolute',
    left: (width - 370) / 2,
    bottom: height * 0.117 - 110,
    width: 370,
    height: height * 0.6,
    zIndex: 5,
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetScrollView: {
    height: height * 0.8,
    maxHeight: height * 0.8,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetContent: {
    paddingBottom: 50,
    minHeight: height * 1.2,
  },
  bottomSheetTopShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  bottomSheetHandle: {
    width: '100%',
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: colors.handleBar,
    borderRadius: 3,
    marginTop: 8,
  },
  peekContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    height: 160,
  },
  topContainer: {
    width: '100%',
    height: 175,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 10,
    zIndex: 999,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    paddingVertical: 20,
    zIndex: 999,
    minHeight: height * 0.5,
  },
  expandedContent: {
    padding: 20,
  },
  expandedTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  expandedText: {
    color: colors.subtleText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  calorieSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -35,
    marginBottom: 15,
    zIndex: 1,
  },
  calorieTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieSubtitle: {
    color: colors.text,
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
    marginTop: -3,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 5,
  },
  macroColumn: {
    alignItems: 'center',
    width: '30%',
  },
  macroBarContainer: {
    height: 6,
    backgroundColor: 'rgba(217, 217, 217, 0.33)',
    borderRadius: 3,
    marginBottom: 2,
    marginTop: 3,
    width: 45,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
  proteinBar: {
    backgroundColor: colors.protein,
    opacity: 0.9,
  },
  carbsBar: {
    backgroundColor: colors.carbs,
    opacity: 0.9,
  },
  fatBar: {
    backgroundColor: colors.fat,
    opacity: 0.9,
  },
  macroLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  macroValue: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 1,
  },
  backgroundShape1: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.02,
    left: -width * 0.3,
    zIndex: 0,
    transform: [{ rotate: '35deg' }],
  },
  backgroundShape2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 30,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.25,
    right: -width * 0.25,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  backgroundShape3: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    transform: [{ rotate: '45deg' }],
    top: height * 0.65,
    left: width * 0.15,
    zIndex: 0,
  },
  backgroundShape5: {
    position: 'absolute',
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.07,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.45,
    left: width * 0.05,
    zIndex: 0,
    transform: [{ rotate: '-25deg' }],
  },
  backgroundDots: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.05,
  },
  mealsContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    marginLeft: -15
  },
  dateContainer: {
    marginBottom: 15,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(120, 120, 120, 0.2)",
    marginHorizontal: -6,
    marginLeft: -8,
    marginBottom: -9,
  },
  loadPreviousDayButton: {
    backgroundColor: colors.cardBackground, // Or a different subtle color
    borderColor: colors.cardBorder, // Match card border
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Space above the button
    marginBottom: 10, // Space below the button
    marginHorizontal: 5, // Align with card margins slightly
    width: '100%', // Make it almost full width
    alignSelf: 'center',
  },
  loadPreviousDayButtonText: {
    color: colors.text, // White or light grey text
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Geist Sans', // Use your app's font
  },
  noMealsText: {
      color: colors.secondary, // Use a subtle grey color
      fontSize: 14,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 20, // Add padding if needed
      fontFamily: 'Geist Sans',
  },
  mealEditOverlay: {
    position: 'absolute',
    top: 50,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',   // Center content horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    zIndex: 100, // Ensure it's above everything else (MealViewer wrapper has zIndex 5)
  },
  footer: {
    position: 'absolute',
    bottom: -height * 0.016, // Slight adjustment to match Union SVG design
    width: '100%',
    height: height * 0.115,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  
  footerButton: {
    backgroundColor: "#45A557", // Green button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  
  footerAddButton: {
    backgroundColor: "#45A557", // Green button
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.15 / 2, // Make it perfectly circular
    alignItems: "center",
    justifyContent: "center",
    elevation: 8, // Add shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});


