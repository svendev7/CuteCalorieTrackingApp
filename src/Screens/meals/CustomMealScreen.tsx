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
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

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

interface CustomMealScreenProps {
  onClose: () => void
  onSave: (mealName: string, foods: Food[], imageUrl: string) => void
}

export const CustomMealScreen: React.FC<CustomMealScreenProps> = ({ onClose, onSave }) => {
  const [mealName, setMealName] = useState("")
  const [mealImage, setMealImage] = useState("https://via.placeholder.com/200")
  const [foods, setFoods] = useState<Food[]>([])
  const [showAddFoodModal, setShowAddFoodModal] = useState(false)
  const [currentFood, setCurrentFood] = useState<Food>({
    id: Date.now().toString(),
    name: "",
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    sugar: 0,
    fibers: 0,
    sodium: 0,
    amount: 100,
    unit: "g",
  })
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleAddFood = () => {
    setCurrentFood({
      id: Date.now().toString(),
      name: "",
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      sugar: 0,
      fibers: 0,
      sodium: 0,
      amount: 100,
      unit: "g",
    })
    setEditingFoodIndex(null)
    setShowAddFoodModal(true)
  }

  const handleEditFood = (index: number) => {
    setCurrentFood({ ...foods[index] })
    setEditingFoodIndex(index)
    setShowAddFoodModal(true)
  }

  const handleDeleteFood = (index: number) => {
    const updatedFoods = [...foods]
    updatedFoods.splice(index, 1)
    setFoods(updatedFoods)
  }

  const handleSaveFood = () => {
    if (currentFood.name.trim() === "") {
      return
    }

    if (editingFoodIndex !== null) {
      // Update existing food
      const updatedFoods = [...foods]
      updatedFoods[editingFoodIndex] = currentFood
      setFoods(updatedFoods)
    } else {
      setFoods([...foods, currentFood])
    }
    setShowAddFoodModal(false)
  }

  const handleSaveMeal = (saveAndLog = false) => {
    if (mealName.trim() === "" || foods.length === 0) {
      return
    }
    onSave(mealName, foods, mealImage)
  }

  const calculateTotalMacros = () => {
    return foods.reduce(
      (totals, food) => {
        totals.protein += food.protein
        totals.carbs += food.carbs
        totals.fat += food.fat
        totals.calories += food.calories
        return totals
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )
  }

  const handleInputChange = (field: keyof Food, value: string) => {
    if (
      field === "protein" ||
      field === "carbs" ||
      field === "fat" ||
      field === "calories" ||
      field === "sugar" ||
      field === "fibers" ||
      field === "sodium" ||
      field === "amount"
    ) {
      // Convert string to number for numeric fields
      setCurrentFood({
        ...currentFood,
        [field]: value === "" ? 0 : Number.parseFloat(value),
      })
    } else {
      setCurrentFood({
        ...currentFood,
        [field]: value,
      })
    }
  }

  const totalMacros = calculateTotalMacros()

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#EDEDED" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Meal</Text>
            <View style={{ width: 40 }} /> 
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: mealImage }} style={styles.mealImage} resizeMode="cover" />
              <TouchableOpacity style={styles.changeImageButton}>
                <Text style={styles.changeImageText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Meal Info</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={mealName}
                  onChangeText={setMealName}
                  placeholder="Enter meal name"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Foods</Text>
                <TouchableOpacity onPress={handleAddFood} style={styles.addButton}>
                  <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Food</Text>
                </TouchableOpacity>
              </View>

              {foods.length === 0 ? (
                <View style={styles.emptyFoodList}>
                  <Text style={styles.emptyFoodText}>
                    No foods added yet. Tap "Add Food" to start building your meal.
                  </Text>
                </View>
              ) : (
                <View>
                  {foods.map((food, index) => (
                    <View key={food.id} style={styles.foodItem}>
                      <View style={styles.foodItemContent}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodAmount}>
                          {food.amount} {food.unit}
                        </Text>
                        <Text style={styles.foodMacros}>
                        {food.calories} Cal - P: {food.protein}g  • C: {food.carbs}g • F: {food.fat}g 
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

           
            <View style={{ height: 100 }} />
          </ScrollView>

          {foods.length > 0 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveOnlyButton} onPress={() => handleSaveMeal(false)}>
                <Text style={styles.saveOnlyButtonText}>Save Only</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveAndLogButton} onPress={() => handleSaveMeal(true)}>
                <Text style={styles.saveAndLogButtonText}>Save & Log</Text>
              </TouchableOpacity>
            </View>
          )}


          <Modal
            animationType="slide"
            transparent={true}
            visible={showAddFoodModal}
            onRequestClose={() => setShowAddFoodModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.foodModalContainer}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
              <View style={styles.foodModalContent}>
                <View style={styles.foodModalHeader}>
                  <TouchableOpacity onPress={() => setShowAddFoodModal(false)} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={24} color="#EDEDED" />
                  </TouchableOpacity>
                  <Text style={styles.foodModalTitle}>{editingFoodIndex !== null ? "Edit Food" : "Add Food"}</Text>
                  <TouchableOpacity onPress={handleSaveFood} style={styles.modalSaveButton}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.foodModalScrollView} showsVerticalScrollIndicator={false}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Food Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={currentFood.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                      placeholder="Enter food name"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.macroRow}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Amount</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.amount.toString()}
                        onChangeText={(text) => handleInputChange("amount", text)}
                        keyboardType="numeric"
                        placeholder="100"
                        placeholderTextColor="#666666"
                      />
                    </View>

                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Unit</Text>
                      <View style={styles.unitSelector}>
                        <TouchableOpacity
                          style={[styles.unitButton, currentFood.unit === "g" && styles.selectedUnitButton]}
                          onPress={() => handleInputChange("unit", "g")}
                        >
                          <Text
                            style={[styles.unitButtonText, currentFood.unit === "g" && styles.selectedUnitButtonText]}
                          >
                            g
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitButton, currentFood.unit === "ml" && styles.selectedUnitButton]}
                          onPress={() => handleInputChange("unit", "ml")}
                        >
                          <Text
                            style={[styles.unitButtonText, currentFood.unit === "ml" && styles.selectedUnitButtonText]}
                          >
                            ml
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitButton, currentFood.unit === "oz" && styles.selectedUnitButton]}
                          onPress={() => handleInputChange("unit", "oz")}
                        >
                          <Text
                            style={[styles.unitButtonText, currentFood.unit === "oz" && styles.selectedUnitButtonText]}
                          >
                            oz
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.caloriesContainer}>
                    <Text style={styles.inputLabel}>Calories</Text>
                    <TextInput
                      style={styles.caloriesInput}
                      value={currentFood.calories.toString()}
                      onChangeText={(text) => handleInputChange("calories", text)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.macroRow}>
                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Protein (g)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.protein.toString()}
                        onChangeText={(text) => handleInputChange("protein", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>

                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Carbs (g)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.carbs.toString()}
                        onChangeText={(text) => handleInputChange("carbs", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>

                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Fat (g)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.fat.toString()}
                        onChangeText={(text) => handleInputChange("fat", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>
                  </View>

                  <View style={styles.macroRow}>
                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Sugar (g)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.sugar.toString()}
                        onChangeText={(text) => handleInputChange("sugar", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>

                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Fibers (g)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.fibers.toString()}
                        onChangeText={(text) => handleInputChange("fibers", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>

                    <View style={styles.inputGroupThird}>
                      <Text style={styles.inputLabel}>Sodium (mg)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={currentFood.sodium.toString()}
                        onChangeText={(text) => handleInputChange("sodium", text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666666"
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.scanQrButton}>
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" />
                    <Text style={styles.scanQrButtonText}>Scan QR Code</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalView: {
    flex: 1,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: height * 0.05,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  headerTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  mealImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  changeImageButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
  },
  changeImageText: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "500",
  },
  formSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
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
    marginBottom: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#45A557", // Green color for carbs from your color scheme
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputGroupHalf: {
    flex: 1,
    marginBottom: 15,
    marginHorizontal: 5,
  },
  inputGroupThird: {
    flex: 1,
    marginBottom: 15,
    marginHorizontal: 5,
  },
  caloriesContainer: {
    marginBottom: 15,
  },
  caloriesInput: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#EDEDED",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -5,
  },
  inputLabel: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#EDEDED",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedUnitButton: {
    backgroundColor: "#2E2E2E",
  },
  unitButtonText: {
    color: "#A0A0A0",
    fontSize: 16,
  },
  selectedUnitButtonText: {
    color: "#EDEDED",
    fontWeight: "600",
  },
  emptyFoodList: {
    padding: 20,
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFoodText: {
    color: "#A0A0A0",
    fontSize: 14,
    textAlign: "center",
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E2E2E",
    padding: 15,
    marginBottom: 10,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    color: "#EDEDED",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  foodAmount: {
    color: "#A0A0A0",
    fontSize: 14,
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
    padding: 5,
    marginRight: 5,
  },
  deleteItemButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E2E2E",
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
    paddingBottom: 10,
  },
  summaryLabel: {
    color: "#A0A0A0",
    fontSize: 16,
  },
  summaryValue: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  macroSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  macroSummaryLabel: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 5,
  },
  macroSummaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  proteinValue: {
    color: "#D93036", // Red for protein
  },
  carbsValue: {
    color: "#45A557", // Green for carbs
  },
  fatValue: {
    color: "#FFB224", // Yellow for fat
  },
  caloriesValue: {
    fontSize: 18,
    color: "#EDEDED",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    backgroundColor: "#000000",
  },
  saveAndLogButton: {
    flex: 2,
    backgroundColor: "#45A557", // Green color for carbs
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  saveAndLogButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveOnlyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#45A557",
  },
  saveOnlyButtonText: {
    color: "#45A557",
    fontSize: 16,
    fontWeight: "500",
  },
  foodModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  foodModalContent: {
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.8,
  },
  foodModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  foodModalTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  foodModalScrollView: {
    padding: 20,
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#45A557",
    borderRadius: 8,
  },
  modalSaveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  scanQrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  scanQrButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
})
