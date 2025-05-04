// filepath: d:\VSC Projects\CuteCalorieTrackingApp\src\Screens\onboarding\OnboardingNavigator.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import GenderScreen from './GenderScreen';
import AgeScreen from './AgeScreen';
import WeightScreen from './WeightScreen';
import HeightScreen from './HeightScreen';
import GoalWeightScreen from './GoalWeightScreen';
import ActivityLevelScreen from './ActivityLevelScreen';
import CalculatingPlanScreen from './CalculatingPlanScreen';
import TrackingPreferenceScreen from './TrackingPreferenceScreen'; 
import PremiumOfferScreen from './PremiumOfferScreen';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase.client';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Define an interface for better type safety with TypeScript
interface FormDataState {
  email: string;
  password: string;
  gender: string; // Consider using 'male' | 'female' | 'other' | ''
  age: string; // Consider using number | ''
  currentWeight: string; // Consider using number | ''
  height: string; // Consider using number | ''
  goalWeight: string; // Consider using number | ''
  goal?: string; // Add 'goal' field if your calculation needs it ('lose_weight', 'maintain', 'gain_weight')
  timeframe: string; // Consider using number | ''
  activityLevel: string; // Consider specific activity level strings | ''
  trackingPreference: string; // Consider specific preference strings | ''
  premium: boolean;
}


const OnboardingNavigator = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormDataState>({
    email: '',
    password: '',
    gender: '',
    age: '',
    currentWeight: '',
    height: '',
    goalWeight: '',
    goal: '', 
    timeframe: '12',
    activityLevel: '',
    trackingPreference: '',
    premium: false,
  });

  const updateFormData = (key: keyof FormDataState, value: any) => {
    if (key === 'goalWeight' && formData.currentWeight) {
        const currentW = parseFloat(formData.currentWeight);
        const goalW = parseFloat(value);
        let goalType = 'maintain';
        if (!isNaN(currentW) && !isNaN(goalW)) {
            if (goalW < currentW) goalType = 'lose_weight';
            else if (goalW > currentW) goalType = 'gain_weight';
        }
         setFormData(prev => ({ ...prev, [key]: value, goal: goalType }));
    } else {
        setFormData(prev => ({ ...prev, [key]: value }));
    }
  };


  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Form submitted:', formData);
    
    try {
      if (!user) {
        throw new Error('User must be logged in to save preferences');
      }

      const currentWeight = parseFloat(formData.currentWeight) || 0;
      const height = parseFloat(formData.height) || 0;
      const heightInMeters = height / 100;
      const bmi = currentWeight / (heightInMeters * heightInMeters);
      
      let bmr = 0;
      if (formData.gender === 'male') {
        bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * parseFloat(formData.age));
      } else {
        bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * parseFloat(formData.age));
      }

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.2);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: formData.email,
        gender: formData.gender,
        age: parseInt(formData.age) || 0,
        currentWeight: currentWeight,
        height: height,
        bmi: bmi,
        goalWeight: parseFloat(formData.goalWeight) || 0,
        
        goal: formData.goal,
        timeframe: parseInt(formData.timeframe) || 12,
        activityLevel: formData.activityLevel,
        trackingPreference: formData.trackingPreference,
        
        bmr: bmr,
        tdee: tdee,
        dailyCalorieGoal: formData.goal === 'lose_weight' ? tdee - 500 : 
                         formData.goal === 'gain_weight' ? tdee + 500 : tdee,
        
        premium: formData.premium,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }, { merge: true });
      
      console.log('User preferences saved to Firestore successfully');
      
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      onComplete();
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert(
        'Error',
        'Failed to save your preferences. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    <LoginScreen
      key="login"
      onNext={nextStep}
      onPrev={prevStep}
      formData={formData}
      updateFormData={updateFormData}
    />,
    <GenderScreen
      key="gender"
      onNext={nextStep}
      onPrev={prevStep}
      gender={formData.gender}
      updateGender={(value) => updateFormData('gender', value)}
    />,
    <AgeScreen
      key="age"
      onNext={nextStep}
      onPrev={prevStep}
      age={formData.age}
      updateAge={(value) => updateFormData('age', value)}
    />,
     <HeightScreen
      key="height"
      onNext={nextStep}
      onPrev={prevStep}
      height={formData.height}
      updateHeight={(value) => updateFormData('height', value)}
    />,
    <WeightScreen
      key="weight"
      onNext={nextStep}
      onPrev={prevStep}
      currentWeight={formData.currentWeight}
      updateWeight={(value) => updateFormData('currentWeight', value)}
    />,
    <GoalWeightScreen
      key="goalWeight"
      onNext={nextStep}
      onPrev={prevStep}
      goalWeight={formData.goalWeight}
      timeframe={formData.timeframe}
      updateGoalWeight={(value) => updateFormData('goalWeight', value)}
      updateTimeframe={(value) => updateFormData('timeframe', value)}
    />,
    <ActivityLevelScreen
      key="activity"
      onNext={nextStep}
      onPrev={prevStep}
      activityLevel={formData.activityLevel}
      updateActivityLevel={(value) => updateFormData('activityLevel', value)}
    />,
    <CalculatingPlanScreen
       key="calculating"
       userData={formData}
       onComplete={nextStep}
       onPrev={prevStep}
    />,
    <PremiumOfferScreen
      key="premium"
      onComplete={handleSubmit}
      onPrev={prevStep}
      updatePremium={(value) => updateFormData('premium', value)}
    />,

    /*
    // 10: Tracking Preference Screen (Optional - place it where it makes sense)
    // If you want it *after* the premium offer:
    <TrackingPreferenceScreen
      key="tracking"
      onNext={handleSubmit} // Now this might be the final step
      onPrev={prevStep} // Back to Premium Offer
      trackingPreference={formData.trackingPreference}
      updateTrackingPreference={(value) => updateFormData('trackingPreference', value)}
     />
    // If you kept it before Premium, adjust 'onNext'/'onComplete' accordingly above
    */
  ];

  return (
    <View style={styles.container}>
      {currentStep > 0 && currentStep < screens.length && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressForeground,
                { width: `${(currentStep / (screens.length - 1)) * 100}%` }
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.screenContainer}>
        {screens[currentStep]}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 50, 
    paddingBottom: 10, 
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#333', 
    borderRadius: 2,
    overflow: 'hidden', 
  },
  progressForeground: {
    height: '100%', 
    backgroundColor: '#FFF', 
    borderRadius: 2,
  },
  screenContainer: {
    flex: 1, 
  },
});

export default OnboardingNavigator;