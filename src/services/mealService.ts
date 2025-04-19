import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  serverTimestamp, 
  deleteDoc,
  orderBy,
  limit,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Meal {
  id: string;
  userId: string;
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  loggedTime?: string;
  date?: string;
  imageUrl?: string;
  foods?: FoodItem[];
  isFavorite?: boolean;
  isCustom?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastUsed?: Timestamp;
}

export interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sodium?: number;
  sugar?: number;
  fibers?: number;
  amount: number;
  unit: string;
}

export const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> => {
  try {
    const mealsRef = collection(db, 'meals');
    const newMeal = {
      ...mealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
      isCustom: mealData.isCustom !== undefined ? mealData.isCustom : false,
      isFavorite: mealData.isFavorite !== undefined ? mealData.isFavorite : false
    };

    const docRef = await addDoc(mealsRef, newMeal);
    return {
      ...newMeal,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastUsed: Timestamp.now()
    } as Meal;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

export const updateMeal = async (mealId: string, mealData: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meal> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    const updateData = {
      ...mealData,
      updatedAt: serverTimestamp(),
      lastUsed: serverTimestamp()
    };

    await updateDoc(mealRef, updateData);
    
    // Fetch the updated meal to return
    const mealSnapshot = await getDoc(mealRef);
    if (!mealSnapshot.exists()) {
      throw new Error('Meal not found after update');
    }
    
    return {
      id: mealId,
      ...mealSnapshot.data()
    } as Meal;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const getMealById = async (mealId: string): Promise<Meal | null> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    const mealSnapshot = await getDoc(mealRef);
    
    if (!mealSnapshot.exists()) {
      return null;
    }

    return {
      id: mealId,
      ...mealSnapshot.data()
    } as Meal;
  } catch (error) {
    console.error('Error getting meal:', error);
    throw error;
  }
};

export const getMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await deleteDoc(mealRef);
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

export const getSavedMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('isCustom', '==', true),
      orderBy('lastUsed', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting saved meals:', error);
    throw error;
  }
};

export const getFavoriteMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('isFavorite', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting favorite meals:', error);
    throw error;
  }
};

export const getRecentMealsByUserId = async (userId: string, limitCount: number = 10): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      orderBy('lastUsed', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting recent meals:', error);
    throw error;
  }
};

export const getMealsByDateRange = async (userId: string, startDate: string, endDate: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('loggedTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals by date range:', error);
    throw error;
  }
};

export const getMealsByDate = async (userId: string, date: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('date', '==', date),
      where('isCustom', '==', false),
      orderBy('loggedTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals by date:', error);
    throw error;
  }
};

export const toggleMealFavorite = async (mealId: string, isFavorite: boolean): Promise<void> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await updateDoc(mealRef, {
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling meal favorite status:', error);
    throw error;
  }
}; 