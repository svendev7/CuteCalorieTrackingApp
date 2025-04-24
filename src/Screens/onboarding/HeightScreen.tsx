import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HeightScreen = ({ onNext, onPrev, height, updateHeight }) => {
  const [heightValue, setHeightValue] = useState(height || '');
  const [activeUnit, setActiveUnit] = useState('cm'); 
  const [feet, setFeet] = useState(height ? Math.floor(parseInt(height) / 30.48).toString() : '');
  const [inches, setInches] = useState(height ? Math.round(parseInt(height) / 2.54 % 12).toString() : '');

  const heightInputRef = useRef<TextInput>(null);
  const feetInputRef = useRef<TextInput>(null);
  const inchesInputRef = useRef<TextInput>(null);

  const handleContinue = () => {
    if (activeUnit === 'cm' && heightValue) {
      updateHeight(heightValue);
      onNext();
    } else if (activeUnit === 'ft' && feet && inches) {
      const totalInches = (parseInt(feet) * 12) + parseInt(inches);
      const heightInCm = Math.round(totalInches * 2.54).toString();
      updateHeight(heightInCm);
      onNext();
    }
  };

  const handleUnitChange = (unit) => {
    if (unit === activeUnit) return;
    
    setActiveUnit(unit);
    
    if (unit === 'cm' && feet && inches) {
      const totalInches = (parseInt(feet) * 12) + parseInt(inches);
      setHeightValue(Math.round(totalInches * 2.54).toString());
    } else if (unit === 'ft' && heightValue) {
      const totalInches = parseInt(heightValue) / 2.54;
      setFeet(Math.floor(totalInches / 12).toString());
      setInches(Math.round(totalInches % 12).toString());
    }
  };

  const handleContainerPress = () => {
    if (heightInputRef.current) {
      heightInputRef.current.blur();
    }
    if (feetInputRef.current) {
      feetInputRef.current.blur();
    }
    if (inchesInputRef.current) {
      inchesInputRef.current.blur();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onPrev}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Height</Text>
        </View>

        <Text style={styles.subtitle}>
          Let's understand your body metrics better
        </Text>

        <View style={styles.unitToggleContainer}>
          <TouchableOpacity 
            style={[
              styles.unitButton, 
              activeUnit === 'cm' && styles.activeUnitButton
            ]}
            onPress={() => handleUnitChange('cm')}
          >
            <Text style={[
              styles.unitButtonText,
              activeUnit === 'cm' && styles.activeUnitButtonText
            ]}>Centimeters</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.unitButton, 
              activeUnit === 'ft' && styles.activeUnitButton
            ]}
            onPress={() => handleUnitChange('ft')}
          >
            <Text style={[
              styles.unitButtonText,
              activeUnit === 'ft' && styles.activeUnitButtonText
            ]}>Feet & Inches</Text>
          </TouchableOpacity>
        </View>

        {activeUnit === 'cm' ? (
          <View style={styles.inputContainer}>
            <TextInput
              ref={heightInputRef}
              style={styles.input}
              value={heightValue}
              onChangeText={setHeightValue}
              placeholder="Enter height"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>cm</Text>
          </View>
        ) : (
          <View style={styles.ftInchContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                ref={feetInputRef}
                style={styles.input}
                value={feet}
                onChangeText={setFeet}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>ft</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inchesInputRef}
                style={styles.input}
                value={inches}
                onChangeText={setInches}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>in</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!heightValue && activeUnit === 'cm') || 
              (!feet && activeUnit === 'ft') || 
              (!inches && activeUnit === 'ft') 
                ? styles.disabledButton : {}
            ]}
            onPress={handleContinue}
            disabled={
              (!heightValue && activeUnit === 'cm') || 
              (!feet && activeUnit === 'ft') || 
              (!inches && activeUnit === 'ft')
            }
          >
            <Text style={styles.continueButtonText}>
              Continue
            </Text>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 30,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#111',
  },
  activeUnitButton: {
    backgroundColor: '#333',
  },
  unitButtonText: {
    color: '#AAA',
    fontSize: 16,
  },
  activeUnitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
    paddingBottom: 10,
  },
  ftInchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 24,
    paddingVertical: 10,
  },
  unitLabel: {
    color: '#AAA',
    fontSize: 18,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 5,
  },
});

export default HeightScreen;