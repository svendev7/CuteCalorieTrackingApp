import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const GoalWeightScreen = ({ onNext, onPrev, goalWeight, timeframe, updateGoalWeight, updateTimeframe }) => {
  const [unit, setUnit] = useState('kg'); 
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (goalWeight) {
      onNext();
    }
  };

  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const toggleUnit = () => {
    if (unit === 'kg' && goalWeight) {
      const weightInLb = Math.round(parseFloat(goalWeight) * 2.20462);
      updateGoalWeight(weightInLb.toString());
      setUnit('lb');
    } else if (unit === 'lb' && goalWeight) {
      const weightInKg = Math.round(parseFloat(goalWeight) / 2.20462);
      updateGoalWeight(weightInKg.toString());
      setUnit('kg');
    } else {
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
          <FontAwesome5 name="heart" size={48} color="white" />
        </View>

        <Text style={styles.title}>What's your goal weight?</Text>
        <Text style={styles.subtitle}>
          We'll help you get there at a healthy pace
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
            value={goalWeight}
            onChangeText={updateGoalWeight}
            placeholder={unit === 'kg' ? "65" : "143"}
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={5}
            textAlign="center"
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Timeframe to reach goal</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={timeframe}
              onValueChange={updateTimeframe}
              style={styles.picker}
              dropdownIconColor="white"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="8 weeks (aggressive)" value="8" />
              <Picker.Item label="12 weeks (recommended)" value="12" />
              <Picker.Item label="16 weeks (gradual)" value="16" />
              <Picker.Item label="24 weeks (very gradual)" value="24" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, !goalWeight && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!goalWeight}
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
    marginBottom: 30,
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
  pickerContainer: {
    marginBottom: 30,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: 'white',
    backgroundColor: '#1A1A1A',
  },
  pickerItem: {
    color: 'white',
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

export default GoalWeightScreen;