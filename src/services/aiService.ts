// This is a simple AI service to generate meal names based on ingredients
// In a production app, this would call an actual AI API like OpenAI
// For this demo, we'll use a simple rule-based system

/**
 * Generate a meal name based on the food items in the meal
 * @param foods Array of food items
 * @returns A suggested meal name
 */
export const generateMealName = (foods: Array<{name: string}>): string => {
  if (!foods || foods.length === 0) {
    return '';
  }
  
  // For a single food item, just return the food name
  if (foods.length === 1) {
    return foods[0].name;
  }
  
  const foodNames = foods.map(food => food.name.toLowerCase());
  
  // Check for common meal patterns
  if (containsAny(foodNames, ['rice', 'pasta', 'noodle', 'spaghetti']) && 
      containsAny(foodNames, ['chicken', 'beef', 'pork', 'fish', 'tofu', 'shrimp'])) {
    
    // Get the protein
    const protein = findMatch(foodNames, ['chicken', 'beef', 'pork', 'fish', 'tofu', 'shrimp']);
    
    // Get the base
    const base = findMatch(foodNames, ['rice', 'pasta', 'noodle', 'spaghetti']);
    
    return capitalize(`${protein} ${base} bowl`);
  }
  
  // Check for salad pattern
  if (containsAny(foodNames, ['lettuce', 'spinach', 'greens', 'arugula', 'kale']) ||
      countMatches(foodNames, ['cucumber', 'tomato', 'avocado', 'carrot']) >= 2) {
    
    // See if there's a protein
    const protein = findMatch(foodNames, ['chicken', 'tuna', 'salmon', 'egg', 'tofu']);
    
    if (protein) {
      return capitalize(`${protein} salad`);
    } else {
      return 'Fresh salad';
    }
  }
  
  // Check for breakfast pattern
  if (containsAny(foodNames, ['egg', 'bacon', 'sausage', 'toast', 'pancake', 'waffle'])) {
    if (containsAny(foodNames, ['pancake', 'waffle', 'french toast'])) {
      return 'Breakfast stack';
    } else {
      return 'Breakfast plate';
    }
  }
  
  // Check for fruit/yogurt pattern
  if (countMatches(foodNames, ['apple', 'banana', 'berry', 'strawberry', 'blueberry', 'yogurt', 'granola']) >= 2) {
    return 'Fruit & yogurt bowl';
  }
  
  // Check for sandwich pattern
  if (containsAny(foodNames, ['bread', 'toast', 'bun', 'roll', 'tortilla', 'wrap'])) {
    const protein = findMatch(foodNames, ['chicken', 'turkey', 'ham', 'beef', 'tuna', 'egg']);
    
    if (containsAny(foodNames, ['tortilla', 'wrap'])) {
      return capitalize(`${protein || 'veggie'} wrap`);
    } else {
      return capitalize(`${protein || 'veggie'} sandwich`);
    }
  }
  
  // Check for smoothie pattern
  if (containsAny(foodNames, ['banana', 'berry', 'milk', 'yogurt', 'protein', 'smoothie'])) {
    const fruit = findMatch(foodNames, ['banana', 'strawberry', 'blueberry', 'mango', 'peach']);
    
    if (fruit) {
      return capitalize(`${fruit} smoothie`);
    } else {
      return 'Fruit smoothie';
    }
  }
  
  // Default: use the two main ingredients
  if (foods.length >= 2) {
    return capitalize(`${foods[0].name} & ${foods[1].name}`);
  }
  
  // Fallback
  return 'Custom meal';
};

/**
 * Check if any of the terms are in the array
 */
function containsAny(arr: string[], terms: string[]): boolean {
  return arr.some(item => 
    terms.some(term => 
      item.toLowerCase().includes(term.toLowerCase())
    )
  );
}

/**
 * Find the first matching term in the array
 */
function findMatch(arr: string[], terms: string[]): string {
  for (const item of arr) {
    for (const term of terms) {
      if (item.toLowerCase().includes(term.toLowerCase())) {
        return term;
      }
    }
  }
  return '';
}

/**
 * Count how many terms match in the array
 */
function countMatches(arr: string[], terms: string[]): number {
  let count = 0;
  for (const term of terms) {
    if (arr.some(item => item.toLowerCase().includes(term.toLowerCase()))) {
      count++;
    }
  }
  return count;
}

/**
 * Capitalize the first letter of each word
 */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 