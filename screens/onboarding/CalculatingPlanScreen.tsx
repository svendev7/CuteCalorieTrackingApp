// Screens/onboarding/CalculatingPlanScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you might want a back button

// --- Placeholder Calculation Logic ---
// Replace this with your actual, more accurate calculation based on formulas like Mifflin-St Jeor or Harris-Benedict
// Factors typically needed: gender, age, height, weight, activity level, goal (lose, maintain, gain)
const calculatePlan = (userData) => {
    // VERY SIMPLISTIC EXAMPLE - REPLACE THIS
    const { weight, height, activityLevel, goalWeight, goal /* add gender, age */ } = userData;
    let baseCalories = 2000; // Placeholder base

    // Rudimentary adjustment based on activity (Needs proper multipliers)
    switch (activityLevel) {
        case 'sedentary': baseCalories *= 1.2; break;
        case 'light': baseCalories *= 1.375; break;
        case 'moderate': baseCalories *= 1.55; break;
        case 'active': baseCalories *= 1.725; break;
        case 'very_active': baseCalories *= 1.9; break;
        default: baseCalories *= 1.4; // Default guess
    }

    let targetCalories = baseCalories;

    // Rudimentary adjustment for goal (Needs proper deficit/surplus calculation)
    if (goal === 'lose_weight' && weight > goalWeight) {
        targetCalories -= 500; // Typical deficit for ~1lb/week loss
    } else if (goal === 'gain_weight' && weight < goalWeight) {
        targetCalories += 300; // Typical surplus for lean gain
    }
    // Ensure calories don't go below a safe minimum (e.g., 1200)
    targetCalories = Math.max(1200, Math.round(targetCalories));

    return {
        dailyCalories: targetCalories,
        weeklyCalories: targetCalories * 7,
        // You'd calculate macros here too based on targetCalories and ratios (e.g., 40% Carb, 30% Protein, 30% Fat)
        macros: {
            protein: Math.round((targetCalories * 0.30) / 4), // 4 calories per gram of protein
            carbs: Math.round((targetCalories * 0.40) / 4),   // 4 calories per gram of carbs
            fat: Math.round((targetCalories * 0.30) / 9)      // 9 calories per gram of fat
        }
    };
};
// --- End Placeholder Calculation Logic ---


const CalculatingPlanScreen = ({ userData, onComplete, onPrev }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('Initializing...');
    const [isLoading, setIsLoading] = useState(true);
    const [calculatedPlan, setCalculatedPlan] = useState(null);

    useEffect(() => {
        const steps = [
            { prog: 10, msg: 'Analyzing inputs...' },
            { prog: 30, msg: 'Calculating Base Metabolic Rate (BMR)...' },
            { prog: 50, msg: 'Estimating Total Daily Energy Expenditure (TDEE)...' },
            { prog: 75, msg: 'Calculating target calories...' },
            { prog: 90, msg: 'Calculating macronutrients...' },
            { prog: 100, msg: 'Finalizing your personalized plan!' },
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setProgress(steps[currentStep].prog);
                setMessage(steps[currentStep].msg);
                currentStep++;
            } else {
                clearInterval(interval);
                // Perform the actual calculation after the simulation
                const plan = calculatePlan(userData);
                setCalculatedPlan(plan);
                setIsLoading(false); // Calculation "done", ready to show results
            }
        }, 800); // Adjust timing as needed

        return () => clearInterval(interval); // Cleanup on unmount
    }, [userData]); // Rerun effect if userData changes (though likely stable here)

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onPrev}>
                <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.progressText}>{progress}%</Text>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            ) : (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Your Personalized Plan</Text>
                    <View style={styles.planBox}>
                        <Text style={styles.planHeading}>Estimated Daily Goal:</Text>
                        <Text style={styles.planValue}>{calculatedPlan?.dailyCalories} Calories</Text>

                        <Text style={styles.planHeading}>Macronutrient Split (Approx):</Text>
                        <Text style={styles.planDetail}>Protein: {calculatedPlan?.macros?.protein}g</Text>
                        <Text style={styles.planDetail}>Carbs: {calculatedPlan?.macros?.carbs}g</Text>
                        <Text style={styles.planDetail}>Fat: {calculatedPlan?.macros?.fat}g</Text>

                         <Text style={styles.planHeading}>Estimated Weekly Goal:</Text>
                        <Text style={styles.planValue}>{calculatedPlan?.weeklyCalories} Calories</Text>
                    </View>

                    <Text style={styles.disclaimer}>
                        *Disclaimer: These calculations are estimates based on standard formulas and the information you provided. Actual needs may vary based on individual metabolism, specific health conditions, and other factors. Consult with a healthcare professional or registered dietitian for personalized advice.
                    </Text>

                    <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000', // Assuming a dark theme like PremiumOfferScreen
        justifyContent: 'center', // Center content vertically
    },
    backButton: {
        position: 'absolute',
        top: 50, // Adjust as needed for status bar height
        left: 20,
        zIndex: 1, // Ensure it's above other elements if needed
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
    },
    messageText: {
        fontSize: 18,
        color: '#CCC',
        textAlign: 'center',
    },
    resultsContainer: {
        alignItems: 'center',
    },
    resultsTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 25,
        textAlign: 'center',
    },
    planBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center', // Center text within the box
    },
    planHeading: {
        fontSize: 16,
        color: '#AAA',
        marginBottom: 5,
        marginTop: 10,
    },
    planValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
    },
    planDetail: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
    },
    disclaimer: {
        fontSize: 12,
        color: '#AAA',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 30,
        paddingHorizontal: 10, // Add some horizontal padding
    },
    continueButton: {
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 40,
        alignItems: 'center',
        width: '80%', // Make button reasonably wide
        alignSelf: 'center',
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
});

export default CalculatingPlanScreen;