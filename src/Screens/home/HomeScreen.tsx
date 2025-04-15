"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, Alert, ImageBackground, StyleSheet, Animated } from "react-native"
import { styles } from "./HomeStyles"
import HeartIcon from "@assets/Heart.svg"
import FlameIcon from "@assets/Vector.svg"
import CogIcon from "@assets/Settings.svg"
import StoreIcon from "@assets/Store.svg"

const { width, height } = Dimensions.get("window")
import { PebblyPal } from "../../components/pebbly/PebblyPal"
import { MealViewer } from "../../components/mealViewer/MealViewer"
import { MealEditScreen } from "../meals/MealEditScreen"
import type { Meal } from "../../services/mealService"
import { useAuth } from "../../hooks/useAuth"

// Current day meal data (Friday, Mar 14)
const todayMealData = [
  {
    id: 1,
    mealName: "Potato's & Chicken & Carrots",
    protein: 20,
    carbs: 80,
    fat: 44,
    calories: 500,
    sugar: 5,
    fibers: 33,
    sodium: 12,
    loggedTime: "10:44 AM",
    date: "Friday, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 2,
    mealName: "Grilled Salmon with Asparagus",
    protein: 32,
    carbs: 15,
    fat: 18,
    calories: 380,
    sugar: 3,
    fibers: 8,
    sodium: 15,
    loggedTime: "1:30 PM",
    date: "Friday, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 3,
    mealName: "Greek Yogurt with Berries",
    protein: 15,
    carbs: 25,
    fat: 5,
    calories: 220,
    sugar: 18,
    fibers: 4,
    sodium: 8,
    loggedTime: "8:15 AM",
    date: "Friday, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 4,
    mealName: "Quinoa Bowl with Avocado",
    protein: 12,
    carbs: 35,
    fat: 14,
    calories: 320,
    sugar: 2,
    fibers: 12,
    sodium: 10,
    loggedTime: "7:20 PM",
    date: "Friday, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
]

// Thursday, Mar 13
const thursdayMealData = [
  {
    id: 101,
    mealName: "Protein Shake with Banana",
    protein: 25,
    carbs: 30,
    fat: 5,
    calories: 280,
    sugar: 20,
    fibers: 3,
    sodium: 5,
    loggedTime: "3:45 PM",
    date: "Thursday, Mar 13",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 102,
    mealName: "Egg White Omelette",
    protein: 18,
    carbs: 8,
    fat: 10,
    calories: 210,
    sugar: 1,
    fibers: 2,
    sodium: 14,
    loggedTime: "9:00 AM",
    date: "Thursday, Mar 13",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 103,
    mealName: "Chicken Caesar Salad",
    protein: 28,
    carbs: 12,
    fat: 15,
    calories: 340,
    sugar: 3,
    fibers: 6,
    sodium: 18,
    loggedTime: "12:15 PM",
    date: "Thursday, Mar 13",
    imageUrl: "https://via.placeholder.com/80",
  },
]

// Wednesday, Mar 12
const wednesdayMealData = [
  {
    id: 201,
    mealName: "Avocado Toast",
    protein: 10,
    carbs: 35,
    fat: 15,
    calories: 310,
    sugar: 2,
    fibers: 7,
    sodium: 8,
    loggedTime: "10:30 AM",
    date: "Wednesday, Mar 12",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 202,
    mealName: "Tuna Sandwich",
    protein: 25,
    carbs: 30,
    fat: 12,
    calories: 340,
    sugar: 3,
    fibers: 5,
    sodium: 15,
    loggedTime: "1:15 PM",
    date: "Wednesday, Mar 12",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 203,
    mealName: "Steak with Sweet Potato",
    protein: 35,
    carbs: 40,
    fat: 20,
    calories: 480,
    sugar: 8,
    fibers: 6,
    sodium: 12,
    loggedTime: "7:45 PM",
    date: "Wednesday, Mar 12",
    imageUrl: "https://via.placeholder.com/80",
  },
]

// Tuesday, Mar 11
const tuesdayMealData = [
  {
    id: 301,
    mealName: "Overnight Oats",
    protein: 12,
    carbs: 45,
    fat: 8,
    calories: 300,
    sugar: 15,
    fibers: 10,
    sodium: 5,
    loggedTime: "8:00 AM",
    date: "Tuesday, Mar 11",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 302,
    mealName: "Burrito Bowl",
    protein: 22,
    carbs: 65,
    fat: 18,
    calories: 510,
    sugar: 5,
    fibers: 12,
    sodium: 20,
    loggedTime: "1:00 PM",
    date: "Tuesday, Mar 11",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 303,
    mealName: "Grilled Chicken Sandwich",
    protein: 28,
    carbs: 32,
    fat: 15,
    calories: 380,
    sugar: 4,
    fibers: 3,
    sodium: 16,
    loggedTime: "6:30 PM",
    date: "Tuesday, Mar 11",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 304,
    mealName: "Vanilla Greek Yogurt",
    protein: 15,
    carbs: 12,
    fat: 4,
    calories: 140,
    sugar: 10,
    fibers: 0,
    sodium: 3,
    loggedTime: "9:45 PM",
    date: "Tuesday, Mar 11",
    imageUrl: "https://via.placeholder.com/80",
  },
]

// Helper function to calculate daily totals (replace with actual logic/fetching)
const calculateDailyTotals = (meals) => {
  if (!meals || meals.length === 0) {
    return { proteinConsumed: 0, carbsConsumed: 0, fatConsumed: 0, totalCaloriesConsumed: 0 }
  }
  return meals.reduce(
    (totals, meal) => {
      totals.proteinConsumed += meal.protein
      totals.carbsConsumed += meal.carbs
      totals.fatConsumed += meal.fat
      totals.totalCaloriesConsumed += meal.calories
      return totals
    },
    { proteinConsumed: 0, carbsConsumed: 0, fatConsumed: 0, totalCaloriesConsumed: 0 },
  )
}

// --- Historical Data Structure (Modify this if fetching from API) ---
// Structure: Array of objects, each representing a day with its meals and GOALS
// For simplicity, we'll use fixed goals here, but ideally, goals could vary per day.
const historicalDays = [
  {
    date: "Thursday, Mar 13",
    mealData: thursdayMealData,
    proteinGoal: 140,
    carbsGoal: 120,
    fatGoal: 50,
    calorieGoal: 1900,
  },
  {
    date: "Wednesday, Mar 12",
    mealData: wednesdayMealData,
    proteinGoal: 160,
    carbsGoal: 100,
    fatGoal: 40,
    calorieGoal: 2000,
  },
  {
    date: "Tuesday, Mar 11",
    mealData: tuesdayMealData,
    proteinGoal: 150,
    carbsGoal: 110,
    fatGoal: 45,
    calorieGoal: 2100,
  },
]

// --- Define MealData type (add calorieGoal if needed per day) ---
interface MealData {
  id: number
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
  calorieGoal: number // Add total calorie goal for the day
}

export const HomeScreen = ({ onFooterVisibilityChange, onSettingsPress, customBackground }) => {
  const [imageError, setImageError] = useState(false)
  const [displayedDaysData, setDisplayedDaysData] = useState<DayData[]>([])
  const [nextDayToLoadIndex, setNextDayToLoadIndex] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null)
  const [showMealEdit, setShowMealEdit] = useState(false)
  const { user } = useAuth()

  // --- Initial Day Setup ---
  useEffect(() => {
    // Calculate totals for the initial day
    const todayTotals = calculateDailyTotals(todayMealData)
    const todayCalorieGoal = 2000 // Example goal for today
    const todayProteinGoal = 150
    const todayCarbsGoal = 100
    const todayFatGoal = 45

    const initialDay: DayData = {
      date: "Friday, Mar 14", // Assuming today is this date
      mealData: todayMealData,
      ...todayTotals,
      proteinGoal: todayProteinGoal,
      carbsGoal: todayCarbsGoal,
      fatGoal: todayFatGoal,
      calorieGoal: todayCalorieGoal,
    }
    setDisplayedDaysData([initialDay])
  }, [])

  useEffect(() => {
    onFooterVisibilityChange(true)
  }, [])

  const handleLoadPreviousDay = () => {
    if (nextDayToLoadIndex < historicalDays.length) {
      const previousDayInfo = historicalDays[nextDayToLoadIndex]
      const previousDayTotals = calculateDailyTotals(previousDayInfo.mealData)

      const dayToAdd: DayData = {
        date: previousDayInfo.date,
        mealData: previousDayInfo.mealData,
        ...previousDayTotals,
        proteinGoal: previousDayInfo.proteinGoal,
        carbsGoal: previousDayInfo.carbsGoal,
        fatGoal: previousDayInfo.fatGoal,
        calorieGoal: previousDayInfo.calorieGoal,
      }

      setDisplayedDaysData((prevDays) => [...prevDays, dayToAdd])
      setNextDayToLoadIndex(nextDayToLoadIndex + 1)
    } else {
      Alert.alert("No More Data", "No more historical meal data available.")
    }
  }

  const handleMealPress = (meal: MealData) => {
    setSelectedMeal(meal)
    setShowMealEdit(true)
  }

  const handleCloseMealEdit = () => {
    setSelectedMeal(null)
    setShowMealEdit(false)
  }

  const handleSaveMeal = (updatedMeal: Meal) => {
    console.log("Saving meal:", updatedMeal)
    // Here you would update the meal in your data source
    // For now, we'll just close the edit screen
    handleCloseMealEdit()
  }

  // Convert MealData to Meal type for MealEditScreen
  const convertToMealType = (mealData: MealData): Meal => {
    return {
      id: mealData.id.toString(),
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
      date: mealData.date,
      imageUrl: mealData.imageUrl,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    }
  }

  return (
    <View style={styles.container}>
      {/* --- Background Elements --- */}
      {customBackground && (
        <ImageBackground source={{ uri: customBackground }} blurRadius={8} style={styles.imgBackground}>
          <View style={[{ backgroundColor: "rgba(0,0,0,0.4)", flex: 1 }]} />
        </ImageBackground>
      )}
      <View style={styles.backgroundShape1} />
      <View style={styles.backgroundShape2} />
      <View style={styles.backgroundShape3} />
      <View style={styles.backgroundShape5} />

      {/* --- Top UI Elements --- */}
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
          onFooterVisibilityChange={onFooterVisibilityChange}
          canLoadMore={nextDayToLoadIndex < historicalDays.length}
        />
      </View>

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
