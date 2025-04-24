"use client"

import { useState, useRef, useEffect } from "react"
import { View, ImageBackground, StyleSheet, Dimensions, Animated, Text, ActivityIndicator, Alert } from "react-native"
import { HomeScreen } from "./Screens/home/HomeScreen"
import { SettingsScreen } from "./Screens/settings/SettingsScreen"
import AnimatedFooter from "./components/footer/AnimatedFooter"
import OnboardingNavigator from "./Screens/onboarding/OnboardingNavigator"
import { useAuth } from "./hooks/useAuth"
import { db, auth } from "./config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import SavedFoodsScreen from "./Screens/logging/SavedFoodsScreen"
import AddCustomFoodScreen from "./Screens/logging/addFood/AddCustomFoodScreen"
import MealReviewScreen from "./Screens/logging/cart/MealReviewScreen"
import SavedMealsScreen from "./Screens/logging/SavedMealsScreen"
import AddFoodOptionsScreen from "./Screens/logging/addFood/AddFoodOptionsScreen"
import Toast from "react-native-toast-message"
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { forceResetAllCartItems } from "./services/mealService"
import { CartProvider } from "./context/CartContext"

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

  const homeTranslate = useRef(new Animated.Value(0)).current
  const settingsTranslate = useRef(new Animated.Value(width)).current
  const addMealTranslate = useRef(new Animated.Value(width)).current
  const rocketTranslate = useRef(new Animated.Value(width)).current
  const statsTranslate = useRef(new Animated.Value(width)).current

  const addFoodOptionsTranslate = useRef(new Animated.Value(width)).current
  const addCustomFoodTranslate = useRef(new Animated.Value(width)).current
  const mealReviewTranslate = useRef(new Animated.Value(width)).current
  const savedMealsTranslate = useRef(new Animated.Value(width)).current

  const ANIM_DURATION = 300

  useEffect(() => {
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
    forceClearCart();
    
    setActiveScreen(screen)

    if (screen === "home") {
      setTimeout(() => {
        setIsFooterVisible(true)
      }, 50)
    } else {
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

  const handleQuickAddFood = () => {
    setIsFooterVisible(false)
    setShowAddCustomFoodScreen(true)
  }

  const handleOpenAddFoodOptions = () => {
    setFoodToEdit(null)
    setIsFooterVisible(false)
    setShowAddFoodOptionsScreen(true)
  }

  const handleCloseAddFoodOptions = () => {
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


    if (showAddFoodOptionsScreen) {
      Animated.timing(addFoodOptionsTranslate, {
        toValue: width,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setShowAddFoodOptionsScreen(false)

        setShowAddCustomFoodScreen(true)
      })
    } else {
      setShowAddCustomFoodScreen(true)
    }
  }

  const handleCloseAddCustomFood = () => {
    // Signal that we should refresh the food list in AddMealLogScreen
    const shouldRefreshFoods = showAddCustomFoodScreen;
    
    Animated.timing(addCustomFoodTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowAddCustomFoodScreen(false);
      setFoodToEdit(null);
      
      // If we're returning from adding a food, fetch the latest foods
      if (shouldRefreshFoods && auth.currentUser) {
        console.log("Refreshing foods after adding custom food");
        // The AddMealLogScreen will automatically refresh on focus
      }
    });
  };

  const handleSaveOrUpdateCustomFood = (savedFood: CustomFood) => {
    console.log("Saved/Updated food:", savedFood);
    handleCloseAddCustomFood();
  };

  const handleOpenMealReview = (items, defaultMealName = "") => {
    setCurrentMealLogItems(items)
    setIsFooterVisible(false)
    setShowCustomMealReviewScreen(true)
  }

  const handleCloseMealReview = () => {
    forceClearCart();
    
    Animated.timing(mealReviewTranslate, {
      toValue: width,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowCustomMealReviewScreen(false)
      setTimeout(() => {
        setCurrentMealLogItems([]);
        forceClearCart(); 
      }, 100);
    })
  }

  const forceClearCart = async () => {
    console.log("🔥 GLOBAL CART RESET: Aggressively clearing cart at App level");
    
    setCurrentMealLogItems([]);
    
    setTimeout(() => {
      setCurrentMealLogItems([]);
    }, 100);
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await forceResetAllCartItems(currentUser.uid);
      }
    } catch (error) {
      console.error("Error clearing cart in Firestore:", error);
    }
    
    if (showCustomMealReviewScreen) {
      try {

        setCurrentMealLogItems([]);
      } catch (err) {
        console.log('Error clearing cart state:', err);
      }
    }
  }

  const handleSelectSavedMeal = (meal) => {
    console.log("Selected saved meal:", meal)

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
        <ActivityIndicator size="large" color="#45A557" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingNavigator onComplete={completeOnboarding} />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <View style={styles.container}>
          <ImageBackground source={customBackground ? { uri: customBackground } : require("../assets/bg-dark.jpg")} style={styles.backgroundImage}>
            <Animated.View style={[styles.screenContainer, { transform: [{ translateX: homeTranslate }] }]}>
              <HomeScreen
                onFooterVisibilityChange={setIsFooterVisible}
                onSettingsPress={() => navigateTo("settings")}
                customBackground={customBackground}
                navigation={{
                  navigate: (screen) => navigateTo(screen),
                  addListener: (event, callback) => {
                    if (event === "focus") {
                      callback()
                    }
                    return {
                      remove: () => {},
                    }
                  },
                }}
              />
            </Animated.View>

            <Animated.View style={[styles.screenContainer, { transform: [{ translateX: settingsTranslate }] }]}>
              <SettingsScreen
                navigate={() => navigateTo("home")}
                updateCustomBackground={updateCustomBackground}
                customBackground={customBackground}
              />
            </Animated.View>

            <Animated.View style={[styles.screenContainer, { transform: [{ translateX: addMealTranslate }] }]}>
              <SavedFoodsScreen
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

            {showCustomMealReviewScreen && (
              <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: mealReviewTranslate }] }]}>
                <MealReviewScreen
                  navigation={{
                    navigate: () => {},
                    goBack: handleCloseMealReview,
                    getParam: (param) => {
                      if (param === 'onMealLogged') {
                        return forceClearCart;
                      }
                      return null;
                    }
                  }}
                  route={{
                    params: {
                      selectedFoods: currentMealLogItems,
                      defaultMealName: currentMealLogItems.length === 1 ? currentMealLogItems[0].name : "",
                      onMealLogged: forceClearCart,
                      clearCart: forceClearCart
                    },
                  }}
                />
              </Animated.View>
            )}
            
            {showAddFoodOptionsScreen && (
              <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: addFoodOptionsTranslate }] }]}>
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
              </Animated.View>
            )}
            
            {showAddCustomFoodScreen && (
              <Animated.View style={[styles.fullScreenModal, { transform: [{ translateX: addCustomFoodTranslate }] }]}>
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
              </Animated.View>
            )}
            
            {showSavedMealsScreen && (
              <SavedMealsScreen onClose={() => setShowSavedMealsScreen(false)} onSelectMeal={handleSelectSavedMeal} />
            )}

            <Toast position="bottom" />

            {isFooterVisible && (
              <AnimatedFooter
                isVisible={isFooterVisible}
                onAddPress={handleOpenAddMealLog}
                onRocketPress={handleOpenRocket}
                onStatsPress={handleOpenStats}
                onQuickAddPress={handleQuickAddFood}
              />
            )}
          </ImageBackground>
        </View>
      </CartProvider>
    </SafeAreaProvider>
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
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
