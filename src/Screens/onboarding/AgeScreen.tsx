import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const AgeScreen = ({ onNext, onPrev, age, updateAge }) => {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (age) {
      onNext();
    }
  };

  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.blur();
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
          <FontAwesome5 name="calendar-alt" size={48} color="white" />
        </View>

        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>
          Your age helps us determine your metabolic rate
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={age}
            onChangeText={updateAge}
            placeholder="25"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            maxLength={3}
            textAlign="center"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, !age && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!age}
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
    marginBottom: 30,
  },
  inputContainer: {
    alignItems: 'center',
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

export default AgeScreen;