"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native"
import { styles } from "./HomeStyles"
import HeartIcon from "@assets/Heart.svg"
import FlameIcon from "@assets/Vector.svg"
import CogIcon from "@assets/Settings.svg"
import StoreIcon from "@assets/Store.svg"
import { ImageBackground } from "react-native"
const { width, height } = Dimensions.get("window")
import { PebblyPal } from "../../components/pebbly/PebblyPal"
import { MealComponent } from "../../components/meal/MealComponent"
import { MealEditScreen } from "../../Screens/mealEdit/MealEditScreen"
import { MealViewer } from "../../components/mealViewer/MealViewer"
const mealData = [
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
    date: "Fri, Mar 14",
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
    date: "Fri, Mar 14",
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
    date: "Fri, Mar 14",
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
    date: "Fri, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 5,
    mealName: "Protein Shake with Banana",
    protein: 25,
    carbs: 30,
    fat: 5,
    calories: 280,
    sugar: 20,
    fibers: 3,
    sodium: 5,
    loggedTime: "3:45 PM",
    date: "Fri, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 6,
    mealName: "Egg White Omelette",
    protein: 18,
    carbs: 8,
    fat: 10,
    calories: 210,
    sugar: 1,
    fibers: 2,
    sodium: 14,
    loggedTime: "9:00 AM",
    date: "Fri, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 7,
    mealName: "Chicken Caesar Salad",
    protein: 28,
    carbs: 12,
    fat: 15,
    calories: 340,
    sugar: 3,
    fibers: 6,
    sodium: 18,
    loggedTime: "12:15 PM",
    date: "Fri, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
  {
    id: 8,
    mealName: "Turkey & Avocado Wrap",
    protein: 22,
    carbs: 28,
    fat: 16,
    calories: 420,
    sugar: 4,
    fibers: 8,
    sodium: 16,
    loggedTime: "6:30 PM",
    date: "Fri, Mar 14",
    imageUrl: "https://via.placeholder.com/80",
  },
]

export const HomeScreen = ({ onFooterVisibilityChange, onSettingsPress, customBackground }) => {
  const [imageError, setImageError] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const scrollViewRef = useRef(null)
  const bottomSheetHeight = height * 0.7
  const topContainerPosition = bottomSheetHeight * 0.4
  const shouldShowTopShadow = scrollPosition > topContainerPosition
  const proteinConsumed = 100
  const proteinGoal = 150
  const proteinProgress = proteinConsumed / proteinGoal
  const carbsConsumed = 60
  const carbsGoal = 100
  const carbsProgress = carbsConsumed / carbsGoal
  const fatConsumed = 15
  const fatGoal = 45
  const fatProgress = fatConsumed / fatGoal

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    onFooterVisibilityChange(offsetY < 5)
    setScrollPosition(offsetY)
  }

  useEffect(() => {
    onFooterVisibilityChange(true)
  }, [])

  const handleMealPress = (meal) => {
    setSelectedMeal(meal)
  }

  const handleCloseMealEdit = () => {
    setSelectedMeal(null)
  }

  const handleSaveMeal = () => {
    // Here you would save the meal data
    setSelectedMeal(null)
  }

  return (
    <View style={styles.container}>
      {customBackground && (
        <ImageBackground source={{ uri: customBackground }} blurRadius={8}>
          <View style={[{ backgroundColor: "rgba(0,0,0,0.4)" }]} />
        </ImageBackground>
      )}

      <View style={styles.backgroundShape1} />
      <View style={styles.backgroundShape2} />
      <View style={styles.backgroundShape3} />
      <View style={styles.backgroundShape5} />

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

      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress} accessibilityLabel="Open settings">
        <CogIcon width={width * 0.07} height={width * 0.07} fill="white" />
      </TouchableOpacity>

      {imageError ? (
        <Text style={styles.errorText}>Failed to load image</Text>
      ) : (
        <PebblyPal style={styles.centerImage} />
      )}

      <TouchableOpacity
        style={styles.storeContainer}
        onPress={onSettingsPress}
        accessibilityLabel="Open Cosmetics Store"
      >
        <StoreIcon width={width * 0.08} height={width * 0.08} fill="white" />
        <Text style={styles.iconText}>Store</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.flameContainer} onPress={onSettingsPress} accessibilityLabel="Open Streaks Page">
        <FlameIcon width={width * 0.08} height={width * 0.08} fill="#FF9500" />
        <Text style={styles.iconText}>150</Text>
      </TouchableOpacity>

      <MealViewer 
        mealData={mealData}
        proteinConsumed={proteinConsumed}
        proteinGoal={proteinGoal}
        carbsConsumed={carbsConsumed}
        carbsGoal={carbsGoal}
        fatConsumed={fatConsumed}
        fatGoal={fatGoal}
        styles={styles}
        onFooterVisibilityChange={onFooterVisibilityChange}
      />
    </View>
  )
}



