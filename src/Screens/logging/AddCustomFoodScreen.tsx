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
  Switch,
  Animated,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Define a type for the food item (can be expanded)
interface CustomFood {
  id?: string; // Optional for new items
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  imageUrl?: string;
  isFavorite: boolean;
}

interface AddCustomFoodScreenProps {
  navigation: any; // Add proper navigation types later
  route?: { params?: { foodToEdit?: CustomFood } }; // Added optional route with foodToEdit
}

export const AddCustomFoodScreen: React.FC<AddCustomFoodScreenProps> = ({ navigation, route }) => {
  const foodToEdit = route?.params?.foodToEdit;
  const isEditing = !!foodToEdit; // Check if we are in edit mode
  const scrollViewRef = useRef<ScrollView>(null);
  const contentOffset = useRef(new Animated.Value(0)).current;

  // Initialize with default/empty values or existing food data
  const [foodDetails, setFoodDetails] = useState<CustomFood>(() => {
    if (isEditing) {
      return { ...foodToEdit };
    } 
    return {
      mealName: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      sugar: 0,
      fibers: 0,
      sodium: 0,
      isFavorite: false,
    };
  });
  
  const [inputValues, setInputValues] = useState(() => {
    if (isEditing) {
      return {
        protein: foodToEdit.protein.toString(),
        carbs: foodToEdit.carbs.toString(),
        fat: foodToEdit.fat.toString(),
        calories: foodToEdit.calories.toString(),
        sugar: foodToEdit.sugar.toString(),
        fibers: foodToEdit.fibers.toString(),
        sodium: foodToEdit.sodium.toString(),
      };
    }
    return {
      protein: '',
      carbs: '',
      fat: '',
      calories: '',
      sugar: '',
      fibers: '',
      sodium: '',
    };
  });

  // Effect to update state if route params change (though usually modal params don't change while open)
  useEffect(() => {
    if (isEditing) {
      setFoodDetails({ ...foodToEdit });
      setInputValues({
        protein: foodToEdit.protein.toString(),
        carbs: foodToEdit.carbs.toString(),
        fat: foodToEdit.fat.toString(),
        calories: foodToEdit.calories.toString(),
        sugar: foodToEdit.sugar.toString(),
        fibers: foodToEdit.fibers.toString(),
        sodium: foodToEdit.sodium.toString(),
      });
    } // Reset if needed? Might not be necessary for this modal flow.
  }, [foodToEdit, isEditing]);

  const handleInputFocus = () => {
    // Animate content up
    Animated.timing(contentOffset, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = (field: keyof Omit<CustomFood, 'mealName' | 'imageUrl' | 'isFavorite' | 'id'>) => {
    // Set input to '0' if it's empty on blur
    if (inputValues[field] === '') {
      setInputValues(prev => ({ ...prev, [field]: '0' }));
    }
    
    // Animate content back down
    Animated.timing(contentOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = () => {
    console.log(isEditing ? 'Updating Custom Food:' : 'Saving Custom Food:', foodDetails);
    // Add logic to SAVE OR UPDATE the food item 
    // If isEditing, you might need to pass the updated food back or trigger a refresh
    navigation.goBack(); // Go back after saving/updating
  };

  const handleInputChange = (field: keyof CustomFood, value: string | number | boolean) => {
    // Handle numeric fields separately to manage string input state
    if (typeof value === 'string' && ['protein', 'carbs', 'fat', 'calories', 'sugar', 'fibers', 'sodium'].includes(field as string)) {
      setInputValues(prev => ({ ...prev, [field]: value }));
      
      // Update the actual numeric value in foodDetails
      const numberValue = value === '' ? 0 : Number.parseInt(value, 10);
      if (!isNaN(numberValue)) {
        setFoodDetails(prev => ({ ...prev, [field]: numberValue }));
      }
    } else if (field === 'isFavorite' && typeof value === 'boolean') {
      setFoodDetails(prev => ({ ...prev, [field]: value }));
    } else if (field === 'mealName' && typeof value === 'string') {
      setFoodDetails(prev => ({ ...prev, [field]: value }));
    }
    // Add handling for other fields like imageUrl if needed
  };

  const toggleFavorite = () => {
    setFoodDetails(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header - Title changes based on mode */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Custom Food' : 'Add Custom Food'}</Text>
          <View style={{ width: 40 }} />{/* Spacer */}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
        >
          <Animated.View 
            style={[styles.contentContainer, { transform: [{ translateY: contentOffset }] }]}
          >
            {/* Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: foodDetails.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400' }}
                style={styles.foodImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.changeImageButton}>
                <Text style={styles.changeImageText}>{isEditing ? 'Change Image' : 'Add Image'}</Text>
              </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Food Details</Text>

              {/* Meal Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={foodDetails.mealName}
                  onChangeText={(text) => handleInputChange('mealName', text)}
                  placeholder="Enter food name"
                  placeholderTextColor="#666666"
                  onFocus={handleInputFocus}
                  onBlur={() => handleInputBlur('calories')}
                />
              </View>

              {/* Calories Input */}
              <View style={styles.caloriesContainer}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.caloriesInput}
                  value={inputValues.calories}
                  onChangeText={(text) => handleInputChange('calories', text)}
                  onBlur={() => handleInputBlur('calories')}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666666"
                />
              </View>

              {/* Macro Inputs (Protein, Carbs, Fat) */}
              <View style={styles.macroRow}>
                <View style={styles.inputGroupThird}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputValues.protein}
                    onChangeText={(text) => handleInputChange('protein', text)}
                    onBlur={() => handleInputBlur('protein')}
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
                    onChangeText={(text) => handleInputChange('carbs', text)}
                    onBlur={() => handleInputBlur('carbs')}
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
                    onChangeText={(text) => handleInputChange('fat', text)}
                    onBlur={() => handleInputBlur('fat')}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666666"
                  />
                </View>
              </View>

              {/* Other Nutrient Inputs (Sugar, Fibers, Sodium) */}
              <View style={styles.macroRow}>
                <View style={styles.inputGroupThird}>
                  <Text style={styles.inputLabel}>Sugar (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputValues.sugar}
                    onChangeText={(text) => handleInputChange('sugar', text)}
                    onBlur={() => handleInputBlur('sugar')}
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
                    onChangeText={(text) => handleInputChange('fibers', text)}
                    onBlur={() => handleInputBlur('fibers')}
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
                    onChangeText={(text) => handleInputChange('sodium', text)}
                    onBlur={() => handleInputBlur('sodium')}
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
        
        {/* Footer with Save & Favorite Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.favoriteButton, foodDetails.isFavorite && styles.favoriteButtonActive]}
            onPress={toggleFavorite}
          >
            <MaterialCommunityIcons 
              name={foodDetails.isFavorite ? "star" : "star-outline"} 
              size={24} 
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEditing ? 'Update Food' : 'Save Food'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingBottom: 100, // Space for footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
    width: '100%',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  foodImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  changeImageButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 8,
    color: '#EDEDED',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  inputLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 8,
    color: '#EDEDED',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
    backgroundColor: '#000000',
    paddingBottom: Platform.OS === 'ios' ? 10 : 15, // Extra padding for iOS
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFCC00',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#45A557',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddCustomFoodScreen; 