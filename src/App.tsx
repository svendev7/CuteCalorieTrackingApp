"use client"

import { useState, useRef, useEffect } from "react"
import { View, ImageBackground, StyleSheet, Dimensions, Animated, Text, ActivityIndicator, Alert } from "react-native"
import { HomeScreen } from "./Screens/home/HomeScreen"
import { SettingsScreen } from "./Screens/settings/SettingsScreen"
import AnimatedFooter from "./components/footer/AnimatedFooter"
import OnboardingNavigator from "./Screens/onboarding/OnboardingNavigator"
import { useAuth } from "./hooks/useAuth"
import { db } from "./config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import AddMealLogScreen from "./Screens/logging/AddMealLogScreen"
import AddCustomFoodScreen from "./Screens/logging/AddCustomFoodScreen"
import CustomMealReviewScreen from "./Screens/meals/CustomMealReviewScreen"
import { SavedMealsScreen } from "./Screens/meals/SavedMealsScreen"
import AddFoodOptionsScreen from "./Screens/logging/AddFoodOptionsScreen"
import Toast from "react-native-toast-message"

const { width, height } = Dimensions.get("window")

export default function App() {
  const [activeScreen, setActiveScreen] = useState("home")
  const [isFooterVisible, setIsFooterVisible] = useState(true)
  const [customBackground, setCustomBackground] = useState(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMealLogScreen, setShowAddMealLogScreen] = useState(false)
  const [showAddCustomFoodScreen, setShowAddCustomFoodScreen] = useState(false)
  const [foodToEdit, setFoodToEdit] = useState<CustomFood | null>(null)
  const [showCustomMealReviewScreen, setShowCustomMealReviewScreen] = useState(false)
  const [showSavedMealsScreen, setShowSavedMealsScreen] = useState(false)
  const [showAddFoodOptionsScreen, setShowAddFoodOptionsScreen] = useState(false)
  const [currentMealLogItems, setCurrentMealLogItems] = useState([])
  const { user, loading: authLoading } = useAuth()

  // Main screen animations
  const homeTranslate = useRef(new Animated.Value(0)).current
  const settingsTranslate = useRef(new Animated.Value(width)).current
  const addMealTranslate = useRef(new Animated.Value(width)).current
  const rocketTranslate = useRef(new Animated.Value(width)).current
  const statsTranslate = useRef(new Animated.Value(width)).current

  // Logging flow animations
  const addFoodOptionsTranslate = useRef(new Animated.Value(width)).current
  const addCustomFoodTranslate = useRef(new Animated.Value(width)).current
  const mealReviewTranslate = useRef(new Animated.Value(width)).current
  const savedMealsTranslate = useRef(new Animated.Value(width)).current

  // Animation timing and easing
  const ANIM_DURATION = 300

  // Effect to ensure footer visibility is consistent with screen state
  useEffect(() => {
    // Keep footer hidden for all screens except home
    if (
      activeScreen !== "home" ||
      showAddFoodOptionsScreen ||
      showAddCustomFoodScreen ||
      showCustomMealReviewScreen ||
      showSavedMealsScreen
    ) {
      setIsFooterVisible(false)
    }
  }, [
    activeScreen,
    showAddFoodOptionsScreen,
    showAddCustomFoodScreen,
    showCustomMealReviewScreen,
    showSavedMealsScreen,
  ])

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists() && userDoc.data().onboardingCompleted) {
            setHasCompletedOnboarding(true)
          } else {
            setHasCompletedOnboarding(false)
          }
        } else {
          setHasCompletedOnboarding(false)
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        setHasCompletedOnboarding(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      checkOnboardingStatus()
    }
  }, [user, authLoading])

  useEffect(() => {
    const animations = []
    animations.push(
      Animated.timing(homeTranslate, {
        toValue: activeScreen === "home" ? 0 : -width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    )
    animations.push(
      Animated.timing(settingsTranslate, {
        toValue: activeScreen === "settings" ? 0 : width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    )
    animations.push(
      Animated.timing(addMealTranslate, {
        toValue: activeScreen === "addMeal" ? 0 : width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    )
    animations.push(
      Animated.timing(rocketTranslate, {
        toValue: activeScreen === "rocket" ? 0 : width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    )
    animations.push(
      Animated.timing(statsTranslate, {
        toValue: activeScreen === "stats" ? 0 : width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    )

    Animated.parallel(animations).start()
  }, [activeScreen, homeTranslate, settingsTranslate, addMealTranslate, rocketTranslate, statsTranslate])

  // Animation effects for logging screens
  useEffect(() => {
    Animated.timing(addFoodOptionsTranslate, {
      toValue: showAddFoodOptionsScreen ? 0 : width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start()
  }, [showAddFoodOptionsScreen])

  useEffect(() => {
    Animated.timing(addCustomFoodTranslate, {
      toValue: showAddCustomFoodScreen ? 0 : width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start()
  }, [showAddCustomFoodScreen])

  useEffect(() => {
    Animated.timing(mealReviewTranslate, {
      toValue: showCustomMealReviewScreen ? 0 : width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start()
  }, [showCustomMealReviewScreen])

  useEffect(() => {
    Animated.timing(savedMealsTranslate, {
      toValue: showSavedMealsScreen ? 0 : width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start()
  }, [showSavedMealsScreen])

  const updateCustomBackground = (uri) => {
    setCustomBackground(uri)
  }

  const completeOnboarding = async () => {
    try {
      if (!user) {
        throw new Error("User must be logged in to complete onboarding")
      }

      // Save to Firestore
      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
        { merge: true },
      )

      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error("Error saving onboarding status:", error)
      Alert.alert("Error", "Failed to save your preferences. Please try again.", [{ text: "OK" }])
    }
  }

  const navigateTo = (screen) => {
    setActiveScreen(screen)

    // If returning to home screen, animate the footer in and clear cart
    if (screen === "home") {
      // Clear cart state to prevent stale items
      forceClearCart();
      
      // Short delay to let the screen transition start
      setTimeout(() => {
        setIsFooterVisible(true)
      }, 50)
    } else {
      // Hide footer immediately for other screens
      setIsFooterVisible(false)
    }
  }

  const handleOpenAddMealLog = () => {
    setIsFooterVisible(false)
    navigateTo("addMeal")
  }

  const handleOpenRocket = () => {
    navigateTo("rocket")
  }

  const handleOpenStats = () => {
    console.log("Stats button pressed - No target screen defined yet")
  }

  // New handler for quick add food
  const handleQuickAddFood = () => {
    setIsFooterVisible(false)
    // Skip the meal review screen and go directly to add custom food
    setFoodToEdit(null)
    setShowAddCustomFoodScreen(true)
  }

  const handleOpenAddFoodOptions = () => {
    setFoodToEdit(null)
    setIsFooterVisible(false)
    setShowAddFoodOptionsScreen(true)
  }

  const handleCloseAddFoodOptions = () => {
    // Animate out first, then set state
    Animated.timing(addFoodOptionsTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowAddFoodOptionsScreen(false)
    })
  }

  const handleOpenAddOrEditCustomFood = (food: CustomFood | null = null) => {
    setFoodToEdit(food)
    setIsFooterVisible(false)

    // First, slide out AddFoodOptions if it's visible
    if (showAddFoodOptionsScreen) {
      Animated.timing(addFoodOptionsTranslate, {
        toValue: width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setShowAddFoodOptionsScreen(false)
        // Then, slide in AddCustomFoodScreen
        setShowAddCustomFoodScreen(true)
      })
    } else {
      setShowAddCustomFoodScreen(true)
    }
  }

  const handleCloseAddCustomFood = () => {
    // Animate out first, then set state
    Animated.timing(addCustomFoodTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowAddCustomFoodScreen(false)
      setFoodToEdit(null)
    })
  }

  const handleSaveOrUpdateCustomFood = (savedFood: CustomFood) => {
    console.log("Saved/Updated food:", savedFood)
    handleCloseAddCustomFood()
  }

  const handleOpenMealReview = (items, defaultMealName = "") => {
    setCurrentMealLogItems(items)
    setIsFooterVisible(false)
    setShowCustomMealReviewScreen(true)
  }

  const handleCloseMealReview = () => {
    // Force clear the cart before animating out
    forceClearCart();
    
    // Animate out first, then set state
    Animated.timing(mealReviewTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowCustomMealReviewScreen(false)
      // Clear the meal items when closing the review screen
      setCurrentMealLogItems([])
    })
  }

  // Add a function to forcibly clear the cart
  const forceClearCart = () => {
    setCurrentMealLogItems([]);
    // React Native doesn't have window/DOM events, so we'll clear directly
    if (showCustomMealReviewScreen) {
      // Make sure the cart is cleared
      setCurrentMealLogItems([]);
    }
  }

  const handleSelectSavedMeal = (meal) => {
    console.log("Selected saved meal:", meal)

    // Animate out first, then set state
    Animated.timing(savedMealsTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowSavedMealsScreen(false)
    })
  }

  if (isLoading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!user || !hasCompletedOnboarding) {
    return <OnboardingNavigator onComplete={completeOnboarding} />
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={customBackground ? { uri: customBackground } : require("../assets/bg-dark.jpg")}
        style={styles.backgroundImage}
      >
        {/* Home Screen */}
        <Animated.View style={[styles.screenContainer, { transform: [{ translateX: homeTranslate }] }]}>
          <HomeScreen
            onFooterVisibilityChange={setIsFooterVisible}
            onSettingsPress={() => navigateTo("settings")}
            customBackground={customBackground}
            navigation={{
              navigate: (screen) => navigateTo(screen),
              addListener: (event, callback) => {
                // Simple mock of the navigation listener
                if (event === "focus") {
                  // Call the callback immediately to simulate a focus event
                  callback()
                }
                // Return an unsubscribe function
                return {
                  remove: () => {},
                }
              },
            }}
          />
        </Animated.View>

        {/* Settings Screen */}
        <Animated.View style={[styles.screenContainer, { transform: [{ translateX: settingsTranslate }] }]}>
          <SettingsScreen
            navigate={() => navigateTo("home")}
            updateCustomBackground={updateCustomBackground}
            customBackground={customBackground}
          />
        </Animated.View>

        {/* Add Meal Screen */}
        <Animated.View style={[styles.screenContainer, { transform: [{ translateX: addMealTranslate }] }]}>
          <AddMealLogScreen
            navigation={{
              navigate: (screen, params) => {
                if (screen === "AddFoodOptions") {
                  handleOpenAddFoodOptions()
                } else if (screen === "EditCustomFood") {
                  handleOpenAddOrEditCustomFood(params?.item || null)
                } else if (screen === "CustomMealReview") {
                  handleOpenMealReview(params?.selectedFoods || [], params?.defaultMealName || "")
                } else if (screen === "SavedMeals") {
                  setShowSavedMealsScreen(true)
                } else {
                  console.log(`Navigation to ${screen} not implemented`)
                }
              },
              goBack: () => navigateTo("home"),
            }}
          />
        </Animated.View>

        {/* Rocket Screen (placeholder) */}
        <Animated.View style={[styles.screenContainer, { transform: [{ translateX: rocketTranslate }] }]}>
          <View style={styles.placeholderScreen}>
            <Text style={styles.placeholderText}>Unity View Coming Soon</Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText} onPress={() => navigateTo("home")}>
                Back to Home
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Screen (placeholder) */}
        <Animated.View style={[styles.screenContainer, { transform: [{ translateX: statsTranslate }] }]}>
          <View style={styles.placeholderScreen}>
            <Text style={styles.placeholderText}>Stats & Progress Coming Soon</Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText} onPress={() => navigateTo("home")}>
                Back to Home
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Navigation (only visible on certain screens) */}
        {isFooterVisible && (
          <AnimatedFooter
            isVisible={isFooterVisible}
            onAddPress={handleOpenAddMealLog}
            onRocketPress={handleOpenRocket}
            onStatsPress={handleOpenStats}
            onQuickAddPress={handleQuickAddFood}
          />
        )}

        {/* Add Food Options Modal (Navigation Stack) */}
        <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: addFoodOptionsTranslate }] }]}>
          {showAddFoodOptionsScreen && (
            <AddFoodOptionsScreen
              navigation={{
                navigate: (screen, params) => {
                  if (screen === "AddCustomFood") {
                    handleOpenAddOrEditCustomFood()
                    handleCloseAddFoodOptions()
                  } else if (screen === "SavedMeals") {
                    setShowSavedMealsScreen(true)
                    handleCloseAddFoodOptions()
                  } else {
                    console.log(`Navigation to ${screen} not implemented`)
                  }
                },
                goBack: handleCloseAddFoodOptions,
              }}
            />
          )}
        </Animated.View>

        {/* Add Custom Food Screen */}
        <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: addCustomFoodTranslate }] }]}>
          {showAddCustomFoodScreen && (
            <AddCustomFoodScreen
              navigation={{
                navigate: (screen, params) => {
                  console.log(`Navigation to ${screen} not implemented`)
                },
                goBack: handleCloseAddCustomFood,
                save: handleSaveOrUpdateCustomFood,
              }}
              route={{
                params: {
                  foodToEdit: foodToEdit as any,
                },
              }}
            />
          )}
        </Animated.View>

        {/* Custom Meal Review Screen */}
        <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: mealReviewTranslate }] }]}>
          {showCustomMealReviewScreen && (
            <CustomMealReviewScreen
              navigation={{
                navigate: () => {},
                goBack: handleCloseMealReview,
                getParam: (param) => {
                  if (param === 'onMealLogged') {
                    return () => {
                      // Clear the currently selected foods
                      setCurrentMealLogItems([]);
                    };
                  }
                  return null;
                }
              }}
              route={{
                params: {
                  selectedFoods: currentMealLogItems,
                  defaultMealName: currentMealLogItems.length === 1 ? currentMealLogItems[0].name : "",
                  onMealLogged: () => {
                    // Clear the cart items
                    setCurrentMealLogItems([]);
                  }
                },
              }}
            />
          )}
        </Animated.View>

        {/* Saved Meals Screen */}
        {showSavedMealsScreen && (
          <SavedMealsScreen onClose={() => setShowSavedMealsScreen(false)} onSelectMeal={handleSelectSavedMeal} />
        )}
      </ImageBackground>

      {/* Toast messages component */}
      <Toast />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  screenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fullScreenModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
})

interface CustomFood {
  id?: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sugar?: number
  fibers?: number
  sodium?: number
  servingSize?: number
  imageUrl?: string
  isFavorite: boolean
}
