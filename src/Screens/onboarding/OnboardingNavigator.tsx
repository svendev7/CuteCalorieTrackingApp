// filepath: d:\VSC Projects\CuteCalorieTrackingApp\src\Screens\onboarding\OnboardingNavigator.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import GenderScreen from './GenderScreen';
import AgeScreen from './AgeScreen';
import WeightScreen from './WeightScreen';
import HeightScreen from './HeightScreen';
import GoalWeightScreen from './GoalWeightScreen';
import ActivityLevelScreen from './ActivityLevelScreen';
// Import the new screen (assuming it's in the same directory)
// If CalculatingPlanScreen is JS, this import might show a TS warning, but often works.
// Consider renaming to .tsx and adding basic types if needed.
import CalculatingPlanScreen from './CalculatingPlanScreen';
import TrackingPreferenceScreen from './TrackingPreferenceScreen'; // Keep this import if you still need it, otherwise remove
import PremiumOfferScreen from './PremiumOfferScreen';

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
  // Use the interface for the state
  const [formData, setFormData] = useState<FormDataState>({
    email: '',
    password: '',
    gender: '',
    age: '',
    currentWeight: '',
    height: '',
    goalWeight: '',
    goal: '', // Initialize the goal field if needed by calculation
    timeframe: '12',
    activityLevel: '',
    trackingPreference: '',
    premium: false,
  });

  // Add type annotation for key
  const updateFormData = (key: keyof FormDataState, value: any) => {
    // Basic goal setting based on weight change - refine as needed
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
    // Prevent going back before the first screen
    if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add logic here to save data (e.g., to Firebase, AsyncStorage)
    onComplete(); // Signal that onboarding is finished
  };

  // Define the sequence of screens
  const screens = [
    // 0: Welcome
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    // 1: Login (Optional, depends on your flow)
    <LoginScreen
      key="login"
      onNext={nextStep}
      onPrev={prevStep}
      formData={formData}
      updateFormData={updateFormData}
    />,
    // 2: Gender
    <GenderScreen
      key="gender"
      onNext={nextStep}
      onPrev={prevStep}
      gender={formData.gender}
      updateGender={(value) => updateFormData('gender', value)}
    />,
    // 3: Age
    <AgeScreen
      key="age"
      onNext={nextStep}
      onPrev={prevStep}
      age={formData.age}
      updateAge={(value) => updateFormData('age', value)}
    />,
    // 4: Height
     <HeightScreen
      key="height"
      onNext={nextStep}
      onPrev={prevStep}
      height={formData.height}
      updateHeight={(value) => updateFormData('height', value)}
    />,
    // 5: Current Weight
    <WeightScreen
      key="weight"
      onNext={nextStep}
      onPrev={prevStep}
      currentWeight={formData.currentWeight}
      updateWeight={(value) => updateFormData('currentWeight', value)}
    />,
    // 6: Goal Weight
    <GoalWeightScreen
      key="goalWeight"
      onNext={nextStep}
      onPrev={prevStep}
      goalWeight={formData.goalWeight}
      timeframe={formData.timeframe} // You might remove timeframe if not used in calculation logic directly
      updateGoalWeight={(value) => updateFormData('goalWeight', value)}
      updateTimeframe={(value) => updateFormData('timeframe', value)} // Keep if needed elsewhere
    />,
    // 7: Activity Level
    <ActivityLevelScreen
      key="activity"
      onNext={nextStep} // This now goes to CalculatingPlanScreen
      onPrev={prevStep}
      activityLevel={formData.activityLevel}
      updateActivityLevel={(value) => updateFormData('activityLevel', value)}
    />,
    // 8: Calculating Plan Screen << NEW SCREEN INSERTED HERE
    <CalculatingPlanScreen
       key="calculating"
       // Pass the necessary user data for calculation
       userData={formData}
       // When calculation display is done, move to Premium Offer
       onComplete={nextStep}
       // Go back to Activity Level screen
       onPrev={prevStep}
    />,
    // 9: Premium Offer Screen
    <PremiumOfferScreen
      key="premium"
      // Pass the form data as the calculated plan
      // When user decides on premium (or skips), call final submit
      onComplete={handleSubmit}
      // Go back to Calculating Plan screen
      onPrev={prevStep}
      // Update the premium status in form data
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
      {/* Progress indicator - should update automatically */}
      {currentStep > 0 && currentStep < screens.length && ( // Hide on Welcome and potentially after last step if needed
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressForeground,
                 // Adjust progress calculation if Welcome screen (index 0) shouldn't count
                { width: `${(currentStep / (screens.length - 1)) * 100}%` }
              ]}
            />
          </View>
        </View>
      )}

      {/* Current screen */}
      <View style={styles.screenContainer}>
        {/* Render the screen based on the current step index */}
        {screens[currentStep]}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Or your app's background color
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 50, // Adjust for status bar height if necessary
    paddingBottom: 10, // Add some space below the bar
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#333', // Dark background for the progress bar
    borderRadius: 2,
    overflow: 'hidden', // Ensure foreground stays within bounds
  },
  progressForeground: {
    height: '100%', // Use full height of the background
    backgroundColor: '#FFF', // Active progress color
    borderRadius: 2,
  },
  screenContainer: {
    flex: 1, // Ensure the screen content takes up the remaining space
  },
});

export default OnboardingNavigator;