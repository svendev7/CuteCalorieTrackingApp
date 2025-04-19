import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, SafeAreaView, Platform, Alert, Modal, Animated, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Using Ionicons for cart
import { auth } from '../../config/firebase';
import { getRecentMealsByUserId, getFavoriteMealsByUserId, getSavedMealsByUserId } from '../../services/mealService';

const { width, height } = Dimensions.get('window');

// Interfaces for data types
interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sodium?: number;
  sugar?: number;
  fibers?: number;
  type: 'Recent' | 'Created' | 'Favorites';
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  sugar?: number;
  fibers?: number;
  type: 'Recent' | 'Created' | 'Favorites';
}

interface AddMealLogScreenProps {
  navigation: any; // Add proper navigation types later
}

const AddMealLogScreen: React.FC<AddMealLogScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Foods');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Recent');
  const [cartCount, setCartCount] = useState(0); // Example cart count
  const [currentMealItems, setCurrentMealItems] = useState<(FoodItem | MealItem)[]>([]); // State to hold added items
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | MealItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const modalOffset = useRef(new Animated.Value(0)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const filterIndicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Add states for Firestore data
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch meals based on active filter
  useEffect(() => {
    fetchMeals();
  }, [activeFilter]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      let meals = [];
      
      switch (activeFilter) {
        case 'Recent':
          meals = await getRecentMealsByUserId(currentUser.uid);
          break;
        case 'Favorites':
          meals = await getFavoriteMealsByUserId(currentUser.uid);
          break;
        case 'Created':
          meals = await getSavedMealsByUserId(currentUser.uid);
          break;
        default:
          meals = await getRecentMealsByUserId(currentUser.uid);
      }
      
      // Transform meals to the format expected by the UI
      const transformedMeals = meals.map(meal => ({
        id: meal.id,
        name: meal.mealName,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sodium: meal.sodium,
        sugar: meal.sugar,
        fibers: meal.fibers,
        type: activeFilter as 'Recent' | 'Created' | 'Favorites'
      }));
      
      if (activeTab === 'Meals') {
        setMealItems(transformedMeals);
      } else {
        // For now, we don't have individual foods in Firestore
        // This would need to be implemented separately
        setFoodItems([
          { 
            id: '1', 
            name: "Chicken (Sample)", 
            protein: 20, 
            carbs: 0, 
            fat: 5, 
            calories: 165, 
            sodium: 400, 
            sugar: 0, 
            fibers: 0, 
            type: activeFilter as 'Recent' | 'Created' | 'Favorites' 
          },
          { 
            id: '2', 
            name: "Rice (Sample)", 
            protein: 4, 
            carbs: 45, 
            fat: 0, 
            calories: 200, 
            sodium: 10, 
            sugar: 0, 
            fibers: 1, 
            type: activeFilter as 'Recent' | 'Created' | 'Favorites' 
          }
        ]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tabName: string) => {
    // Animate tab indicator
    Animated.spring(tabIndicatorPosition, {
      toValue: tabName === 'Foods' ? 0 : 1,
      friction: 20, // Higher friction = less bouncy
      tension: 100, // Lower tension = slower
      useNativeDriver: false,
    }).start();
    
    setActiveTab(tabName);
    // Reset filter to Recent when switching tabs
    setActiveFilter('Recent');
    // Reset filter indicator position
    Animated.spring(filterIndicatorPosition, {
      toValue: 0, // 'Recent' is at position 0
      friction: 20,
      tension: 100,
      useNativeDriver: false,
    }).start();
    
    // Fetch data when tab changes
    fetchMeals();
  };

  const handleFilterPress = (filterName: string) => {
    // Calculate position based on filter index
    const filterIndex = ['Recent', 'Created', 'Favorites'].indexOf(filterName);
    
    // Animate filter indicator
    Animated.spring(filterIndicatorPosition, {
      toValue: filterIndex,
      friction: 20,
      tension: 100,
      useNativeDriver: false,
    }).start();
    
    setActiveFilter(filterName);
  };

  const handleAddItemToMeal = (item: FoodItem | MealItem, selectedQuantity: string = '100', selectedUnit: string = 'g') => {
    // Ensure item has all required fields for Food interface in CustomMealReviewScreen
    const enhancedItem = {
      ...item,
      // Add default values for any missing properties needed in CustomMealReviewScreen
      amount: parseFloat(selectedQuantity) || 100,
      unit: selectedUnit || 'g',
      // Ensure these fields exist for the Food interface in CustomMealReviewScreen
      sugar: item.sugar || 0,
      fibers: item.fibers || 0,
      sodium: item.sodium || 0,
    };
    setCurrentMealItems(prev => [...prev, enhancedItem]); // Add to internal state
    setSelectedItems(prev => [...prev, enhancedItem]); // Also add to selected items for continue button
    setCartCount(prev => prev + 1);
  };

  const handleEditItem = (item: FoodItem | MealItem) => {
    // Navigate to edit screen or show modal
    // Ensure item is a FoodItem before trying to edit (Meals might not be editable this way)
    if ('protein' in item) { // Simple check if it's a FoodItem
      navigation.navigate('EditCustomFood', { item }); // Use the new navigation target
    }
  };

  const handleFoodPress = (item: FoodItem | MealItem) => {
    setSelectedFood(item);
    // Reset quantity and unit to default values each time
    setQuantity('100');
    setUnit('g');
    setModalVisible(true);
  };

  const renderQuantityModal = () => {
    if (!selectedFood) return null;
    
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
      fibers: Math.round((selectedFood.fibers || 0) * ratio * 10) / 10
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
                <Text style={styles.modalTitle}>Set Quantity</Text>
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
                    <Text style={[styles.dynamicMacroValue, styles.proteinColor]}>{calculatedMacros.protein}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Protein</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.carbsColor]}>{calculatedMacros.carbs}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Carbs</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fatColor]}>{calculatedMacros.fat}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Fat</Text>
                  </View>
                </View>
                
                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sodiumColor]}>{calculatedMacros.sodium}mg</Text>
                    <Text style={styles.dynamicMacroLabel}>Sodium</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sugarColor]}>{calculatedMacros.sugar}g</Text>
                    <Text style={styles.dynamicMacroLabel}>Sugar</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fiberColor]}>{calculatedMacros.fibers}g</Text>
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
                style={styles.addToMealButton}
                onPress={() => {
                  handleAddItemToMeal(selectedFood, quantity, unit);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.addToMealButtonText}>Add to Meal</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E92CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMeals} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const itemsToDisplay: (FoodItem | MealItem)[] = activeTab === 'Foods' ? foodItems : mealItems;
    const filteredItems = itemsToDisplay.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const typeMatch = item.type === activeFilter;
      return nameMatch && typeMatch;
    });

    return filteredItems.map((item) => {
      const handleDeletePress = () => {
        Alert.alert(
          "Delete Item",
          `Are you sure you want to delete ${item.name}?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Delete", 
              style: "destructive",
              onPress: () => console.log('Deleted:', item.name)
            }
          ]
        );
      };

      return (
        <View key={item.id} style={styles.listItem}>
          <View style={styles.itemImagePlaceholder} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <View style={styles.macroWrapper}>
              <View style={styles.macrosGrid}>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#EF476F' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.protein}g</Text>
                    <Text style={styles.macroLabel}>  Protein</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#06D6A0' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.carbs}g</Text>
                    <Text style={styles.macroLabel}>  Carbs</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FFD166' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.fat}g</Text>
                    <Text style={styles.macroLabel}>  Fat</Text>
                  </Text>
                </View>
              </View>
              
              <View style={styles.macroSeparator} />

              <View style={styles.macrosGrid}>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF9500' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.sodium || 0}mg</Text>
                    <Text style={styles.macroLabel}>  Sodium</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#D4C19C' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.sugar || 0}g</Text>
                    <Text style={styles.macroLabel}>  Sugar</Text>
                  </Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#5AC8FA' }]} />
                  <Text style={styles.macroText}>
                    <Text style={styles.macroValue}>{item.fibers || 0}g</Text>
                    <Text style={styles.macroLabel}>  Fiber</Text>
                  </Text>
                </View>
              </View>
              
              <View style={styles.macroSeparator} />
              
              <View style={styles.footerRow}>
                <Text style={styles.itemCaloriesValue}>{item.calories} Calories</Text>
                <Text style={styles.perUnitText}>per 100g</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => handleFoodPress(item)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    });
  };

  const handleAddFoodPress = () => {
    // Create a simple animation for the button press
    const pressAnimation = new Animated.Value(1);
    
    Animated.sequence([
      // First scale down
      Animated.timing(pressAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      // Then scale back up
      Animated.timing(pressAnimation, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      // Finally return to normal
      Animated.timing(pressAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate when animation is complete
      navigation.navigate('AddFoodOptions');
    });
    
    // Apply animation to button (we'll just simulate it here since we can't directly animate the already-pressed button)
    setTimeout(() => {
      navigation.navigate('AddFoodOptions');
    }, 300);
  };

  const handleContinuePress = () => {
    if (selectedItems.length === 0) {
      return;
    }
    // Navigate to CustomMealReviewScreen with the selected items
    navigation.navigate('CustomMealReview', { 
      selectedFoods: selectedItems 
    });
  };

  const handleCartPress = () => {
    // Pass the currently added items to the review screen
    if (currentMealItems.length === 0) {
      return; // Don't navigate if cart is empty
    }
    navigation.navigate('CustomMealReview', { selectedFoods: currentMealItems }); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header matching other screens exactly */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Items</Text>
          <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Updated Tabs with Animated Indicator */}
          <View style={styles.tabContainer}>
            {/* Animated Tab Indicator */}
            <Animated.View 
              style={[
                styles.tabIndicator,
                {
                  transform: [{
                    translateX: tabIndicatorPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width / 2 - 20] // Using pixel values instead of percentages
                    })
                  }]
                }
              ]} 
            />
            
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handleTabPress('Foods')}
            >
              <Text style={[styles.tabText, activeTab === 'Foods' && styles.activeTabText]}>Foods</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handleTabPress('Meals')}
            >
              <Text style={[styles.tabText, activeTab === 'Meals' && styles.activeTabText]}>Meals</Text>
            </TouchableOpacity>
          </View>

          {/* Updated Search Bar with Icon */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color="#666666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#666666"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          {/* Updated Add Food Button */}
          {activeTab === 'Foods' && (
            <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFoodPress}>
              <MaterialCommunityIcons name="plus" size={20} color="#45A557" />
              <Text style={styles.addFoodButtonText}>Add food</Text>
            </TouchableOpacity>
          )}

          {/* Updated Filters with Animated Indicator */}
          <View style={styles.filterContainer}>
            {/* Animated Filter Indicator */}
            <Animated.View 
              style={[
                styles.filterIndicator,
                {
                  transform: [{
                    translateX: filterIndicatorPosition.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, (width - 40) / 3, 2 * (width - 40) / 3] // Using pixel values
                    })
                  }],
                  width: (width - 40) / 3 // Ensuring width is correct
                }
              ]} 
            />
            
            {['Recent', 'Created', 'Favorites'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={styles.filterButton}
                onPress={() => handleFilterPress(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content List */}
          <View style={styles.listContainer}>
            {renderContent()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleContinuePress} 
            style={[styles.continueButton, selectedItems.length === 0 && styles.disabledButton]}
            disabled={selectedItems.length === 0}
          >
            <Text style={[styles.buttonText, selectedItems.length === 0 && styles.disabledButtonText]}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Modal */}
        {renderQuantityModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { // Added SafeAreaView style
    flex: 1,
    backgroundColor: '#000000', // Dark background
  },
  container: {
    flex: 1,
    backgroundColor: '#000000', // Adding background color to container
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
  cartButton: {
    padding: 5,
    width: 40, // Match the spacer width in other headers
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#45A557', // Green badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1, // Takes remaining space above footer
  },
  scrollViewContent: { // Added for padding at bottom
    paddingBottom: 20, // Add some padding below the list
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    height: 40,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: '#1A1A1A', // Match add food button background
    borderRadius: 8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    color: '#A0A0A0',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  addFoodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    height: 36,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#1A1A1A', // Match add food button background
    borderRadius: 8,
    zIndex: 0,
  },
  filterButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  filterText: {
    color: '#A0A0A0',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImagePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333333',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  macroWrapper: {
    justifyContent: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
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
  itemCaloriesValue: {
    color: '#45A557',
    fontSize: 15,
    fontWeight: 'bold',
  },
  perUnitText: {
    color: '#A0A0A0',
    fontSize: 11,
  },
  addButton: {
    backgroundColor: '#45A557', // Green add button
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
    backgroundColor: '#000000',
  },
  continueButton: {
    backgroundColor: '#45A557',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#2E2E2E',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#A0A0A0',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
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
  addToMealButton: {
    backgroundColor: '#45A557',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  addToMealButtonText: {
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
  proteinColor: { color: "#EF476F" },
  carbsColor: { color: "#06D6A0" },
  fatColor: { color: "#FFD166" },
  sodiumColor: { color: "#FF9500" },
  sugarColor: { color: "#D4C19C" },
  fiberColor: { color: "#5AC8FA" },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    color: '#EDEDED',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#3E92CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AddMealLogScreen; 