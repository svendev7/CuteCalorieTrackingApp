"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native"
import { Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons" // Using Ionicons for cart
import { auth } from "../../config/firebase"
import {
  getRecentMealsByUserId,
  getFavoriteMealsByUserId,
  getSavedMealsByUserId,
  updateFavoriteStatus,
  deleteUserFood,
  getUserFoodsByType,
  updateFoodCartStatus,
  addMeal,
  deleteMeal,
} from "../../services/mealService"
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler"

const { width, height } = Dimensions.get("window")

// Interfaces for data types
interface FoodItem {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sodium?: number
  sugar?: number
  fibers?: number
  type: "Recent" | "Created" | "Favorites"
  isFavorite: boolean
  servingSize?: number
}

interface MealItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sodium?: number
  sugar?: number
  fibers?: number
  type: "Recent" | "Created" | "Favorites"
  isFavorite: boolean
  servingSize?: number
}

interface AddMealLogScreenProps {
  navigation: any // Add proper navigation types later
}

const AddMealLogScreen: React.FC<AddMealLogScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Foods")
  const [searchText, setSearchText] = useState("")
  const [activeFilter, setActiveFilter] = useState("Recent")
  const [cartCount, setCartCount] = useState(0) // Example cart count
  const [currentMealItems, setCurrentMealItems] = useState<(FoodItem | MealItem)[]>([]) // State to hold added items
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | MealItem | null>(null)
  const [quantity, setQuantity] = useState("100")
  const [unit, setUnit] = useState("g")
  const modalOffset = useRef(new Animated.Value(0)).current
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current
  const filterIndicatorPosition = useRef(new Animated.Value(0)).current

  // Add states for Firestore data
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add state for tracking favorite items
  const [favoriteItems, setFavoriteItems] = useState<{ [key: string]: boolean }>({})
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({})

  // Add haptic feedback function
  const triggerHapticFeedback = () => {
    if (Platform.OS === "ios") {
      // This is a placeholder - in a real app you would use a library like expo-haptics
      // For example: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // You'll need to install expo-haptics or react-native-haptic-feedback
    }
  }

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        Animated.timing(modalOffset, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(modalOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  // Fetch meals based on active filter
  useEffect(() => {
    fetchMeals()
  }, [activeFilter])

  const fetchMeals = async () => {
    try {
      setLoading(true)
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Fetch meals based on active filter
      let meals = []
      let foods = []

      switch (activeFilter) {
        case "Recent":
          meals = await getRecentMealsByUserId(currentUser.uid)
          foods = await getUserFoodsByType(currentUser.uid, "recent")
          break
        case "Favorites":
          meals = await getFavoriteMealsByUserId(currentUser.uid)
          foods = await getUserFoodsByType(currentUser.uid, "favorite")
          break
        case "Created":
          meals = await getSavedMealsByUserId(currentUser.uid)
          foods = await getUserFoodsByType(currentUser.uid, "created")
          break
        default:
          meals = await getRecentMealsByUserId(currentUser.uid)
          foods = await getUserFoodsByType(currentUser.uid, "recent")
      }

      // Transform meals to the format expected by the UI
      const transformedMeals = meals.map((meal) => ({
        id: meal.id,
        name: meal.mealName,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sodium: meal.sodium || 0,
        sugar: meal.sugar || 0,
        fibers: meal.fibers || 0,
        type: activeFilter as "Recent" | "Created" | "Favorites",
        isFavorite: meal.isFavorite || false,
        servingSize: meal.servingSize,
      }))
      
      // Transform foods to the format expected by the UI
      const transformedFoods = foods.map((food) => ({
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        sodium: food.sodium || 0,
        sugar: food.sugar || 0,
        fibers: food.fibers || 0,
        type: activeFilter as "Recent" | "Created" | "Favorites",
        isFavorite: food.isFavorite || false,
        servingSize: food.servingSize,
      }))

      // Also update our favorites state to reflect backend state
      const newFavorites = {}
      
      // Add favorites from meals
      meals.forEach(meal => {
        if (meal.isFavorite) {
          newFavorites[meal.id] = true
        }
      })
      
      // Add favorites from foods
      foods.forEach(food => {
        if (food.isFavorite) {
          newFavorites[food.id] = true
        }
      })
      
      // Update our local state
      setFavoriteItems(newFavorites)

      if (activeTab === "Meals") {
        setMealItems(transformedMeals)
      } else {
        setFoodItems(transformedFoods)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching meals and foods:", err)
      setError("Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  const handleTabPress = (tabName: string) => {
    // Animate tab indicator
    Animated.spring(tabIndicatorPosition, {
      toValue: tabName === "Foods" ? 0 : 1,
      friction: 20, // Higher friction = less bouncy
      tension: 100, // Lower tension = slower
      useNativeDriver: false,
    }).start()

    setActiveTab(tabName)
    // Reset filter to Recent when switching tabs
    setActiveFilter("Recent")
    // Reset filter indicator position
    Animated.spring(filterIndicatorPosition, {
      toValue: 0, // 'Recent' is at position 0
      friction: 20,
      tension: 100,
      useNativeDriver: false,
    }).start()

    // Fetch data when tab changes
    fetchMeals()
  }

  const handleFilterPress = (filterName: string) => {
    // Calculate position based on filter index
    const filterIndex = ["Recent", "Created", "Favorites"].indexOf(filterName)

    // Animate filter indicator
    Animated.spring(filterIndicatorPosition, {
      toValue: filterIndex,
      friction: 20,
      tension: 100,
      useNativeDriver: false,
    }).start()

    setActiveFilter(filterName)
  }

  const handleAddItemToMeal = (item: FoodItem | MealItem, selectedQuantity = "100", selectedUnit = "g") => {
    // Ensure item has all required fields for Food interface in CustomMealReviewScreen
    const enhancedItem = {
      ...item,
      // Add default values for any missing properties needed in CustomMealReviewScreen
      amount: Number.parseFloat(selectedQuantity) || 100,
      unit: selectedUnit || "g",
      // Ensure these fields exist for the Food interface in CustomMealReviewScreen
      sugar: item.sugar || 0,
      fibers: item.fibers || 0,
      sodium: item.sodium || 0,
    }
    setCurrentMealItems((prev) => [...prev, enhancedItem]) // Add to internal state
    setSelectedItems((prev) => [...prev, enhancedItem]) // Also add to selected items for continue button
    setCartCount((prev) => prev + 1)
    
    // Update Firebase to mark this food as added to cart
    try {
      const currentUser = auth.currentUser
      if (currentUser && activeTab === "Foods") {
        updateFoodCartStatus(currentUser.uid, item.id, true)
      }
    } catch (error) {
      console.error("Error updating food cart status:", error)
      // Continue with UI updates even if Firebase update fails
    }
  }

  const handleEditItem = (item: FoodItem | MealItem) => {
    // Navigate to edit screen or show modal
    // Ensure item is a FoodItem before trying to edit (Meals might not be editable this way)
    if ("protein" in item) {
      // Simple check if it's a FoodItem
      navigation.navigate("EditCustomFood", { item }) // Use the new navigation target
    }
  }

  const handleFoodPress = (item: FoodItem | MealItem) => {
    setSelectedFood(item)
    // Reset quantity and unit to default values each time
    setQuantity("100")
    setUnit("g")
    setModalVisible(true)
  }

  // Helper function to format macro values
  const formatMacro = (value: number, isCalorie = false): string => {
    if (isCalorie) {
      // Round calories to whole numbers
      return Math.round(value).toString()
    } else {
      // Round other macros to 1 decimal place and remove trailing zeros
      const rounded = Math.round(value * 10) / 10
      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
    }
  }

  const renderQuantityModal = () => {
    if (!selectedFood) return null

    // Calculate macro values based on current quantity input
    const baseAmount = 100 // Base amount (typically 100g)
    const ratio = Number.parseFloat(quantity) / baseAmount || 0

    const calculatedMacros = {
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      calories: Math.round(selectedFood.calories * ratio),
      sodium: Math.round((selectedFood.sodium || 0) * ratio),
      sugar: Math.round((selectedFood.sugar || 0) * ratio * 10) / 10,
      fibers: Math.round((selectedFood.fibers || 0) * ratio * 10) / 10,
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalOffset }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Quantity</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.foodTitleInModal}>{selectedFood.name}</Text>

              {/* Dynamic Macro Display */}
              <View style={styles.dynamicMacrosContainer}>
                <View style={styles.calorieRow}>
                  <Text style={styles.dynamicCalorieValue}>{formatMacro(calculatedMacros.calories, true)}</Text>
                  <Text style={styles.dynamicCalorieLabel}>Calories</Text>
                </View>

                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.proteinColor]}>
                      {formatMacro(calculatedMacros.protein)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Protein</Text>
                  </View>

                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.carbsColor]}>
                      {formatMacro(calculatedMacros.carbs)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Carbs</Text>
                  </View>

                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fatColor]}>
                      {formatMacro(calculatedMacros.fat)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Fat</Text>
                  </View>
                </View>

                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sodiumColor]}>
                      {formatMacro(calculatedMacros.sodium)}mg
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Sodium</Text>
                  </View>

                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sugarColor]}>
                      {formatMacro(calculatedMacros.sugar)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Sugar</Text>
                  </View>

                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fiberColor]}>
                      {formatMacro(calculatedMacros.fibers)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Fiber</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.modalSubtitle}>Set quantity:</Text>

              <View style={styles.quantityInputContainer}>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="100"
                  placeholderTextColor="#666666"
                />

                <View style={styles.unitSelector}>
                  {["g", "ml", "oz", "lb"].map((unitOption) => (
                    <TouchableOpacity
                      key={unitOption}
                      style={[styles.unitOption, unit === unitOption && styles.selectedUnit]}
                      onPress={() => setUnit(unitOption)}
                    >
                      <Text style={[styles.unitText, unit === unitOption && styles.selectedUnitText]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.addToMealButton}
                onPress={() => {
                  handleAddItemToMeal(selectedFood, quantity, unit)
                  setModalVisible(false)
                }}
              >
                <Text style={styles.addToMealButtonText}>Add to Meal</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  // Function to handle favoriting an item
  const handleFavoriteItem = async (itemId: string) => {
    triggerHapticFeedback()

    // Get current item (either food or meal)
    const item = [...foodItems, ...mealItems].find(item => item.id === itemId)
    
    if (!item) {
      console.error("Could not find item to favorite:", itemId)
      return
    }
    
    // Optimistically update UI
    const newStatus = !favoriteItems[itemId]
    setFavoriteItems(prev => ({
      ...prev,
      [itemId]: newStatus
    }))

    // Close the swipeable after action
    if (swipeableRefs.current[itemId]) {
      swipeableRefs.current[itemId]?.close()
    }
    
    try {
      // Update in backend
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("User not authenticated")
      
      await updateFavoriteStatus(
        currentUser.uid,
        itemId,
        newStatus,
        activeTab === "Foods" ? "food" : "meal"
      )
    } catch (error) {
      // Revert UI on error
      console.error("Error updating favorite status:", error)
      setFavoriteItems(prev => ({
        ...prev,
        [itemId]: !newStatus
      }))
      
      Alert.alert(
        "Error",
        "Failed to update favorite status. Please try again.",
        [{ text: "OK" }]
      )
    }
  }

  // Function to confirm deletion
  const confirmDeleteItem = (item: FoodItem | MealItem) => {
    // Make sure we're deleting the correct item
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${item.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert("Error", "You must be logged in to delete items");
                return;
              }
              
              // First remove from local state immediately
              if (activeTab === "Foods") {
                setFoodItems(prev => prev.filter(food => food.id !== item.id))
              } else {
                setMealItems(prev => prev.filter(meal => meal.id !== item.id))
              }
              
              // If the item was in the cart, remove it from there too (immediately)
              setCurrentMealItems(prev => prev.filter(i => i.id !== item.id))
              setSelectedItems(prev => prev.filter(i => i.id !== item.id))
              
              // Update cart count
              const removedCount = currentMealItems.filter(i => i.id === item.id).length
              if (removedCount > 0) {
                setCartCount(prev => Math.max(0, prev - removedCount))
              }
              
              // Update Firebase to mark food as not in cart (do this first)
              if (activeTab === "Foods") {
                try {
                  await updateFoodCartStatus(currentUser.uid, item.id, false);
                } catch (cartError) {
                  console.error("Error updating cart status:", cartError);
                  // Continue regardless of cart status update error
                }
              }

              // Delete from Firestore based on current tab
              if (activeTab === "Foods") {
                await deleteUserFood(currentUser.uid, item.id, 'food');
              } else {
                await deleteMeal(item.id);
              }
            } catch (error) {
              console.error("Error deleting item:", error)
              Alert.alert(
                "Error",
                "Failed to delete item. Please try again.",
                [{ text: "OK" }]
              )
            }
            
            // Close all swipeables
            Object.values(swipeableRefs.current).forEach((ref) => ref?.close())
          },
        },
      ]
    )
  }

  // Render the left action (now favorite)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: FoodItem | MealItem,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    })

    const opacity = dragX.interpolate({
      inputRange: [0, 20, 80],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    })

    const isFavorite = favoriteItems[item.id]

    return (
      <Animated.View
        style={[
          styles.leftAction,
          {
            opacity: opacity,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity style={styles.favoriteAction} onPress={() => handleFavoriteItem(item.id)}>
            <AntDesign name={isFavorite ? "star" : "staro"} size={20} color="#000000" />
            <Text style={styles.actionTextFavorite}>{isFavorite ? "Unfav" : "Fav"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }

  // Render the right action (now delete)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: FoodItem | MealItem,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    })

    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    })

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            opacity: opacity,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity style={styles.deleteAction} onPress={() => confirmDeleteItem(item)}>
            <AntDesign name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.actionTextDelete}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E92CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMeals} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    const itemsToDisplay: (FoodItem | MealItem)[] = activeTab === "Foods" ? foodItems : mealItems
    const filteredItems = itemsToDisplay.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchText.toLowerCase())
      const typeMatch = item.type === activeFilter
      return nameMatch && typeMatch
    })

    return filteredItems.map((item) => {
      // Determine if this is a food or meal item
      const isFood = activeTab === "Foods"

      return (
        <Swipeable
          key={`swipeable-${item.id}`}
          ref={(ref) => (swipeableRefs.current[item.id] = ref)}
          renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          leftThreshold={40}
          rightThreshold={40}
          friction={1}
          overshootLeft={false}
          overshootRight={false}
          overshootFriction={8}
          onSwipeableOpen={(direction) => {
            // Close other open swipeables when a new one is opened
            Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
              if (id !== item.id && ref) {
                ref.close()
              }
            })
          }}
        >
          <View style={styles.listItem}>
            <View style={styles.itemImageContainer}>
              {isFood ? (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="nutrition-outline" size={20} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                {favoriteItems[item.id] && (
                  <AntDesign name="star" size={16} color="#FFD700" style={styles.favoriteIcon} />
                )}
              </View>

              <View style={styles.macroWrapper}>
                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: "#EF476F" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.protein)}g </Text>
                      <Text style={styles.macroLabel}>P</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.centerMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#06D6A0" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.carbs)}g </Text>
                      <Text style={styles.macroLabel}>C</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.rightMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#FFD166" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.fat)}g </Text>
                      <Text style={styles.macroLabel}>F</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.macroSeparator} />

                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: "#FF9500" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.sodium || 0)}mg </Text>
                      <Text style={styles.macroLabel}>Na</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.centerMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#D4C19C" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.sugar || 0)}g </Text>
                      <Text style={styles.macroLabel}>S</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.rightMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#5AC8FA" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.fibers || 0)}g </Text>
                      <Text style={styles.macroLabel}>Fi</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.macroSeparator} />

                <View style={styles.footerRow}>
                  <Text style={styles.itemCaloriesValue}>{formatMacro(item.calories, true)} Calories</Text>
                  <Text style={styles.perUnitText}>per {item.servingSize || 100}g</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleFoodPress(item)}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Swipeable>
      )
    })
  }

  const handleAddFoodPress = () => {
    // Navigate immediately without animation delay
    navigation.navigate("AddFoodOptions")
  }

  const [isLoggingSingleItem, setIsLoggingSingleItem] = useState(false);

  // Enhanced cart clearing function
  const clearCart = useCallback(() => {
    setCurrentMealItems([]);
    setSelectedItems([]);
    setCartCount(0);
    
    // Update Firebase to mark foods as not in cart
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update cart status for all items in currentMealItems
        currentMealItems.forEach(item => {
          updateFoodCartStatus(currentUser.uid, item.id, false)
            .catch(err => console.error("Error updating cart status:", err));
        });
      }
    } catch (error) {
      console.error("Error clearing cart in Firebase:", error);
    }
  }, [currentMealItems]);

  const handleContinuePress = () => {
    if (selectedItems.length === 0) {
      return
    }

    if (selectedItems.length === 1) {
      // Direct logging for single item
      const item = selectedItems[0]
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to log meals")
        return
      }
      
      // Show loading indicator
      setIsLoggingSingleItem(true)
      
      try {
        // Create a meal with the item's name and data
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const timeString = now.toLocaleTimeString()
        
        const mealData = {
          userId: currentUser.uid,
          mealName: item.name, // Use the food/meal name as meal name
          protein: item.protein * (item.amount / 100),
          carbs: item.carbs * (item.amount / 100),
          fat: item.fat * (item.amount / 100),
          calories: item.calories * (item.amount / 100),
          sugar: (item.sugar || 0) * (item.amount / 100),
          fibers: (item.fibers || 0) * (item.amount / 100),
          sodium: (item.sodium || 0) * (item.amount / 100),
          date: today,
          loggedTime: timeString,
          foods: [item],
          isLogged: true
        }
        
        // Use the addMeal service to log this meal
        addMeal(mealData).then(() => {
          setIsLoggingSingleItem(false)
          // Clear the cart state
          clearCart()
          Alert.alert("Success", `${item.name} logged successfully`, [
            { text: "OK", onPress: () => navigation.goBack() }
          ])
        }).catch(error => {
          console.error("Error logging single item:", error)
          setIsLoggingSingleItem(false)
          Alert.alert("Error", "Failed to log meal. Please try again.")
        })
      } catch (error) {
        console.error("Error logging single item:", error)
        setIsLoggingSingleItem(false)
        Alert.alert("Error", "Failed to log meal. Please try again.")
      }
    } else {
      // Navigate to review screen for multiple items
      navigation.navigate("CustomMealReview", {
        selectedFoods: selectedItems,
        onMealLogged: clearCart // Pass the callback to clear cart state
      })
    }
  }

  const handleCartPress = () => {
    // Pass the currently added items to the review screen
    if (currentMealItems.length === 0) {
      return // Don't navigate if cart is empty
    }
    
    const defaultMealName = currentMealItems.length === 1 ? currentMealItems[0].name : ""
    
    navigation.navigate("CustomMealReview", { 
      selectedFoods: currentMealItems,
      defaultMealName: defaultMealName,
      onMealLogged: clearCart // Pass the callback to clear cart state
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Add loading overlay */}
          {isLoggingSingleItem && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#45A557" />
                <Text style={styles.loadingText}>Logging meal...</Text>
              </View>
            </View>
          )}
          
          {/* Header matching other screens exactly */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Log Items</Text>
            <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
              <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Updated Tabs with Animated Indicator */}
            <View style={styles.tabContainer}>
              {/* Animated Tab Indicator */}
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    transform: [
                      {
                        translateX: tabIndicatorPosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, width / 2 - 20], // Using pixel values instead of percentages
                        }),
                      },
                    ],
                  },
                ]}
              />

              <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress("Foods")}>
                <Text style={[styles.tabText, activeTab === "Foods" && styles.activeTabText]}>Foods</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress("Meals")}>
                <Text style={[styles.tabText, activeTab === "Meals" && styles.activeTabText]}>Meals</Text>
              </TouchableOpacity>
            </View>

            {/* Updated Search Bar with Icon */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color="#666666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#666666"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            </View>

            {/* Updated Add Food Button */}
            {activeTab === "Foods" && (
              <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFoodPress}>
                <MaterialCommunityIcons name="plus" size={20} color="#45A557" />
                <Text style={styles.addFoodButtonText}>Add food</Text>
              </TouchableOpacity>
            )}

            {/* Updated Filters with Animated Indicator */}
            <View style={styles.filterContainer}>
              {/* Animated Filter Indicator */}
              <Animated.View
                style={[
                  styles.filterIndicator,
                  {
                    transform: [
                      {
                        translateX: filterIndicatorPosition.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange: [0, (width - 40) / 3, (2 * (width - 40)) / 3], // Using pixel values
                        }),
                      },
                    ],
                    width: (width - 40) / 3, // Ensuring width is correct
                  },
                ]}
              />

              {["Recent", "Created", "Favorites"].map((filter) => (
                <TouchableOpacity key={filter} style={styles.filterButton} onPress={() => handleFilterPress(filter)}>
                  <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content List */}
            <View style={styles.listContainer}>{renderContent()}</View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinuePress}
              style={[styles.continueButton, selectedItems.length === 0 && styles.disabledButton]}
              disabled={selectedItems.length === 0}
            >
              <Text style={[styles.buttonText, selectedItems.length === 0 && styles.disabledButtonText]}>
                {selectedItems.length === 1 ? "Log" : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quantity Modal */}
          {renderQuantityModal()}
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    // Added SafeAreaView style
    flex: 1,
    backgroundColor: "#000000", // Dark background
  },
  container: {
    flex: 1,
    backgroundColor: "#000000", // Adding background color to container
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
    width: "100%",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  cartButton: {
    padding: 5,
    width: 40, // Match the spacer width in other headers
  },
  cartBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#45A557", // Green badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1, // Takes remaining space above footer
  },
  scrollViewContent: {
    // Added for padding at bottom
    paddingBottom: 20, // Add some padding below the list
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    height: 40,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#1A1A1A", // Match add food button background
    borderRadius: 8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    color: "#A0A0A0",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  addFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  addFoodButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    height: 36,
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#1A1A1A", // Match add food button background
    borderRadius: 8,
    zIndex: 0,
  },
  filterButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  filterText: {
    color: "#A0A0A0",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4, // Reduced spacing
  },
  macroWrapper: {
    justifyContent: "center",
  },
  macrosContainer: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 2,
    position: "relative",
    height: 18,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
  },
  centerMacro: {
    left: "43%",
  },
  rightMacro: {
    left: "75%",
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  macroText: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  macroLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  unitText: {
    color: "#FFFFFF",
  },
  macroSeparator: {
    height: 1,
    backgroundColor: "#2E2E2E",
    marginVertical: 4, // Reduced vertical margin
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2, // Reduced margin
  },
  itemCaloriesValue: {
    color: "#45A557",
    fontSize: 15,
    fontWeight: "bold",
  },
  perUnitText: {
    color: "#A0A0A0",
    fontSize: 11,
  },
  addButton: {
    backgroundColor: "#45A557", // Green add button
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    backgroundColor: "#000000",
  },
  continueButton: {
    backgroundColor: "#45A557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#2E2E2E",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#A0A0A0",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  foodTitleInModal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  modalSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  quantityInput: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    flex: 0.4,
    marginRight: 10,
  },
  unitSelector: {
    flexDirection: "row",
    flex: 0.6,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedUnit: {
    backgroundColor: "#3A3A3C",
  },
  selectedUnitText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  addToMealButton: {
    backgroundColor: "#45A557",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  addToMealButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dynamicMacrosContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: 15,
  },
  dynamicCalorieValue: {
    color: "#45A557",
    fontSize: 24,
    fontWeight: "700",
    marginRight: 6,
  },
  dynamicCalorieLabel: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  dynamicMacrosRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dynamicMacroItem: {
    alignItems: "center",
    flex: 1,
  },
  dynamicMacroValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dynamicMacroLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  proteinColor: { color: "#EF476F" },
  carbsColor: { color: "#06D6A0" },
  fatColor: { color: "#FFD166" },
  sodiumColor: { color: "#FF9500" },
  sugarColor: { color: "#D4C19C" },
  fiberColor: { color: "#5AC8FA" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    color: "#EDEDED",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#3E92CC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  leftAction: {
    width: width * 0.2,
    backgroundColor: "#FFD700", // Yellow for favorite
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 12,
  },
  rightAction: {
    width: width * 0.2,
    backgroundColor: "#FF3B30", // iOS red for delete
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 12,
  },
  favoriteAction: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  deleteAction: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  actionTextFavorite: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 3,
  },
  actionTextDelete: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 3,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default AddMealLogScreen
