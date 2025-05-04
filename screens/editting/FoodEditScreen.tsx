"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { MaterialCommunityIcons, Ionicons, AntDesign } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import { auth } from "../../config/firebase.client"
import { updateFavoriteStatus, deleteUserFood } from "../../services/mealService"

const { width, height } = Dimensions.get("window")

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
  type?: "Recent" | "Created" | "Favorites"
  isFavorite?: boolean
  servingSize?: number
  servingUnit?: string
  imageUrl?: string
  isUserCreated?: boolean
}

interface FoodEditScreenProps {
  food: FoodItem
  onClose: () => void
  onSave: (updatedFood: FoodItem) => void
  onDelete: (foodId: string) => void
  visible: boolean
}

const FoodEditScreen: React.FC<FoodEditScreenProps> = ({ food, onClose, onSave, onDelete, visible }) => {
  const [editedFood, setEditedFood] = useState<FoodItem>({ 
    ...food,
    servingSize: food.servingSize || 100,
    servingUnit: food.servingUnit || 'g',
    isFavorite: food.isFavorite || false
  })
  
  const [inputValues, setInputValues] = useState({
    name: food.name,
    protein: food.protein.toString(),
    carbs: food.carbs.toString(),
    fat: food.fat.toString(),
    calories: food.calories.toString(),
    sodium: (food.sodium || 0).toString(),
    sugar: (food.sugar || 0).toString(),
    fibers: (food.fibers || 0).toString(),
    servingSize: (food.servingSize || 100).toString(),
  })
  
  const [servingUnit, setServingUnit] = useState(food.servingUnit || 'g')
  const [isSaving, setSaving] = useState(false)
  const contentOffset = useState(new Animated.Value(0))[0]

  // Add effect to update states when food prop changes
  useEffect(() => {
    setEditedFood({
      ...food,
      servingSize: food.servingSize || 100,
      servingUnit: food.servingUnit || 'g',
      isFavorite: food.isFavorite || false
    })
    
    setInputValues({
      name: food.name,
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      calories: food.calories.toString(),
      sodium: (food.sodium || 0).toString(),
      sugar: (food.sugar || 0).toString(),
      fibers: (food.fibers || 0).toString(),
      servingSize: (food.servingSize || 100).toString(),
    })
    
    setServingUnit(food.servingUnit || 'g')
  }, [food])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Prepare updated food object
      const updatedFood: FoodItem = {
        ...food,
        ...editedFood,
        servingUnit: servingUnit,
        servingSize: parseInt(inputValues.servingSize, 10) || 100,
        // Make sure all macros are parsed as numbers
        protein: parseFloat(inputValues.protein) || 0,
        carbs: parseFloat(inputValues.carbs) || 0,
        fat: parseFloat(inputValues.fat) || 0,
        calories: parseFloat(inputValues.calories) || 0,
        sodium: parseFloat(inputValues.sodium) || 0,
        sugar: parseFloat(inputValues.sugar) || 0,
        fibers: parseFloat(inputValues.fibers) || 0
      }

      // Save and close
      await onSave(updatedFood)
    } catch (error) {
      console.error('Error saving food:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFood = () => {
    Alert.alert(
      "Delete Food",
      `Are you sure you want to delete ${food.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(food.id)
          }
        }
      ]
    )
  }
  
  const handleToggleFavorite = async () => {
    try {
      // Update locally first (optimistic UI update)
      setEditedFood(prev => ({
        ...prev,
        isFavorite: !prev.isFavorite
      }))
      
      // Update in backend
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("User not authenticated")
      
      await updateFavoriteStatus(
        currentUser.uid,
        food.id,
        !editedFood.isFavorite,
        "food"
      )
    } catch (error) {
      // Revert on error
      setEditedFood(prev => ({
        ...prev,
        isFavorite: !prev.isFavorite
      }))
      
      console.error("Error updating favorite status:", error)
    }
  }

  const handleInputChange = (field: keyof FoodItem, value: string) => {
    // Update input field value
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }))
    
    // For numeric fields, update the editedFood state
    if (
      field === "protein" ||
      field === "carbs" ||
      field === "fat" ||
      field === "calories" ||
      field === "sodium" ||
      field === "sugar" ||
      field === "fibers" ||
      field === "servingSize"
    ) {
      const numberValue = value === "" ? 0 : Number.parseFloat(value)
      if (!isNaN(numberValue)) {
        setEditedFood(prev => ({
          ...prev,
          [field]: numberValue
        }))
      }
    } else {
      // For non-numeric fields like name
      setEditedFood(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleInputBlur = (field: keyof FoodItem) => {
    if (inputValues[field] === "") {
      setInputValues(prev => ({
        ...prev,
        [field]: field === "name" ? "Unnamed Food" : "0"
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
    // Animate content up when keyboard appears
    Animated.timing(contentOffset, {
      toValue: -240,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }
  
  const handleAddImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        console.error('Permission denied for accessing media library');
        Alert.alert(
          "Permission Required",
          "You need to grant camera roll permissions to add an image"
        );
        return
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })
      
      if (!result.canceled) {
        // Use the selected image URI
        setEditedFood(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }))
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Food</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <AntDesign 
                name={editedFood.isFavorite ? "star" : "staro"} 
                size={22} 
                color={editedFood.isFavorite ? "#FFD700" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.contentContainer, { transform: [{ translateY: contentOffset }] }]}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: editedFood.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400" }}
                  style={styles.foodImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.changeImageButton} onPress={handleAddImage}>
                  <Text style={styles.changeImageText}>{editedFood.imageUrl ? 'Change Image' : 'Add Image'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Food Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Food Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputValues.name}
                    onChangeText={(text) => handleInputChange("name", text)}
                    placeholder="Enter food name"
                    placeholderTextColor="#666666"
                    onFocus={handleInputFocus}
                    onBlur={() => handleInputBlur("name")}
                  />
                </View>
                
                {/* Serving Size Section */}
                <View style={styles.servingSizeContainer}>
                  <Text style={styles.inputLabel}>Serving Size</Text>
                  <View style={styles.servingSizeRow}>
                    <TextInput
                      style={styles.servingSizeInput}
                      value={inputValues.servingSize}
                      onChangeText={(text) => handleInputChange("servingSize", text)}
                      onBlur={() => handleInputBlur("servingSize")}
                      onFocus={handleInputFocus}
                      keyboardType="numeric"
                      placeholder="100"
                      placeholderTextColor="#666666"
                    />
                    
                    <View style={styles.unitSelector}>
                      {["g", "ml", "oz"].map((unitOption) => (
                        <TouchableOpacity 
                          key={unitOption}
                          style={[styles.unitOption, servingUnit === unitOption && styles.selectedUnit]}
                          onPress={() => setServingUnit(unitOption)}
                        >
                          <Text style={[styles.unitText, servingUnit === unitOption && styles.selectedUnitText]}>
                            {unitOption}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
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
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFood}>
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
  favoriteButton: {
    padding: 5,
    width: 40,
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
  foodImage: {
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
  servingSizeContainer: {
    marginBottom: 15,
  },
  servingSizeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  servingSizeInput: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  unitText: {
    color: "#FFFFFF",
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

export default FoodEditScreen; 