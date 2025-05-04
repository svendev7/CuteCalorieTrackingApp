import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PebblyPal } from '../../components/Pebbly/PebblyPal';

const WelcomeScreen = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.characterContainer}>
            <PebblyPal/>
        </View>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile to help you reach your nutrition goals
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    width: 160,
    height: 160,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#CCC',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default WelcomeScreen;