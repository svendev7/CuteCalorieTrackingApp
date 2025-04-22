"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  Switch,
  Alert,
} from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { auth, db } from "../../config/firebase"
import { addMeal, clearAllCartItems, forceResetAllCartItems } from "../../services/mealService"
import { generateMealName } from "../../services/aiService"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import Toast from 'react-native-toast-message'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get("window")

interface Food {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sugar: number
  fibers: number
  sodium: number
  amount: number
  unit: string
}

interface CustomMealReviewScreenProps {
  navigation: any
  route: any
}

// Simple success popup component
const SuccessPopup = ({ visible, message, onDismiss }) => {
  // Instead of early return, use useEffect conditionally
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);
  
  // Return JSX conditionally instead of null
  return visible ? (
    <View style={styles.popupContainer}>
      <View style={styles.popup}>
        <Ionicons name="checkmark-circle" size={24} color="#45A557" />
        <Text style={styles.popupText}>{message}</Text>
      </View>
    </View>
  ) : null;
};

export const CustomMealReviewScreen: React.FC<CustomMealReviewScreenProps> = ({ navigation, route }) => {
  const initialFoods = route.params?.selectedFoods || route.params?.items || [];
  const defaultMealName = route.params?.defaultMealName || '';
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [mealName, setMealName] = useState(defaultMealName);
  const [isSaving, setIsSaving] = useState(false);
  const [mealImage, setMealImage] = useState<string | null>(null);
  const modalOffset = useRef(new Animated.Value(0)).current;
  
  // AI meal name states
  const [showAiSuggestionModal, setShowAiSuggestionModal] = useState(false);
  const [aiMealNameSuggestion, setAiMealNameSuggestion] = useState('');
  const [disableAiSuggestions, setDisableAiSuggestions] = useState(false);
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const insets = useSafeAreaInsets();
  
  // Check user preference for AI suggestions on component mount
  useEffect(() => {
    const checkAiPreference = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userPreference = userDoc.data().disableAiSuggestions || false;
            setDisableAiSuggestions(userPreference);
            
            // Only automatically suggest a name if AI suggestions are not disabled
            if (foods.length > 1 && !mealName && !userPreference) {
              const suggestion = generateMealName(foods);
              setAiMealNameSuggestion(suggestion);
              setShowAiSuggestionModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Error reading AI preference from Firestore:', error);
      }
    };
    
    checkAiPreference();
  }, [foods, mealName]);
  
  // Generate an AI meal name
  const handleGenerateAiName = () => {
    if (foods.length === 0) return;
    
    const suggestion = generateMealName(foods);
    setAiMealNameSuggestion(suggestion);
    
    // Always show the modal when button is clicked
    setShowAiSuggestionModal(true);
  };
  
  // Accept the AI suggested name
  const acceptAiSuggestion = () => {
    setMealName(aiMealNameSuggestion);
    setShowAiSuggestionModal(false);
  };
  
  // Save user preference for AI suggestions
  const handleDisableAiSuggestions = async (disable: boolean) => {
    setDisableAiSuggestions(disable);
    try {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        
        // Check if the user document exists first
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Update the existing document
          await updateDoc(userRef, {
            disableAiSuggestions: disable
          });
        } else {
          // Create a new document with the preference
          await setDoc(userRef, {
            disableAiSuggestions: disable,
            createdAt: new Date()
          });
        }
        
        // Show confirmation
        Toast.show({
          type: 'success',
          text1: disable ? 'AI Suggestions Disabled' : 'AI Suggestions Enabled',
          text2: disable ? 'You won\'t see automatic meal name suggestions' : 'You\'ll now see automatic meal name suggestions',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error saving AI preference to Firestore:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save your preference'
      });
    }
  };

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(modalOffset, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(modalOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleEditFood = (index: number) => {
    // Set the selected food index and current quantity/unit
    setSelectedFoodIndex(index);
    const foodToEdit = foods[index];
    setQuantity(foodToEdit.amount?.toString() || '100');
    setUnit(foodToEdit.unit || 'g');
    setModalVisible(true);
  };

  const handleUpdateQuantity = () => {
    if (selectedFoodIndex !== null) {
      const updatedFoods = [...foods];
      updatedFoods[selectedFoodIndex] = {
        ...updatedFoods[selectedFoodIndex],
        amount: parseFloat(quantity) || 100,
        unit: unit,
      };
      setFoods(updatedFoods);
      setModalVisible(false);
      setSelectedFoodIndex(null);
    }
  };

  const handleDeleteFood = (index: number) => {
    const updatedFoods = [...foods];
    updatedFoods.splice(index, 1);
    setFoods(updatedFoods);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    // Will auto-dismiss via the SuccessPopup useEffect
  };

  // Add a direct effect to clear cart on component unmount
  useEffect(() => {
    return () => {
      // This will run when the component is unmounted/destroyed
      if (auth.currentUser) {
        console.log("🧨 CustomMealReviewScreen UNMOUNTING: Final cart clear attempt");
        forceResetAllCartItems(auth.currentUser.uid)
          .catch(err => console.error("Error in unmount cart clear:", err));
      }
    };
  }, []);

  const handleLogMeal = async () => {
    if (!auth.currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to log a meal',
      })
      return
    }

    if (foods.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add at least one food to log',
      })
      return
    }

    try {
      console.log("💾 LOG MEAL: Starting aggressive cart clearing process");
      setIsSaving(true)
      const totalMacros = calculateTotalMacros()
      
      // Make a copy of the foods array before clearing it
      const foodsCopy = [...foods];
      
      // Clear local cart state immediately to prevent it from reappearing
      setFoods([]);
      
      // Directly clear cart in Firestore for current user - BEFORE adding the meal
      try {
        if (auth.currentUser) {
          console.log("Forcing reset of ALL cart items before adding meal");
          await forceResetAllCartItems(auth.currentUser.uid);
        }
      } catch (clearError) {
        console.error("Error clearing cart in Firestore:", clearError);
      }
      
      // Log the meal to Firestore
      await addMeal({
        userId: auth.currentUser.uid,
        mealName: mealName || foodsCopy[0].name,
        protein: totalMacros.protein,
        carbs: totalMacros.carbs,
        fat: totalMacros.fat,
        calories: totalMacros.calories,
        sugar: totalMacros.sugar,
        fibers: totalMacros.fibers,
        sodium: totalMacros.sodium,
        date: new Date().toISOString().split('T')[0],
        foods: foodsCopy.map(food => ({
          id: food.id,
          name: food.name,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          calories: food.calories,
          sodium: food.sodium || 0,
          sugar: food.sugar || 0,
          fibers: food.fibers || 0,
          amount: food.amount || 100,
          unit: food.unit || 'g'
        })),
        imageUrl: mealImage,
        isCustom: false,
        isLogged: true
      })
      
      // Clear cart AGAIN after adding meal
      try {
        if (auth.currentUser) {
          console.log("Forcing reset of ALL cart items AFTER adding meal");
          await forceResetAllCartItems(auth.currentUser.uid);
        }
      } catch (clearError) {
        console.error("Error clearing cart in Firestore:", clearError);
      }
      
      // Collect all cart clearing callbacks
      const clearCartCallbacks = [
        route.params?.onMealLogged, 
        route.params?.clearCart,
        navigation.getParam ? navigation.getParam('onMealLogged') : null
      ];
      
      // Call all possible cart clearing functions immediately
      for (const callback of clearCartCallbacks) {
        if (typeof callback === 'function') {
          try {
            await callback();
            console.log('Successfully called cart clearing callback');
          } catch (err) {
            console.log('Error calling cart clear callback:', err);
          }
        }
      }
      
      // Show success popup
      showSuccess('Meal Logged Successfully');
      
      // Navigate back quickly to prevent any delays that might cause cart issues
      setTimeout(() => {
        if (navigation && typeof navigation.goBack === 'function') {
          navigation.goBack();
        }
      }, 300);
    } catch (error) {
      console.error('Error logging meal:', error);
      // Show error popup
      showSuccess('Failed to log meal');
    } finally {
      setIsSaving(false);
    }
  }

  const handleConfirmPress = async () => {
    if (!auth.currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to save a meal',
      })
      return
    }

    if (foods.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add at least one food to create a meal',
      })
      return
    }

    if (mealName.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a name for your meal',
      })
      return
    }

    try {
      console.log("💾 CONFIRM MEAL: Starting aggressive cart clearing process");
      setIsSaving(true)
      const totalMacros = calculateTotalMacros()
      
      // Make a copy of the foods array before clearing it
      const foodsCopy = [...foods];
      
      // Clear local state immediately
      setFoods([]);
      
      // Directly clear cart in Firestore BEFORE adding meal
      try {
        if (auth.currentUser) {
          console.log("Forcing reset of ALL cart items before saving meal");
          await forceResetAllCartItems(auth.currentUser.uid);
        }
      } catch (clearError) {
        console.error("Error clearing cart in Firestore:", clearError);
      }
      
      const newMeal = {
        userId: auth.currentUser.uid,
        mealName: mealName,
        protein: totalMacros.protein,
        carbs: totalMacros.carbs,
        fat: totalMacros.fat,
        calories: totalMacros.calories,
        sugar: totalMacros.sugar,
        fibers: totalMacros.fibers,
        sodium: totalMacros.sodium,
        date: new Date().toISOString().split('T')[0],
        foods: foodsCopy.map(food => ({
          id: food.id,
          name: food.name,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          calories: food.calories,
          sodium: food.sodium || 0,
          sugar: food.sugar || 0,
          fibers: food.fibers || 0,
          amount: food.amount || 100,
          unit: food.unit || 'g'
        })),
        imageUrl: mealImage,
        isCustom: true
      }
      
      await addMeal(newMeal)
      
      // Directly clear cart in Firestore AFTER adding meal
      try {
        if (auth.currentUser) {
          console.log("Forcing reset of ALL cart items AFTER saving meal");
          await forceResetAllCartItems(auth.currentUser.uid);
        }
      } catch (clearError) {
        console.error("Error clearing cart in Firestore:", clearError);
      }
      
      // Get the callbacks for clearing cart 
      const onMealLogged = route.params?.onMealLogged;
      const clearCart = route.params?.clearCart;
      
      // Call all possible cart clearing functions
      const clearCartCallbacks = [onMealLogged, clearCart];
      
      for (const callback of clearCartCallbacks) {
        if (typeof callback === 'function') {
          try {
            await callback();
            console.log('Successfully called cart clearing callback');
          } catch (err) {
            console.log('Error calling cart clear callback:', err);
          }
        }
      }
      
      // Try to get the navigation reference to force clear cart
      try {
        if (navigation && navigation.getParam) {
          const paramCallback = navigation.getParam('onMealLogged');
          if (typeof paramCallback === 'function') {
            try {
              await paramCallback();
              console.log('Successfully called navigation param callback');
            } catch (err) {
              console.log('Error with navigation param callback:', err);
            }
          }
        }
      } catch (err) {
        console.log('Error with navigation.getParam:', err);
      }
      
      // Final cleanup for absolute certainty
      try {
        if (auth.currentUser) {
          console.log("Final cart cleanup before navigation");
          await forceResetAllCartItems(auth.currentUser.uid);
        }
      } catch (error) {
        console.error("Error in final cart cleanup:", error);
      }
      
      // Refresh the HomeScreen view (if possible)
      try {
        if (typeof navigation.getParent === 'function') {
          const parent = navigation.getParent();
          if (parent && typeof parent.getState === 'function') {
            const homeScreen = parent.getState().routes?.find(
              route => route.name === 'HomeTabs' || route.name === 'Home'
            );
            
            if (homeScreen?.params?.refreshHomeScreen) {
              homeScreen.params.refreshHomeScreen();
            }
          }
        } else if (navigation.refreshHomeScreen) {
          navigation.refreshHomeScreen();
        }
      } catch (navError) {
        // Non-critical error, just log it and continue
        console.log('Navigation refresh error (non-critical):', navError);
      }
      
      // Show success popup
      showSuccess('Meal Logged and Saved');
      
      // Navigate back quickly to prevent any cart issue
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    } catch (error) {
      console.error('Error saving meal:', error)
      // Show error popup
      showSuccess('Failed to save meal');
    } finally {
      setIsSaving(false)
    }
  }

  const calculateTotalMacros = () => {
    return foods.reduce(
      (totals, food) => {
        const multiplier = (food.amount || 100) / 100;
        totals.protein += (food.protein || 0) * multiplier;
        totals.carbs += (food.carbs || 0) * multiplier;
        totals.fat += (food.fat || 0) * multiplier;
        totals.calories += (food.calories || 0) * multiplier;
        totals.sugar += (food.sugar || 0) * multiplier;
        totals.fibers += (food.fibers || 0) * multiplier;
        totals.sodium += (food.sodium || 0) * multiplier;
        return totals;
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0, sugar: 0, fibers: 0, sodium: 0 }
    );
  };

  const totalMacros = calculateTotalMacros()

  const renderQuantityModal = () => {
    if (selectedFoodIndex === null) return null;
    const selectedFood = foods[selectedFoodIndex];
    
    // Calculate macro values based on current quantity input
    const baseAmount = 100; // Base amount (typically 100g)
    const ratio = parseFloat(quantity) / baseAmount || 0;
    
    const calculatedMacros = {
      protein: Math.round(selectedFood.protein * ratio),
      carbs: Math.round(selectedFood.carbs * ratio),
      fat: Math.round(selectedFood.fat * ratio),
      calories: Math.round(selectedFood.calories * ratio),
      sodium: Math.round((selectedFood.sodium || 0) * ratio),
      sugar: Math.round((selectedFood.sugar || 0) * ratio),
      fiber: Math.round((selectedFood.fibers || 0) * ratio)
    };
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {transform: [{translateY: modalOffset}]}
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Quantity</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.foodTitleInModal}>{selectedFood.name}</Text>
              
              {/* Dynamic Macro Display */}
              <View style={styles.dynamicMacrosContainer}>
                <View style={styles.calorieRow}>
                  <Text style={styles.dynamicCalorieValue}>{calculatedMacros.calories}</Text>
                  <Text style={styles.dynamicCalorieLabel}>Calories</Text>
                </View>
                
                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.proteinValue]}>{calculatedMacros.protein}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Protein</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.carbsValue]}>{calculatedMacros.carbs}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Carbs</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fatValue]}>{calculatedMacros.fat}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Fat</Text>
                  </View>
                </View>
                
                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sodiumValue]}>{calculatedMacros.sodium}mg</Text>
                    <Text style={styles.dynamicMacroLabel}>Sodium</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sugarValue]}>{calculatedMacros.sugar}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Sugar</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fibersValue]}>{calculatedMacros.fiber}g</Text>
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
                  {['g', 'ml', 'oz', 'lb'].map(unitOption => (
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
                style={styles.updateButton}
                onPress={handleUpdateQuantity}
              >
                <Text style={styles.updateButtonText}>Update Quantity</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Handle adding image
  const handleAddImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'You need to grant camera roll permissions to add an image'
        });
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        // Use the first selected asset's URI
        setMealImage(result.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Image Added',
          text2: 'Your image has been added successfully'
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add image'
      });
    }
  }

  // Helper function to calculate adjusted macros based on amount
  const calculateAdjustedMacros = (food) => {
    const baseAmount = 100; // Base amount (typically 100g)
    const ratio = (food.amount || 100) / baseAmount;
    
    return {
      protein: Math.round(food.protein * ratio),
      carbs: Math.round(food.carbs * ratio),
      fat: Math.round(food.fat * ratio),
      calories: Math.round(food.calories * ratio),
      sodium: Math.round((food.sodium || 0) * ratio),
      sugar: Math.round((food.sugar || 0) * ratio),
      fibers: Math.round((food.fibers || 0) * ratio)
    };
  }

  const foodItem = (food, index) => {
    // Calculate adjusted macros based on the food's amount
    const adjustedMacros = calculateAdjustedMacros(food);
    
    return (
      <View key={`food-${food.id}-${index}`} style={styles.foodItem}>
        <View style={styles.foodItemContent}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodAmount}>
            {food.amount || 1} {food.unit || 'g'}
          </Text>
          <View style={styles.macroWrapper}>
            <View style={styles.macrosGrid}>
              <View style={styles.macrosColumn}>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#EF476F' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.protein}g</Text>
                    <Text style={styles.macroLabel}>  Protein</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#06D6A0' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.carbs}g</Text>
                    <Text style={styles.macroLabel}>  Carbs</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FFD166' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.fat}g</Text>
                    <Text style={styles.macroLabel}>  Fat</Text>
                  </Text>
                </View>
              </View>
              
              <View style={styles.macrosColumn}>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.sodium}mg</Text>
                    <Text style={styles.macroLabel}>  Sodium</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#D4C19C' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.sugar}g</Text>
                    <Text style={styles.macroLabel}>  Sugar</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#5AC8FA' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{adjustedMacros.fibers}g</Text>
                    <Text style={styles.macroLabel}>  Fiber</Text>
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.macroSeparator} />
            
            <View style={styles.footerRow}>
              <Text style={styles.caloriesValue}>
                {adjustedMacros.calories} Calories
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.foodItemActions}>
          <TouchableOpacity onPress={() => handleEditFood(index)} style={styles.editButton}>
            <MaterialCommunityIcons name="pencil" size={18} color="#EDEDED" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteFood(index)} style={styles.deleteItemButton}>
            <MaterialCommunityIcons name="delete-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Helper function to format macros with 1 decimal, but hide .0
  const formatMacro = (value) => {
    // If it's a whole number, don't show decimal
    if (value % 1 === 0) {
      return Math.round(value) + 'g';
    }
    // Otherwise show 1 decimal place
    return value.toFixed(1) + 'g';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.modalView}>
        {/* Success Popup */}
        <SuccessPopup 
          visible={showSuccessPopup} 
          message={successMessage} 
          onDismiss={() => setShowSuccessPopup(false)}
        />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#EDEDED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Meal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meal Details</Text>
            </View>

            {/* Image section */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: mealImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400' }}
                style={styles.mealImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.changeImageButton} onPress={handleAddImage}>
                <Text style={styles.changeImageText}>{mealImage ? 'Change Image' : 'Add Image'}</Text>
              </TouchableOpacity>
            </View>

            {/* Name input field - now required */}
            <View style={styles.inputGroup}>
              <View style={styles.nameInputHeader}>
                <Text style={styles.inputLabel}>
                  Meal Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.aiSuggestButton}
                  onPress={handleGenerateAiName}
                >
                  <Ionicons name="bulb-outline" size={16} color="#FFD700" />
                  <Text style={styles.aiSuggestText}>Suggest Name</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.textInput, !mealName.trim() && styles.inputRequired]}
                placeholder="Enter a name for this meal"
                placeholderTextColor="#A0A0A0"
                value={mealName}
                onChangeText={setMealName}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items in Meal</Text>
            </View>

            {foods.length === 0 ? (
              <View style={styles.emptyFoodList}>
                <Text style={styles.emptyFoodText}>
                  Your meal is empty. Go back to add items.
                </Text>
              </View>
            ) : (
              <View>
                {foods.map((food, index) => foodItem(food, index))}
              </View>
            )}
          </View>

          {foods.length > 0 && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Meal Summary</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.totalCaloriesContainer}>
                  <View style={styles.calorieCircle}>
                    <Text style={styles.totalCaloriesValue}>{Math.round(totalMacros.calories)}</Text>
                    <Text style={styles.totalCaloriesLabel}>calories</Text>
                  </View>
                </View>
                
                <View style={styles.macroDistributionContainer}>
                  <Text style={styles.macroDistributionLabel}>Macro Distribution</Text>
                  <View style={styles.macroProgressRow}>
                    <View style={[styles.macroProgressItem, {flex: totalMacros.protein}]}>
                      <View style={[styles.macroProgressBar, {backgroundColor: '#EF476F'}]} />
                    </View>
                    <View style={[styles.macroProgressItem, {flex: totalMacros.carbs}]}>
                      <View style={[styles.macroProgressBar, {backgroundColor: '#06D6A0'}]} />
                    </View>
                    <View style={[styles.macroProgressItem, {flex: totalMacros.fat}]}>
                      <View style={[styles.macroProgressBar, {backgroundColor: '#FFD166'}]} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.macroDetailsDivider} />
                
                <View style={styles.macroSummaryGrid}>
                  <View style={styles.macroSummaryRow}>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#EF476F' }]} />
                        <Text style={styles.macroSummaryLabel}>Protein</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.proteinValue]}>
                        {formatMacro(totalMacros.protein)}
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#06D6A0' }]} />
                        <Text style={styles.macroSummaryLabel}>Carbs</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.carbsValue]}>
                        {formatMacro(totalMacros.carbs)}
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#FFD166' }]} />
                        <Text style={styles.macroSummaryLabel}>Fat</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.fatValue]}>
                        {formatMacro(totalMacros.fat)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.macroSummaryRow}>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#FF9500' }]} />
                        <Text style={styles.macroSummaryLabel}>Sodium</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.sodiumValue]}>
                        {Math.round(totalMacros.sodium)}mg
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#D4C19C' }]} />
                        <Text style={styles.macroSummaryLabel}>Sugar</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.sugarValue]}>
                        {formatMacro(totalMacros.sugar)}
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#5AC8FA' }]} />
                        <Text style={styles.macroSummaryLabel}>Fiber</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.fibersValue]}>
                        {formatMacro(totalMacros.fibers)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleLogMeal} 
            style={[styles.logButton, foods.length === 0 && styles.disabledButton, isSaving && styles.disabledButton]}
            disabled={foods.length === 0 || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, foods.length === 0 && styles.disabledButtonText]}>Log</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleConfirmPress} 
            style={[styles.logAndSaveButton, foods.length === 0 && styles.disabledButton, isSaving && styles.disabledButton]}
            disabled={foods.length === 0 || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, foods.length === 0 && styles.disabledButtonText]}>Log & Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quantity Edit Modal */}
        {renderQuantityModal()}
        
        {/* AI Meal Name Suggestion Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAiSuggestionModal}
          onRequestClose={() => setShowAiSuggestionModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAiSuggestionModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                <View style={styles.aiSuggestionModalContent}>
                  <View style={styles.aiSuggestionHeader}>
                    <Ionicons name="bulb" size={24} color="#FFD700" />
                    <Text style={styles.aiSuggestionTitle}>AI Suggested Name</Text>
                  </View>
                  
                  <Text style={styles.aiSuggestionText}>{aiMealNameSuggestion}</Text>
                  
                  <View style={styles.aiActionButtons}>
                    <TouchableOpacity 
                      style={[styles.aiActionButton, styles.aiRejectButton]}
                      onPress={() => setShowAiSuggestionModal(false)}
                    >
                      <Text style={styles.aiRejectButtonText}>No Thanks</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.aiActionButton, styles.aiAcceptButton]}
                      onPress={acceptAiSuggestion}
                    >
                      <Text style={styles.aiAcceptButtonText}>Use This</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.aiPreferenceContainer}>
                    <Text style={styles.aiPreferenceText}>Don't show suggestions</Text>
                    <Switch
                      value={disableAiSuggestions}
                      onValueChange={handleDisableAiSuggestions}
                      trackColor={{ false: '#3A3A3C', true: '#2E5E3B' }}
                      thumbColor={disableAiSuggestions ? '#45A557' : '#FFFFFF'}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  modalView: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000000",
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
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    paddingBottom: 80,
  },
  formSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
    width: "100%",
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyFoodList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    marginVertical: 10,
  },
  emptyFoodText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  mealImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  changeImageButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputRequired: {
    borderColor: "#FF3B30",
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  foodItemContent: {
    flex: 1,
    marginRight: 10,
  },
  foodName: {
    color: "#EDEDED",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  foodAmount: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 8,
  },
  macroWrapper: {
    justifyContent: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  macrosColumn: {
    flex: 1,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  macroText: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  macroValue: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  macroLabel: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  macroSeparator: {
    height: 1,
    backgroundColor: '#2E2E2E',
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  caloriesValue: {
    color: "#45A557",
    fontSize: 15,
    fontWeight: "bold",
  },
  foodItemActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  deleteItemButton: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalCaloriesContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  calorieCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#292929',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  totalCaloriesValue: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  totalCaloriesLabel: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  macroDistributionContainer: {
    marginBottom: 25,
  },
  macroDistributionLabel: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  macroProgressRow: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  macroProgressItem: {
    height: '100%',
  },
  macroProgressBar: {
    height: '100%',
    width: '100%',
  },
  macroDetailsDivider: {
    height: 1,
    backgroundColor: '#2E2E2E',
    marginBottom: 20,
  },
  macroSummaryGrid: {
    marginTop: 5,
  },
  macroSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  macroSummaryItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  macroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryMacroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  macroSummaryLabel: {
    color: "#A0A0A0",
    fontSize: 13,
    fontWeight: '500',
  },
  macroSummaryValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: 'center',
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    backgroundColor: "#000000",
    paddingBottom: 30,
    justifyContent: "space-between",
  },
  logButton: {
    backgroundColor: "#3A7845",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  logAndSaveButton: {
    backgroundColor: "#45A557",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  foodTitleInModal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  modalSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  quantityInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    flex: 0.4,
    marginRight: 10,
  },
  unitSelector: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedUnit: {
    backgroundColor: '#3A3A3C',
  },
  selectedUnitText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unitText: {
    color: '#FFFFFF',
  },
  updateButton: {
    backgroundColor: '#45A557',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dynamicMacrosContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  dynamicCalorieValue: {
    color: '#45A557',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 6,
  },
  dynamicCalorieLabel: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  dynamicMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dynamicMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  dynamicMacroValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dynamicMacroLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  proteinValue: { 
    color: "#EF476F",
  },
  carbsValue: { 
    color: "#06D6A0",
  },
  fatValue: { 
    color: "#FFD166",
  },
  sodiumValue: { 
    color: "#FF9500",
  },
  sugarValue: { 
    color: "#D4C19C", 
  },
  fibersValue: { 
    color: "#5AC8FA",
  },
  nameInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSuggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  aiSuggestText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  aiSuggestionModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    width: width * 0.85,
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiSuggestionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  aiSuggestionText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 20,
  },
  aiActionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  aiActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  aiRejectButton: {
    backgroundColor: '#2C2C2E',
  },
  aiAcceptButton: {
    backgroundColor: '#45A557',
  },
  aiRejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  aiAcceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiPreferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
  },
  aiPreferenceText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  popupContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
})

export default CustomMealReviewScreen
