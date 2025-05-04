
export const generateMealName = (foods: Array<{name: string}>): string => {
  if (!foods || foods.length === 0) {
    return '';
  }
  
  if (foods.length === 1) {
    return foods[0].name;
  }
  
  const foodNames = foods.map(food => food.name.toLowerCase());
  
  if (containsAny(foodNames, ['rice', 'pasta', 'noodle', 'spaghetti']) && 
      containsAny(foodNames, ['chicken', 'beef', 'pork', 'fish', 'tofu', 'shrimp'])) {
    
    const protein = findMatch(foodNames, ['chicken', 'beef', 'pork', 'fish', 'tofu', 'shrimp']);
    
    const base = findMatch(foodNames, ['rice', 'pasta', 'noodle', 'spaghetti']);
    
    return capitalize(`${protein} ${base} bowl`);
  }
  
  if (containsAny(foodNames, ['lettuce', 'spinach', 'greens', 'arugula', 'kale']) ||
      countMatches(foodNames, ['cucumber', 'tomato', 'avocado', 'carrot']) >= 2) {
    
    const protein = findMatch(foodNames, ['chicken', 'tuna', 'salmon', 'egg', 'tofu']);
    
    if (protein) {
      return capitalize(`${protein} salad`);
    } else {
      return 'Fresh salad';
    }
  }
  
  if (containsAny(foodNames, ['egg', 'bacon', 'sausage', 'toast', 'pancake', 'waffle'])) {
    if (containsAny(foodNames, ['pancake', 'waffle', 'french toast'])) {
      return 'Breakfast stack';
    } else {
      return 'Breakfast plate';
    }
  }
  
  if (countMatches(foodNames, ['apple', 'banana', 'berry', 'strawberry', 'blueberry', 'yogurt', 'granola']) >= 2) {
    return 'Fruit & yogurt bowl';
  }
  
  if (containsAny(foodNames, ['bread', 'toast', 'bun', 'roll', 'tortilla', 'wrap'])) {
    const protein = findMatch(foodNames, ['chicken', 'turkey', 'ham', 'beef', 'tuna', 'egg']);
    
    if (containsAny(foodNames, ['tortilla', 'wrap'])) {
      return capitalize(`${protein || 'veggie'} wrap`);
    } else {
      return capitalize(`${protein || 'veggie'} sandwich`);
    }
  }
  
  if (containsAny(foodNames, ['banana', 'berry', 'milk', 'yogurt', 'protein', 'smoothie'])) {
    const fruit = findMatch(foodNames, ['banana', 'strawberry', 'blueberry', 'mango', 'peach']);
    
    if (fruit) {
      return capitalize(`${fruit} smoothie`);
    } else {
      return 'Fruit smoothie';
    }
  }
  
  if (foods.length >= 2) {
    return capitalize(`${foods[0].name} & ${foods[1].name}`);
  }
  
  return 'Custom meal';
};


function containsAny(arr: string[], terms: string[]): boolean {
  return arr.some(item => 
    terms.some(term => 
      item.toLowerCase().includes(term.toLowerCase())
    )
  );
}


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


function countMatches(arr: string[], terms: string[]): number {
  let count = 0;
  for (const term of terms) {
    if (arr.some(item => item.toLowerCase().includes(term.toLowerCase()))) {
      count++;
    }
  }
  return count;
}


function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 