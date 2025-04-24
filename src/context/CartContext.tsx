import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { FoodItem as MealServiceFoodItem, Meal } from '../services/mealService'; // Adjust path as needed

// Define the shape of a food item within the meal service context
// We use MealServiceFoodItem to avoid naming conflicts
interface FoodItem extends MealServiceFoodItem {}

// Define the shape of a cart item
export interface CartItem extends FoodItem {
  itemType: 'food' | 'meal'; 
  originalItemId: string; // ID of the original food or meal template
  // Ensure amount and unit are always present for cart logic
  amount: number;
  unit: string;
}

// Define the context shape
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: FoodItem | Meal, type: 'food' | 'meal') => void;
  removeFromCart: (cartItemId: string) => void; // Use unique cart item ID
  updateQuantity: (cartItemId: string, newAmount: number) => void; // Use unique cart item ID
  clearCart: () => void;
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number; 
    fibers: number;
    sodium: number;
  };
  itemCount: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((itemData: FoodItem | Meal, type: 'food' | 'meal') => {
    console.log("Adding to cart:", itemData, "Type:", type);
    setCartItems((prevItems) => {
      // Generate a unique ID for this specific instance in the cart
      const uniqueCartId = `${type}-${itemData.id}-${Date.now()}`;

      let newItem: CartItem;

      if (type === 'food') {
        const food = itemData as FoodItem;
        newItem = {
          ...food,
          id: uniqueCartId, // Use unique cart ID
          itemType: 'food',
          originalItemId: food.id, // Keep track of the original food ID
          // Ensure required fields have defaults
          amount: food.amount || 100,
          unit: food.unit || 'g',
          name: food.name || 'Unnamed Food',
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0,
          calories: food.calories || 0,
          sodium: food.sodium || 0,
          sugar: food.sugar || 0,
          fibers: food.fibers || 0,
        };
      } else { // type === 'meal'
        const meal = itemData as Meal;
        
        // When adding a meal, create a CartItem representing the whole meal
        // Important: For meals, we want to use the EXACT macro values from the original meal
        // without any per-100g calculation since these are already total values
        
        // Determine meal name from either mealName or name property
        const effectiveMealName = meal.mealName || (meal as any).name || 'Unnamed Meal';
        console.log("Using meal name:", effectiveMealName);
        console.log("Original meal macros:", {
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          calories: meal.calories
        });
        
        newItem = {
          // Map Meal fields to CartItem fields
          id: uniqueCartId,
          itemType: 'meal',
          originalItemId: meal.id,
          name: effectiveMealName,
          // Copy exact macro values from the meal - these are already totals
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          calories: meal.calories || 0,
          sodium: meal.sodium || 0,
          sugar: meal.sugar || 0,
          fibers: meal.fibers || 0,
          amount: 1, // Representing 1 serving of the meal
          unit: 'serving',
        };
      }

      console.log("Created cart item:", newItem);
      
      // Simple add: just append the new item
      // More complex logic could check for duplicates based on originalItemId and update quantity/replace
      return [...prevItems, newItem];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    // Remove based on the unique cart item ID
    setCartItems((prevItems) => prevItems.filter(item => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, newAmount: number) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === cartItemId 
          ? { ...item, amount: Math.max(0, newAmount) } // Update amount, ensure not negative
          : item
      )
    );
     // Note: This currently only updates the amount. If unit changes, 
     // or if changing amount should re-calculate macros based on a base serving, 
     // more complex logic might be needed here or where this is called.
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate total macros based on items currently in the cart
  const totalMacros = useMemo(() => {
    const totals = cartItems.reduce(
      (totals, item) => {
        // Use the amount/unit stored IN THE CART ITEM for calculation
        // This assumes the base macros (protein, carbs, etc.) are for a standard unit (e.g., 100g or 1 serving)
        // We need a consistent way to calculate based on the current amount/unit.
        
        // Simple calculation (assumes macros are per 100g/ml for foods, and total for meals * amount)
        let multiplier = 1;
        if (item.itemType === 'food') {
           // Assumption: item.protein etc. are per 100g/ml.
           // If item.unit is 'g' or 'ml', multiplier is item.amount / 100.
           // If unit is oz, lb, serving etc., needs conversion logic.
           // Simple approach for now:
           multiplier = item.amount / 100; // Basic assumption
        } else { // itemType === 'meal'
           // Assumption: item.protein etc. are the total for the meal.
           // Multiplier is just the number of servings (item.amount).
           multiplier = item.amount;
        }

        // Add the calculated values to the totals
        totals.calories += (item.calories || 0) * multiplier;
        totals.protein += (item.protein || 0) * multiplier;
        totals.carbs += (item.carbs || 0) * multiplier;
        totals.fat += (item.fat || 0) * multiplier;
        totals.sugar += (item.sugar || 0) * multiplier;
        totals.fibers += (item.fibers || 0) * multiplier;
        totals.sodium += (item.sodium || 0) * multiplier;
        
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fibers: 0, sodium: 0 } 
    );
    
    console.log("Calculated total macros:", totals);
    return totals;
  }, [cartItems]);
  
  const itemCount = useMemo(() => cartItems.length, [cartItems]);

  // Memoize the context value
  const value = useMemo(() => ({ 
    cartItems,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalMacros
  }), [cartItems, itemCount, addToCart, removeFromCart, updateQuantity, clearCart, totalMacros]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a custom hook to use the context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 