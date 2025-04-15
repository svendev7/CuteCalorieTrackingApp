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
import AddMealLogScreen from './Screens/logging/AddMealLogScreen';
import AddCustomFoodScreen from './Screens/logging/AddCustomFoodScreen';
import CustomMealReviewScreen from './Screens/meals/CustomMealReviewScreen';
import { SavedMealsScreen } from './Screens/meals/SavedMealsScreen';
import AddFoodOptionsScreen from './Screens/logging/AddFoodOptionsScreen';

const { width, height } = Dimensions.get('window');

export default function App() {
    const [activeScreen, setActiveScreen] = useState('home');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [customBackground, setCustomBackground] = useState(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMealLogScreen, setShowAddMealLogScreen] = useState(false);
    const [showAddCustomFoodScreen, setShowAddCustomFoodScreen] = useState(false);
    const [foodToEdit, setFoodToEdit] = useState<CustomFood | null>(null);
    const [showCustomMealReviewScreen, setShowCustomMealReviewScreen] = useState(false);
    const [showSavedMealsScreen, setShowSavedMealsScreen] = useState(false);
    const [showAddFoodOptionsScreen, setShowAddFoodOptionsScreen] = useState(false);
    const [currentMealLogItems, setCurrentMealLogItems] = useState([]);
    const { user, loading: authLoading } = useAuth();
    
    const homeTranslate = useRef(new Animated.Value(0)).current;
    const settingsTranslate = useRef(new Animated.Value(width)).current;
    const addMealTranslate = useRef(new Animated.Value(width)).current;
    const rocketTranslate = useRef(new Animated.Value(width)).current;
    const statsTranslate = useRef(new Animated.Value(width)).current;

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().onboardingCompleted) {
                        setHasCompletedOnboarding(true);
                    } else {
                        setHasCompletedOnboarding(false);
                    }
                } else {
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
        const animations = [];
        animations.push(Animated.timing(homeTranslate, {
            toValue: activeScreen === 'home' ? 0 : -width,
            duration: 300, useNativeDriver: true
        }));
        animations.push(Animated.timing(settingsTranslate, {
            toValue: activeScreen === 'settings' ? 0 : width,
            duration: 300, useNativeDriver: true
        }));
        animations.push(Animated.timing(addMealTranslate, {
            toValue: activeScreen === 'addMeal' ? 0 : width,
            duration: 300, useNativeDriver: true
        }));
        animations.push(Animated.timing(rocketTranslate, {
            toValue: activeScreen === 'rocket' ? 0 : width,
            duration: 300, useNativeDriver: true
        }));
        animations.push(Animated.timing(statsTranslate, {
            toValue: activeScreen === 'stats' ? 0 : width,
            duration: 300, useNativeDriver: true
        }));

        Animated.parallel(animations).start();
    }, [activeScreen, homeTranslate, settingsTranslate, addMealTranslate, rocketTranslate, statsTranslate]);

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

    const navigateTo = (screen) => {
        setActiveScreen(screen);
        setIsFooterVisible(screen === 'home');
    };

    const handleOpenAddMealLog = () => {
        navigateTo('addMeal');
    };

    const handleOpenRocket = () => {
        navigateTo('rocket');
    };

    const handleOpenStats = () => {
        console.log("Stats button pressed - No target screen defined yet");
    };

    const handleOpenAddFoodOptions = () => {
        setFoodToEdit(null);
        setShowAddFoodOptionsScreen(true);
    };

    const handleCloseAddFoodOptions = () => {
        setShowAddFoodOptionsScreen(false);
    };

    const handleOpenAddOrEditCustomFood = (food: CustomFood | null = null) => {
        setFoodToEdit(food);
        setShowAddFoodOptionsScreen(false);
        setShowAddCustomFoodScreen(true);
    };

    const handleCloseAddCustomFood = () => {
        setShowAddCustomFoodScreen(false);
        setFoodToEdit(null);
    };

    const handleSaveOrUpdateCustomFood = (savedFood: CustomFood) => {
        console.log("Saved/Updated food:", savedFood);
        handleCloseAddCustomFood();
    };

    const handleOpenMealReview = (items) => {
        setCurrentMealLogItems(items);
        setShowCustomMealReviewScreen(true);
    };

    const handleCloseMealReview = () => {
        setShowCustomMealReviewScreen(false);
    };

    const handleSelectSavedMeal = (meal) => {
        console.log("Selected saved meal:", meal);
        setShowSavedMealsScreen(false);
    };

    if (isLoading || authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!user || !hasCompletedOnboarding) {
        return <OnboardingNavigator onComplete={completeOnboarding} />;
    }

    return (
        <View style={styles.containerWrapper}>
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.screenContainer, { transform: [{ translateX: homeTranslate }] }] }>
                    <HomeScreen 
                        onFooterVisibilityChange={setIsFooterVisible}
                        customBackground={customBackground}
                        onSettingsPress={() => navigateTo('settings')}
                    />
                </Animated.View>

                <Animated.View style={[styles.screenContainer, { transform: [{ translateX: settingsTranslate }] }] }>
                    <SettingsScreen 
                        navigate={navigateTo}
                        updateCustomBackground={updateCustomBackground}
                        customBackground={customBackground}
                    />
                </Animated.View>

                <Animated.View style={[styles.screenContainer, { transform: [{ translateX: addMealTranslate }] }] }>
                    <AddMealLogScreen 
                        navigation={{ 
                            goBack: () => navigateTo('home'), 
                            navigate: (screenName, params) => { 
                                if (screenName === 'AddFoodOptions') handleOpenAddFoodOptions(); 
                                if (screenName === 'CustomMealReview') handleOpenMealReview(params?.items || []);
                                if (screenName === 'EditCustomFood') handleOpenAddOrEditCustomFood(params?.item); 
                            }
                        }} 
                    />
                </Animated.View>

                <Animated.View style={[styles.screenContainer, { transform: [{ translateX: rocketTranslate }] }] }>
                    <FirebaseExample />
                </Animated.View>

                <Footer 
                    isVisible={isFooterVisible} 
                    onAddPress={handleOpenAddMealLog}
                    onRocketPress={handleOpenRocket}
                    onStatsPress={handleOpenStats}
                />

                {showAddFoodOptionsScreen && (
                    <AddFoodOptionsScreen
                        navigation={{
                            goBack: handleCloseAddFoodOptions,
                            navigate: (screenName) => {
                                if (screenName === 'AddCustomFood') handleOpenAddOrEditCustomFood();
                            }
                        }}
                    />
                )}

                {showAddCustomFoodScreen && (
                    <AddCustomFoodScreen 
                        navigation={{ 
                            goBack: handleCloseAddCustomFood,
                            save: handleSaveOrUpdateCustomFood 
                        }} 
                        route={{ params: { foodToEdit: foodToEdit } }}
                    />
                )}

                {showCustomMealReviewScreen && (
                    <CustomMealReviewScreen 
                        navigation={{ 
                            goBack: handleCloseMealReview, 
                            navigate: (screenName, params) => {
                                if (screenName === 'EditCustomFood') handleOpenAddOrEditCustomFood(params?.item);
                            }
                        }} 
                        route={{ params: { foods: currentMealLogItems } }} 
                    />
                )}

                {showSavedMealsScreen && (
                    <SavedMealsScreen 
                        onClose={() => setShowSavedMealsScreen(false)} 
                        onSelectMeal={handleSelectSavedMeal} 
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
    screenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
    },
});

interface CustomFood { 
  id?: string; 
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  imageUrl?: string;
  isFavorite: boolean;
}