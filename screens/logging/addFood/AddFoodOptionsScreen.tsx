import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../../../components/Header/Header';

const { width, height } = Dimensions.get('window');

interface AddFoodOptionsScreenProps {
  navigation: any;
}

const AddFoodOptionsScreen: React.FC<AddFoodOptionsScreenProps> = ({ navigation }) => {
  const handleOptionPress = (option: 'qrCode' | 'searchDatabase' | 'customFood') => {
    // Navigate immediately without animation delay
    switch (option) {
      case 'qrCode':
        console.log('Scan QR Code option pressed');
        // Will implement later
        break;
      case 'searchDatabase':
        console.log('Search Food Database option pressed');
        // Will implement later
        break;
      case 'customFood':
        // Just navigate to AddCustomFood without closing this screen
        navigation.navigate('AddCustomFood');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title="Add Food"
          onBack={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => handleOptionPress('qrCode')}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="qrcode-scan" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.optionTitle}>Scan QR Code</Text>
            <Text style={styles.optionDescription}>Quickly add food by scanning a product barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => handleOptionPress('searchDatabase')}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="magnify" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.optionTitle}>Search Food Database</Text>
            <Text style={styles.optionDescription}>Find food in our extensive database</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard} 
            onPress={() => handleOptionPress('customFood')}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.optionTitle}>Create Custom Food</Text>
            <Text style={styles.optionDescription}>Add your own food with custom macros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  optionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AddFoodOptionsScreen; 