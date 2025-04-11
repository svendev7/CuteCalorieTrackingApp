// Screens/onboarding/WeightScreen.js (Updated)
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const WeightScreen = ({ onNext, onPrev, currentWeight, updateWeight }) => {
  const [unit, setUnit] = useState('kg'); // 'kg' or 'lb'
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (currentWeight) {
      onNext();
    }
  };

  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const toggleUnit = () => {
    if (unit === 'kg' && currentWeight) {
      // Convert kg to lb
      const weightInLb = Math.round(parseFloat(currentWeight) * 2.20462);
      updateWeight(weightInLb.toString());
      setUnit('lb');
    } else if (unit === 'lb' && currentWeight) {
      // Convert lb to kg
      const weightInKg = Math.round(parseFloat(currentWeight) / 2.20462);
      updateWeight(weightInKg.toString());
      setUnit('kg');
    } else {
      // Just toggle the unit without conversion
      setUnit(unit === 'kg' ? 'lb' : 'kg');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity style={styles.backButton} onPress={onPrev}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <FontAwesome5 name="weight" size={48} color="white" />
        </View>

        <Text style={styles.title}>What's your current weight?</Text>
        <Text style={styles.subtitle}>
          This helps us track your progress
        </Text>

        <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
          <Text style={styles.unitToggleText}>
            Switch to {unit === 'kg' ? 'pounds' : 'kilograms'}
          </Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={currentWeight}
            onChangeText={updateWeight}
            placeholder={unit === 'kg' ? "70" : "154"}
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={5}
            textAlign="center"
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, !currentWeight && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!currentWeight}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    marginBottom: 20,
  },
  unitToggle: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
  },
  unitToggleText: {
    color: '#CCC',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    width: 120,
    textAlign: 'center',
  },
  unit: {
    fontSize: 24,
    color: 'white',
    marginLeft: 10,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default WeightScreen;