import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const GenderScreen = ({ onNext, onPrev, gender, updateGender }) => {
  const genderOptions = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'non-binary', label: 'Non-binary' },
    { id: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onPrev}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <FontAwesome5 name="user" size={48} color="white" />
      </View>

      <Text style={styles.title}>What's your gender?</Text>
      <Text style={styles.subtitle}>
        This helps us calculate your calorie needs more accurately
      </Text>

      <View style={styles.optionsContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              gender === option.id && styles.selectedOption,
            ]}
            onPress={() => {
              updateGender(option.id);
              onNext();
            }}
          >
            <Text
              style={[
                styles.optionText,
                gender === option.id && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: 'white',
  },
  optionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default GenderScreen;