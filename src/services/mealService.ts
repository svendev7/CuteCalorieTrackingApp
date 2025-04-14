import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, serverTimestamp } from 'firebase/firestore';
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
  loggedTime: string;
  date: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> => {
  try {
    const mealsRef = collection(db, 'meals');
    const newMeal = {
      ...mealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(mealsRef, newMeal);
    return {
      ...newMeal,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
    };

    await updateDoc(mealRef, updateData);
    
    // Fetch the updated meal to return
    const updatedMeal = await getMealById(mealId);
    if (!updatedMeal) {
      throw new Error('Meal not found after update');
    }
    
    return updatedMeal;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const getMealById = async (mealId: string): Promise<Meal | null> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, where('id', '==', mealId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
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
      ...doc.data(),
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
}; 