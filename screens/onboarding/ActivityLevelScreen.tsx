// Screens/onboarding/ActivityLevelScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const ActivityLevelScreen = ({ onNext, onPrev, activityLevel, updateActivityLevel }) => {
  const activityLevels = [
    { 
      id: 'sedentary', 
      label: 'Sedentary', 
      description: 'Little to no exercise' 
    },
    { 
      id: 'light', 
      label: 'Lightly Active', 
      description: 'Light exercise 1-3 days/week' 
    },
    { 
      id: 'moderate', 
      label: 'Moderately Active', 
      description: 'Moderate exercise 3-5 days/week' 
    },
    { 
      id: 'active', 
      label: 'Very Active', 
      description: 'Hard exercise 6-7 days/week' 
    },
    { 
      id: 'extreme', 
      label: 'Extremely Active', 
      description: 'Very hard exercise & physical job' 
    },
  ];

  const handleSelect = (id) => {
    updateActivityLevel(id);
    onNext();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onPrev}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <FontAwesome5 name="bolt" size={48} color="white" />
      </View>

      <Text style={styles.title}>How active are you?</Text>
      <Text style={styles.subtitle}>
        This helps us calculate your daily calorie needs
      </Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.optionButton,
              activityLevel === level.id && styles.selectedOption,
            ]}
            onPress={() => handleSelect(level.id)}
          >
            <Text
              style={[
                styles.optionTitle,
                activityLevel === level.id && styles.selectedOptionText,
              ]}
            >
              {level.label}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                activityLevel === level.id && styles.selectedOptionDescription,
              ]}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: 'white',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#AAA',
  },
  selectedOptionText: {
    color: 'black',
  },
  selectedOptionDescription: {
    color: '#333',
  },
});

export default ActivityLevelScreen;