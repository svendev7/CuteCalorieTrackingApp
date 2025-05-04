"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Animated,
  Alert,
} from "react-native"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import type { Meal } from "../../services/mealService"

const { width, height } = Dimensions.get("window")

interface MealEditScreenProps {
  meal: Meal
  onClose: () => void
  onSave: (updatedMeal: Meal) => void
  onDelete: (mealId: string) => void
  visible: boolean
}

const MealEditScreen: React.FC<MealEditScreenProps> = ({ meal, onClose, onSave, onDelete, visible }) => {
  const [editedMeal, setEditedMeal] = useState<Meal>({ ...meal })
  const [inputValues, setInputValues] = useState({
    protein: meal.protein.toString(),
    carbs: meal.carbs.toString(),
    fat: meal.fat.toString(),
    calories: meal.calories.toString(),
    sugar: meal.sugar.toString(),
    fibers: meal.fibers.toString(),
    sodium: meal.sodium.toString(),
  })
  const contentOffset = useState(new Animated.Value(0))[0]

  const handleSave = () => {
    // Keep the exact original date string
    const originalDate = meal.date;
    
    // Make sure we're preserving all necessary fields from the original meal
    const updatedMeal: Meal = {
      ...meal, // Keep all original fields
      ...editedMeal, // Apply edits
      updatedAt: new Date() as any, // Update the timestamp
      // CRITICAL: Force the original date, always
      date: originalDate,
    };
    
    onSave(updatedMeal);
  }

  const handleDeleteMeal = () => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(meal.id)
          }
        }
      ]
    )
  }

  const handleInputChange = (field: keyof Meal, value: string) => {
    if (
      field === "protein" ||
      field === "carbs" ||
      field === "fat" ||
      field === "calories" ||
      field === "sugar" ||
      field === "fibers" ||
      field === "sodium"
    ) {
      setInputValues((prev) => ({
        ...prev,
        [field]: value,
      }))

      const numberValue = value === "" ? 0 : Number.parseInt(value, 10)
      if (!isNaN(numberValue)) {
        setEditedMeal((prev) => ({
          ...prev,
          [field]: numberValue,
        }))
      }
    } else {
      setEditedMeal((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleInputBlur = (field: keyof Meal) => {
    if (inputValues[field] === "") {
      setInputValues((prev) => ({
        ...prev,
        [field]: "0",
      }))
    }
    // Animate content back down
    Animated.timing(contentOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleInputFocus = () => {
    // Animate content up
    Animated.timing(contentOffset, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Meal</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.contentContainer, { transform: [{ translateY: contentOffset }] }]}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: editedMeal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400" }}
                  style={styles.mealImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.changeImageButton}>
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Meal Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Meal Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editedMeal.mealName}
                    onChangeText={(text) => handleInputChange("mealName", text)}
                    placeholder="Enter meal name"
                    placeholderTextColor="#666666"
                    onFocus={handleInputFocus}
                    onBlur={() => handleInputBlur("mealName")}
                  />
                </View>

                <View style={styles.caloriesContainer}>
                  <Text style={styles.inputLabel}>Calories</Text>
                  <TextInput
                    style={styles.caloriesInput}
                    value={inputValues.calories}
                    onChangeText={(text) => handleInputChange("calories", text)}
                    onBlur={() => handleInputBlur("calories")}
                    onFocus={handleInputFocus}
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
                      value={inputValues.protein}
                      onChangeText={(text) => handleInputChange("protein", text)}
                      onBlur={() => handleInputBlur("protein")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.inputGroupThird}>
                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={inputValues.carbs}
                      onChangeText={(text) => handleInputChange("carbs", text)}
                      onBlur={() => handleInputBlur("carbs")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.inputGroupThird}>
                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={inputValues.fat}
                      onChangeText={(text) => handleInputChange("fat", text)}
                      onBlur={() => handleInputBlur("fat")}
                      onFocus={handleInputFocus}
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
                      value={inputValues.sugar}
                      onChangeText={(text) => handleInputChange("sugar", text)}
                      onBlur={() => handleInputBlur("sugar")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.inputGroupThird}>
                    <Text style={styles.inputLabel}>Fibers (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={inputValues.fibers}
                      onChangeText={(text) => handleInputChange("fibers", text)}
                      onBlur={() => handleInputBlur("fibers")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>

                  <View style={styles.inputGroupThird}>
                    <Text style={styles.inputLabel}>Sodium (mg)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={inputValues.sodium}
                      onChangeText={(text) => handleInputChange("sodium", text)}
                      onBlur={() => handleInputBlur("sodium")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666666"
                    />
                  </View>
                </View>
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMeal}>
              <MaterialCommunityIcons name="delete-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    marginTop: height * 0.0625,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
    backgroundColor: "#000000",
    width: "100%",
    zIndex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
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
  formSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#FFFFFF",
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    backgroundColor: "#000000",
    position: "absolute",
    paddingBottom: 50,
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#45A557",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
})

export default MealEditScreen;