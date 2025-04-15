import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, SafeAreaView, Platform, Animated, PanResponder } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Using Ionicons for cart
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

// Interfaces for data types
interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  type: 'Recent' | 'Created' | 'Favorites';
  amount?: number;
  unit?: string;
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  type: 'Recent' | 'Created' | 'Favorites'; // Added type for meals
  amount?: number;
  unit?: string;
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

  // Dummy data - replace with actual data fetching later
  const foodItems: FoodItem[] = [
    { id: '1', name: "Potato's & Chicken &..", protein: 20, carbs: 44, fat: 12, calories: 500, type: 'Created', amount: 1, unit: 'serving' },
    { id: '2', name: 'Grilled Salmon', protein: 32, carbs: 15, fat: 18, calories: 380, type: 'Recent', amount: 1, unit: 'serving' },
    // Add more dummy items
  ];
  const mealItems: MealItem[] = [
    { id: 'm1', name: 'Breakfast Burrito', calories: 600, type: 'Recent', amount: 1, unit: 'serving' },
    { id: 'm2', name: 'Protein Lunch', calories: 750, type: 'Created', amount: 1, unit: 'serving' },
    { id: 'm3', name: 'Healthy Dinner', calories: 550, type: 'Favorites', amount: 1, unit: 'serving' },
    // Add more dummy meals
  ];

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    // Reset filter to Recent when switching tabs
    setActiveFilter('Recent');
  };

  const handleFilterPress = (filterName: string) => {
    setActiveFilter(filterName);
  };

  const handleAddItemToMeal = (item: FoodItem | MealItem) => {
    console.log('Adding:', item.name);
    // Ensure the item has amount and unit properties
    const itemToAdd = {
      ...item,
      amount: item.amount || 1,
      unit: item.unit || 'serving'
    };
    setCurrentMealItems(prev => [...prev, itemToAdd]);
    setSelectedItems(prev => [...prev, itemToAdd]);
    setCartCount(prev => prev + 1);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = currentMealItems.filter(item => item.id !== id);
    const updatedSelectedItems = selectedItems.filter(item => item.id !== id);
    
    setCurrentMealItems(updatedItems);
    setSelectedItems(updatedSelectedItems);
    setCartCount(updatedItems.length);
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteItem(id)}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color="#FFFFFF" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    const itemsToDisplay: (FoodItem | MealItem)[] = activeTab === 'Foods' ? foodItems : mealItems;
    const filteredItems = itemsToDisplay.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const typeMatch = item.type === activeFilter;
      return nameMatch && typeMatch;
    });

    return filteredItems.map((item) => (
      <Swipeable
        key={item.id}
        renderRightActions={() => renderRightActions(item.id)}
      >
        <View style={styles.listItem}>
          <View style={styles.itemImagePlaceholder} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            {/* Type check to display macros only for FoodItem */}
            {activeTab === 'Foods' && 'protein' in item && 'carbs' in item && 'fat' in item && (
              <Text style={styles.itemMacros}>
                {/* Use type inference from checks above */} 
                {item.protein}g Protein &bull; {item.carbs}g Carbs &bull; {item.fat}g Fat
              </Text>
            )}
            <Text style={styles.itemCaloriesValue}>{item.calories} Cal</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddItemToMeal(item)}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Swipeable>
    ));
  };

  const handleAddFoodPress = () => {
    // Navigate to the food options screen
    navigation.navigate('AddFoodOptions');
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
    navigation.navigate('CustomMealReview', { 
      selectedFoods: currentMealItems 
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Updated Header: Back Arrow Left, Cart Right */}
          <View style={styles.header}>
            <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}> 
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
            contentContainerStyle={styles.scrollViewContent} // Added for padding
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          >
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'Foods' && styles.activeTab]}
                onPress={() => handleTabPress('Foods')}
              >
                <Text style={[styles.tabText, activeTab === 'Foods' && styles.activeTabText]}>Foods</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'Meals' && styles.activeTab]}
                onPress={() => handleTabPress('Meals')}
              >
                <Text style={[styles.tabText, activeTab === 'Meals' && styles.activeTabText]}>Meals</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar - Moved above add food button */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#666666"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Add Food Button - Conditionally Rendered for Foods tab */}
            {activeTab === 'Foods' && (
              <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFoodPress}>
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addFoodButtonText}>Add food</Text>
              </TouchableOpacity>
            )}

            {/* Filters - Always shown for both tabs */}
            <View style={styles.filterContainer}>
              {['Recent', 'Created', 'Favorites'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, activeFilter === filter && styles.activeFilter]}
                  onPress={() => handleFilterPress(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
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
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: { // Added SafeAreaView style
    flex: 1,
    backgroundColor: '#000000', // Dark background
  },
  container: {
    flex: 1,
    // backgroundColor: '#000000', // Moved to SafeAreaView
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Keep space-between
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 15 : 10, // Adjust top padding slightly
    paddingHorizontal: 20,
    paddingBottom: 10,
    // Add border if needed
  },
  backButton: { // Added style for back button
    padding: 5, 
  },
  cartButton: {
    padding: 5,
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
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#1A1A1A', // Darker grey for tab background
    borderRadius: 8,
    padding: 4, // Padding around the tabs
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6, // Slightly rounded corners for tabs
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#333333', // Grey for active tab
  },
  tabText: {
    color: '#A0A0A0', // Lighter grey for inactive text
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF', // White for active text
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchInput: {
    backgroundColor: '#1C1C1E', // Dark input background
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E', // Button color from sketch
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
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginHorizontal: 20,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2, // Small gap between filters
  },
  activeFilter: {
    backgroundColor: '#333333',
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
    // paddingBottom: 80, // Removed, handled by scrollViewContent & footer position
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMacros: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 4,
  },
  itemCaloriesValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#45A557', // Green add button
    borderRadius: 15,
    padding: 5,
    marginLeft: 10,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
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
});

export default AddMealLogScreen; 