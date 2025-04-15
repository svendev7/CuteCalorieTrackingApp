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
} from "react-native"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"

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

export const CustomMealReviewScreen: React.FC<CustomMealReviewScreenProps> = ({ navigation, route }) => {
  const initialFoods = route.params?.selectedFoods || route.params?.items || [];
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const modalOffset = useRef(new Animated.Value(0)).current;

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
    const updatedFoods = [...foods]
    updatedFoods.splice(index, 1)
    setFoods(updatedFoods)
  }

  const handleConfirmPress = () => {
    if (foods.length === 0) {
      return
    }
    console.log("Confirming Meal with items:", foods)
    navigation.goBack()
  }

  const handleLogPress = () => {
    if (foods.length === 0) {
      return
    }
    console.log("Logging meal with items:", foods)
    // Here you would log the meal to the user's daily log
    navigation.goBack()
  }

  const handleLogAndSavePress = () => {
    if (foods.length === 0) {
      return
    }
    console.log("Logging and saving meal with items:", foods)
    // Here you would log the meal to the user's daily log and save it as a custom meal
    navigation.goBack()
  }

  const calculateTotalMacros = () => {
    return foods.reduce(
      (totals, food) => {
        totals.protein += food.protein || 0;
        totals.carbs += food.carbs || 0;
        totals.fat += food.fat || 0;
        totals.calories += food.calories || 0;
        totals.sodium += food.sodium || 0;
        totals.sugar += food.sugar || 0;
        totals.fibers += food.fibers || 0;
        return totals;
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0, sodium: 0, sugar: 0, fibers: 0 },
    )
  }

  const totalMacros = calculateTotalMacros()

  const renderQuantityModal = () => {
    if (selectedFoodIndex === null) return null;
    const selectedFood = foods[selectedFoodIndex];
    
    // Calculate macro values based on current quantity input
    const baseAmount = 100; // Base amount (typically 100g)
    const ratio = parseFloat(quantity) / baseAmount || 0;
    
    const calculatedMacros = {
      protein: Math.round((selectedFood.protein * ratio) * 10) / 10,
      carbs: Math.round((selectedFood.carbs * ratio) * 10) / 10,
      fat: Math.round((selectedFood.fat * ratio) * 10) / 10,
      calories: Math.round(selectedFood.calories * ratio),
      sodium: Math.round((selectedFood.sodium || 0) * ratio),
      sugar: Math.round((selectedFood.sugar || 0) * ratio * 10) / 10,
      fiber: Math.round((selectedFood.fibers || 0) * ratio * 10) / 10
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

  const foodItem = (food, index) => (
    <View key={`food-${food.id || index}`} style={styles.foodItem}>
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
                  <Text style={styles.macroValue}>{food.protein}g</Text>
                  <Text style={styles.macroLabel}>  Protein</Text>
                </Text>
              </View>
              <View style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: '#06D6A0' }]} />
                <Text style={styles.macroText}>
                  <Text style={styles.macroValue}>{food.carbs}g</Text>
                  <Text style={styles.macroLabel}>  Carbs</Text>
                </Text>
              </View>
              <View style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: '#FFD166' }]} />
                <Text style={styles.macroText}>
                  <Text style={styles.macroValue}>{food.fat}g</Text>
                  <Text style={styles.macroLabel}>  Fat</Text>
                </Text>
              </View>
            </View>
            
            <View style={styles.macrosColumn}>
              <View style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: '#FF9500' }]} />
                <Text style={styles.macroText}>
                  <Text style={styles.macroValue}>{food.sodium || 0}mg</Text>
                  <Text style={styles.macroLabel}>  Sodium</Text>
                </Text>
              </View>
              <View style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: '#D4C19C' }]} />
                <Text style={styles.macroText}>
                  <Text style={styles.macroValue}>{food.sugar || 0}g</Text>
                  <Text style={styles.macroLabel}>  Sugar</Text>
                </Text>
              </View>
              <View style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: '#5AC8FA' }]} />
                <Text style={styles.macroText}>
                  <Text style={styles.macroValue}>{food.fibers || 0}g</Text>
                  <Text style={styles.macroLabel}>  Fiber</Text>
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.macroSeparator} />
          
          <View style={styles.footerRow}>
            <Text style={styles.caloriesValue}>
              {food.calories} Calories
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalView}>
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
                    <Text style={styles.totalCaloriesValue}>{totalMacros.calories}</Text>
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
                        {totalMacros.protein}g
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#06D6A0' }]} />
                        <Text style={styles.macroSummaryLabel}>Carbs</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.carbsValue]}>
                        {totalMacros.carbs}g
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#FFD166' }]} />
                        <Text style={styles.macroSummaryLabel}>Fat</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.fatValue]}>
                        {totalMacros.fat}g
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
                        {totalMacros.sodium}mg
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#D4C19C' }]} />
                        <Text style={styles.macroSummaryLabel}>Sugar</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.sugarValue]}>
                        {totalMacros.sugar}g
                      </Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <View style={styles.macroNameRow}>
                        <View style={[styles.summaryMacroDot, { backgroundColor: '#5AC8FA' }]} />
                        <Text style={styles.macroSummaryLabel}>Fiber</Text>
                      </View>
                      <Text style={[styles.macroSummaryValue, styles.fibersValue]}>
                        {totalMacros.fibers}g
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
            onPress={handleLogPress} 
            style={[styles.logButton, foods.length === 0 && styles.disabledButton]}
            disabled={foods.length === 0}
          >
            <Text style={[styles.buttonText, foods.length === 0 && styles.disabledButtonText]}>Log</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleLogAndSavePress} 
            style={[styles.logAndSaveButton, foods.length === 0 && styles.disabledButton]}
            disabled={foods.length === 0}
          >
            <Text style={[styles.buttonText, foods.length === 0 && styles.disabledButtonText]}>Log & Save</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Edit Modal */}
        {renderQuantityModal()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  unitText: {
    color: '#FFFFFF',
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
  perUnitText: {
    color: "#A0A0A0",
    fontSize: 11,
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
  confirmButton: {
    backgroundColor: "#45A557",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
})

export default CustomMealReviewScreen
