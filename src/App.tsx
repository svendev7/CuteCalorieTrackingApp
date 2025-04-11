// App.js (modified)
import React, { useState, useRef, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HomeScreen } from './Screens/home/HomeScreen';
import { SettingsScreen } from './Screens/settings/SettingsScreen';
import Footer from './components/footer/Footer';
import OnboardingNavigator from './Screens/onboarding/OnboardingNavigator'; // New import

const { width, height } = Dimensions.get('window');

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [customBackground, setCustomBackground] = useState(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    
    // Animation values
    const homeTranslate = useRef(new Animated.Value(0)).current;
    const settingsTranslate = useRef(new Animated.Value(width)).current;

    // Check if user has completed onboarding
    useEffect(() => {
        // You would typically check AsyncStorage here
        // AsyncStorage.getItem('hasCompletedOnboarding').then(value => {
        //     if (value === 'true') {
        //         setHasCompletedOnboarding(true);
        //     }
        // });
    }, []);

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
            ]).start();
        }
    }, [activeTab]);

    const updateCustomBackground = (uri) => {
        setCustomBackground(uri);
    };

    const completeOnboarding = () => {
        // Save that onboarding is complete
        // AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        setHasCompletedOnboarding(true);
    };

    // Show onboarding if not completed
    if (!hasCompletedOnboarding) {
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

                {activeTab === 'home' && (
                    <Footer isVisible={isFooterVisible} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
        backgroundColor: '#534741',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.4,
    },
    contentContainer: {
        flex: 1,
    },
});