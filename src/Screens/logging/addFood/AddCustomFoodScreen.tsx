import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Animated,
  Keyboard,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../../config/firebase';
import { saveCustomFood } from '../../../services/mealService';
import Header from '../../../components/header/Header';
import { NutrientInput } from '../../../components/inputs';

const { width, height } = Dimensions.get('window');

// Define a type for the food item
interface CustomFood {
  id?: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  servingSize: number;
  servingUnit: string;
  imageUrl?: string;
  isFavorite: boolean;
  isUserCreated?: boolean;
}

interface AddCustomFoodScreenProps {
  navigation: any;
  route?: { params?: { foodToEdit?: CustomFood } };
}

const AddCustomFoodScreen: React.FC<AddCustomFoodScreenProps> = ({ navigation, route }) => {
  const foodToEdit = route?.params?.foodToEdit;
  const isEditing = !!foodToEdit;
  const contentOffset = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize food details
  const [foodDetails, setFoodDetails] = useState<CustomFood>({
    name: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    sugar: 0,
    fibers: 0,
    sodium: 0,
    servingSize: 100,
    servingUnit: 'g',
    isFavorite: false,
    isUserCreated: true
  });
  
  // Input values as strings for TextInput
  const [inputValues, setInputValues] = useState({
    name: '',
    protein: '0',
    carbs: '0',
    fat: '0',
    calories: '0',
    sugar: '0',
    fibers: '0',
    sodium: '0',
    servingSize: '100',
  });
  
  const [servingUnit, setServingUnit] = useState('g');

  // Update state if editing an existing food
  useEffect(() => {
    if (isEditing && foodToEdit) {
      setFoodDetails({
        ...foodToEdit,
        name: foodToEdit.name || '',
        servingSize: foodToEdit.servingSize || 100,
        servingUnit: foodToEdit.servingUnit || 'g',
        sugar: foodToEdit.sugar || 0,
        fibers: foodToEdit.fibers || 0,
        sodium: foodToEdit.sodium || 0
      });
      
      setInputValues({
        name: foodToEdit.name || '',
        protein: (foodToEdit.protein || 0).toString(),
        carbs: (foodToEdit.carbs || 0).toString(),
        fat: (foodToEdit.fat || 0).toString(),
        calories: (foodToEdit.calories || 0).toString(),
        sugar: (foodToEdit.sugar || 0).toString(),
        fibers: (foodToEdit.fibers || 0).toString(),
        sodium: (foodToEdit.sodium || 0).toString(),
        servingSize: (foodToEdit.servingSize || 100).toString(),
      });
      
      setServingUnit(foodToEdit.servingUnit || 'g');
    }
  }, [foodToEdit, isEditing]);

  const handleInputFocus = () => {
    Animated.timing(contentOffset, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = (field: string) => {
    if (inputValues[field] === '') {
      if (field === 'name') {
        setInputValues(prev => ({ ...prev, [field]: 'Unnamed Food' }));
      } else {
        setInputValues(prev => ({ ...prev, [field]: '0' }));
      }
    }
    
    Animated.timing(contentOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleInputChange = (field: string, value: string) => {
    // Update input value
    setInputValues(prev => ({ ...prev, [field]: value }));
    
    // For numeric fields
    if (field !== 'name') {
      const numberValue = value === '' ? 0 : Number.parseFloat(value);
      if (!isNaN(numberValue)) {
        setFoodDetails(prev => ({ ...prev, [field]: numberValue }));
      }
    } else {
      // For name field
      setFoodDetails(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleFavorite = () => {
    setFoodDetails(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const handleAddImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'You need to grant camera roll permissions to add an image',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setFoodDetails(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to add image',
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!foodDetails.name.trim()) {
      Alert.alert(
        'Error',
        'Please enter a food name',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }
    
    // Ensure serving size is at least 1
    if (!foodDetails.servingSize || foodDetails.servingSize < 1) {
      setFoodDetails(prev => ({ ...prev, servingSize: 1 }));
      setInputValues(prev => ({ ...prev, servingSize: '1' }));
    }

    setIsLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Prepare food data for saving
      const foodData = {
        ...foodDetails,
        name: foodDetails.name.trim(),
        isUserCreated: true,
        isFavorite: foodDetails.isFavorite,
        servingUnit: servingUnit,
        // Parse all macro values as numbers
        protein: parseFloat(inputValues.protein) || 0,
        carbs: parseFloat(inputValues.carbs) || 0,
        fat: parseFloat(inputValues.fat) || 0,
        calories: parseFloat(inputValues.calories) || 0,
        sodium: parseFloat(inputValues.sodium) || 0,
        sugar: parseFloat(inputValues.sugar) || 0,
        fibers: parseFloat(inputValues.fibers) || 0,
        servingSize: parseInt(inputValues.servingSize, 10) || 100
      };
      
      // Save to Firestore
      await saveCustomFood(currentUser.uid, foodData);
      
      // Navigate back to log items screen and trigger the success message there
      if (navigation.getParent) {
        // If this is in a navigator stack
        navigation.getParent().navigate('addMeal', { 
          foodChanged: true, 
          successMessage: `${foodData.name} ${isEditing ? 'updated' : 'added'} successfully!`
        });
      } else {
        // If direct navigation object from App.tsx
        navigation.save && navigation.save(foodData);
      }
      
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert(
        'Error',
        'Failed to save food. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => navigation.goBack()}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalView}>
            <Header
              title={isEditing ? 'Edit Food' : 'Add Custom Food'}
              onBack={() => navigation.goBack()}
              rightIcon={
                <AntDesign 
                  name={foodDetails.isFavorite ? "star" : "staro"} 
                  size={22} 
                  color={foodDetails.isFavorite ? "#FFD700" : "#FFFFFF"} 
                />
              }
              rightIconAction={toggleFavorite}
              containerStyle={styles.headerCustomStyle}
            />

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={[styles.contentContainer, { transform: [{ translateY: contentOffset }] }]}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: foodDetails.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400" }}
                    style={styles.foodImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity style={styles.changeImageButton} onPress={handleAddImage}>
                    <Text style={styles.changeImageText}>{foodDetails.imageUrl ? 'Change Image' : 'Add Image'}</Text>
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
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.disabledButton]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Food</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
  headerCustomStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#45A557",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#2E2E2E",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddCustomFoodScreen; 