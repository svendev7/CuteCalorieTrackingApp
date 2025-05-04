import { db } from '../config/firebase.client';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  gender?: string;
  age?: number;
  currentWeight?: number;
  height?: number;
  goalWeight?: number;
  goal?: string;
  timeframe?: number;
  activityLevel?: string;
  trackingPreference?: string;
  premium?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const saveUserProfile = async (userProfile: UserProfile) => {
  try {
    const userRef = doc(db, 'users', userProfile.uid);
    const userData = {
      ...userProfile,
      updatedAt: serverTimestamp()
    };
    
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
    }
    
    return userProfile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        uid: userDoc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}; 