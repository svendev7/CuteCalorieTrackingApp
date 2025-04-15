// App.js (modified)
import React, { useState, useRef, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, Animated, Text, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HomeScreen } from './Screens/home/HomeScreen';
import { SettingsScreen } from './Screens/settings/SettingsScreen';
import Footer from './components/footer/Footer';
import OnboardingNavigator from './Screens/onboarding/OnboardingNavigator';
import FirebaseExample from './components/FirebaseExample';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './hooks/useAuth';
import { db } from './config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CustomMealScreen } from './Screens/meals/CustomMealScreen';
import { SavedMealsScreen } from './Screens/meals/SavedMealsScreen';
import { MealEditScreen } from './Screens/meals/MealEditScreen';

const { width, height } = Dimensions.get('window');

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [customBackground, setCustomBackground] = useState(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCustomMealScreen, setShowCustomMealScreen] = useState(false);
    const [showSavedMealsScreen, setShowSavedMealsScreen] = useState(false);
    const [showMealEditScreen, setShowMealEditScreen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const { user, loading: authLoading } = useAuth();
    
    // Animation values
    const homeTranslate = useRef(new Animated.Value(0)).current;
    const settingsTranslate = useRef(new Animated.Value(width)).current;
    const firebaseTranslate = useRef(new Animated.Value(width)).current;

    // Check if user has completed onboarding
    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                if (user) {
                    // Check Firestore first
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().onboardingCompleted) {
                        setHasCompletedOnboarding(true);
                    } else {
                        setHasCompletedOnboarding(false);
                    }
                } else {
                    // If no user, they need to log in
                    setHasCompletedOnboarding(false);
                }
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                setHasCompletedOnboarding(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (!authLoading) {
            checkOnboardingStatus();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (activeTab === 'settings') {
            Animated.parallel([
                Animated.timing(homeTranslate, {
                    toValue: -width,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(settingsTranslate, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(firebaseTranslate, {
                    toValue: width,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (activeTab === 'firebase') {
            Animated.parallel([
                Animated.timing(homeTranslate, {
                    toValue: -width,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(settingsTranslate, {
                    toValue: width,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(firebaseTranslate, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(homeTranslate, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(settingsTranslate, {
                    toValue: width,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(firebaseTranslate, {
                    toValue: width,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [activeTab]);

    const updateCustomBackground = (uri) => {
        setCustomBackground(uri);
    };

    const completeOnboarding = async () => {
        try {
            if (!user) {
                throw new Error('User must be logged in to complete onboarding');
            }

            // Save to Firestore
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                onboardingCompleted: true,
                onboardingCompletedAt: new Date()
            }, { merge: true });
            
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            Alert.alert(
                'Error',
                'Failed to save your preferences. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    // Handler functions for the screens opened from the footer
    const handleOpenCustomMeal = () => {
        setShowCustomMealScreen(true);
    };

    const handleOpenSavedMeals = () => {
        setShowSavedMealsScreen(true);
    };

    const handleSaveCustomMeal = (mealName, foods) => {
        console.log("Saving custom meal:", mealName, foods);
        setShowCustomMealScreen(false);
    };

    const handleSelectSavedMeal = (meal) => {
        console.log("Selected saved meal:", meal);
        setShowSavedMealsScreen(false);
    };

    const handleEditMeal = (meal) => {
        setSelectedMeal(meal);
        setShowMealEditScreen(true);
    };

    const handleSaveMealEdit = (updatedMeal) => {
        // Handle saving the updated meal
        console.log("Saving updated meal:", updatedMeal);
        setShowMealEditScreen(false);
    };

    // Show loading screen while checking auth and onboarding status
    if (isLoading || authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Show onboarding if not authenticated or not completed onboarding
    if (!user || !hasCompletedOnboarding) {
        return <OnboardingNavigator onComplete={completeOnboarding} />;
    }

    return (
        <View style={styles.containerWrapper}>
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <Animated.View 
                    style={{ 
                        flex: 1,
                        transform: [{ translateX: homeTranslate }]
                    }}
                >
                    <HomeScreen 
                        onFooterVisibilityChange={setIsFooterVisible}
                        customBackground={customBackground}
                        onSettingsPress={() => setActiveTab('settings')}
                    />
                </Animated.View>

                <Animated.View 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        transform: [{ translateX: settingsTranslate }]
                    }}
                >
                    <SettingsScreen 
                        navigate={(tab) => setActiveTab(tab)}
                        updateCustomBackground={updateCustomBackground}
                        customBackground={customBackground}
                    />
                </Animated.View>

                <Animated.View 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        transform: [{ translateX: firebaseTranslate }]
                    }}
                >
                    <FirebaseExample />
                </Animated.View>

                {activeTab === 'home' && (
                    <Footer 
                        isVisible={isFooterVisible} 
                        onOpenCustomMeal={handleOpenCustomMeal}
                        onOpenSavedMeals={handleOpenSavedMeals}
                    />
                )}

                {/* Custom Meal Screen */}
                {showCustomMealScreen && (
                    <CustomMealScreen 
                        onClose={() => setShowCustomMealScreen(false)} 
                        onSave={handleSaveCustomMeal} 
                    />
                )}

                {/* Saved Meals Screen */}
                {showSavedMealsScreen && (
                    <SavedMealsScreen 
                        onClose={() => setShowSavedMealsScreen(false)} 
                        onSelectMeal={handleSelectSavedMeal} 
                    />
                )}

                {/* Meal Edit Screen */}
                {showMealEditScreen && selectedMeal && (
                    <MealEditScreen 
                        meal={selectedMeal}
                        onClose={() => setShowMealEditScreen(false)}
                        onSave={handleSaveMealEdit}
                        visible={showMealEditScreen}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 10,
    },
});