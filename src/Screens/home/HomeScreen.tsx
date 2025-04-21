"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, Alert, ImageBackground, Animated } from "react-native"
import { styles } from "./HomeStyles"
import HeartIcon from "@assets/Heart.svg"
import FlameIcon from "@assets/Vector.svg"
import CogIcon from "@assets/Settings.svg"
import StoreIcon from "@assets/Store.svg"
const { width, height } = Dimensions.get("window")
import { PebblyPal } from "../../components/pebbly/PebblyPal"
import { MealViewer } from "../../components/mealViewer/MealViewer"
import { MealEditScreen } from "../meals/MealEditScreen"
import AnimatedFooter from "../../components/footer/AnimatedFooter"
import type { Meal } from "../../services/mealService"
import { getMealsByDate, updateMeal } from "../../services/mealService"
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

  const handleSaveMeal = async (updatedMeal: Meal) => {
    try {
      // Update the meal in Firebase
      await updateMeal(updatedMeal.id, updatedMeal)

      // Get the date from the meal to update the correct day
      const mealDate = updatedMeal.date?.includes("-") ? updatedMeal.date : getTodayDate() // Default to today if not in YYYY-MM-DD format

      // Reload meals for the affected date
      await loadMealsForDate(mealDate)

      // Close edit screen
      handleCloseMealEdit()

      // Show success message
      Alert.alert("Success", "Meal updated successfully")
    } catch (error) {
      console.error("Error saving meal:", error)
      Alert.alert("Error", "Failed to update meal")
    }
  }

  // Convert MealData to Meal type for MealEditScreen
  const convertToMealType = (mealData: MealData): Meal => {
    // Extract the YYYY-MM-DD date from the formatted date if needed
    const dateMatch = mealData.date.match(/\w+, \w+ (\d+)/)
    const day = dateMatch ? dateMatch[1] : new Date().getDate().toString()
    const month = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    const isoDate = `${year}-${month.toString().padStart(2, "0")}-${day.padStart(2, "0")}`

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
      date: isoDate,
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
          visible={showMealEdit}
        />
      )}
    </View>
  )
}
