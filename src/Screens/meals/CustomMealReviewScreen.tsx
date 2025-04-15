"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from "react-native"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"

const { width, height } = Dimensions.get("window")

interface Food {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sugar?: number
  fibers?: number
  sodium?: number
  amount?: number
  unit?: string
}

interface CustomMealReviewScreenProps {
  navigation: any
  route: any
}

export const CustomMealReviewScreen: React.FC<CustomMealReviewScreenProps> = ({ navigation, route }) => {
  // Added console.log to debug what's coming in from route params
  console.log("Route params:", route.params);
  
  const initialFoods = route.params?.selectedFoods || route.params?.items || [];
  const [foods, setFoods] = useState<Food[]>(initialFoods);

  const handleEditFood = (index: number) => {
    const foodToEdit = foods[index]
    console.log("Editing food:", foodToEdit.name);
    // Navigate to an edit screen (e.g., AddCustomFoodScreen in edit mode)
    // Pass foodToEdit details as params using the navigate function passed in props
    if (navigation.navigate) {
        navigation.navigate('EditCustomFood', { item: foodToEdit }); 
    } else {
        console.error("Navigation function not provided to CustomMealReviewScreen");
    }
  }

  const handleDeleteFood = (index: number) => {
    const updatedFoods = [...foods]
    updatedFoods.splice(index, 1)
    setFoods(updatedFoods)
  }

  const renderRightActions = (index: number) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteFood(index)}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color="#FFFFFF" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

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
        totals.protein += food.protein || 0
        totals.carbs += food.carbs || 0
        totals.fat += food.fat || 0
        totals.calories += food.calories || 0
        return totals
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )
  }

  const totalMacros = calculateTotalMacros()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                  {foods.map((food, index) => (
                    <Swipeable
                      key={food.id || index}
                      renderRightActions={() => renderRightActions(index)}
                    >
                      <View key={food.id || index} style={styles.foodItem}>
                        <View style={styles.foodItemContent}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodAmount}>
                            {food.amount || 1} {food.unit || 'serving'}
                          </Text>
                          <Text style={styles.foodMacros}>
                            {food.calories} Cal - P: {food.protein}g &bull; C: {food.carbs}g &bull; F: {food.fat}g
                          </Text>
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
                    </Swipeable>
                  ))}
                </View>
              )}
            </View>

            {foods.length > 0 && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Meal Summary</Text>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Calories:</Text>
                    <Text style={[styles.summaryValue, styles.caloriesValue]}>{totalMacros.calories}</Text>
                  </View>
                  <View style={styles.macroSummaryRow}>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryLabel}>Protein</Text>
                      <Text style={[styles.macroSummaryValue, styles.proteinValue]}>{totalMacros.protein}g</Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryLabel}>Carbs</Text>
                      <Text style={[styles.macroSummaryValue, styles.carbsValue]}>{totalMacros.carbs}g</Text>
                    </View>
                    <View style={styles.macroSummaryItem}>
                      <Text style={styles.macroSummaryLabel}>Fat</Text>
                      <Text style={[styles.macroSummaryValue, styles.fatValue]}>{totalMacros.fat}g</Text>
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
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    marginBottom: 4,
  },
  foodMacros: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  foodItemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteItemButton: {
    padding: 8,
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  summaryContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  summaryLabel: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  summaryValue: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#45A557",
  },
  macroSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    paddingTop: 15,
  },
  macroSummaryItem: {
    alignItems: "center",
  },
  macroSummaryLabel: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 5,
  },
  macroSummaryValue: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
  },
  proteinValue: { color: "#FFD166" },
  carbsValue: { color: "#06D6A0" },
  fatValue: { color: "#EF476F" },
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
    backgroundColor: "#45A557",
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
})

export default CustomMealReviewScreen
