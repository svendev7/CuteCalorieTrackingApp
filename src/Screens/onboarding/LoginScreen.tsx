import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ onNext, onPrev, formData, updateFormData }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleSubmit = () => {
    // Here you would handle Firebase authentication
    // For now, just proceed to the next step
    onNext();
  };

  const handleContainerPress = () => {
    if (emailInputRef.current) {
      emailInputRef.current.blur();
    }
    if (passwordInputRef.current) {
      passwordInputRef.current.blur();
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

        <Text style={styles.title}>{isLogin ? 'Log In' : 'Create Account'}</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>  
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#AAA',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;