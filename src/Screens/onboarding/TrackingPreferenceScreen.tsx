// Screens/onboarding/TrackingPreferenceScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const TrackingPreferenceScreen = ({ onNext, onPrev, trackingPreference, updateTrackingPreference }) => {
  const handleSelect = (preference) => {
    updateTrackingPreference(preference);
    onNext();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onPrev}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <FontAwesome5 name="chart-bar" size={48} color="white" />
      </View>

      <Text style={styles.title}>How would you like to track?</Text>
      <Text style={styles.subtitle}>
        Choose the tracking style that works best for you
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            trackingPreference === 'daily' && styles.selectedOption,
          ]}
          onPress={() => handleSelect('daily')}
        >
          <Text
            style={[
              styles.optionTitle,
              trackingPreference === 'daily' && styles.selectedOptionText,
            ]}
          >
            Daily Tracking
          </Text>
          <Text
            style={[
              styles.optionDescription,
              trackingPreference === 'daily' && styles.selectedOptionDescription,
            ]}
          >
            Track your calories and macros on a day-to-day basis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            trackingPreference === 'weekly' && styles.selectedOption,
          ]}
          onPress={() => handleSelect('weekly')}
        >
          <Text
            style={[
              styles.optionTitle,
              trackingPreference === 'weekly' && styles.selectedOptionText,
            ]}
          >
            Weekly Tracking
          </Text>
          <Text
            style={[
              styles.optionDescription,
              trackingPreference === 'weekly' && styles.selectedOptionDescription,
            ]}
          >
            More flexible approach that focuses on weekly averages
          </Text>
        </TouchableOpacity>
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
    flex: 1,
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  selectedOption: {
    backgroundColor: 'white',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#AAA',
  },
  selectedOptionText: {
    color: 'black',
  },
  selectedOptionDescription: {
    color: '#333',
  },
});

export default TrackingPreferenceScreen;