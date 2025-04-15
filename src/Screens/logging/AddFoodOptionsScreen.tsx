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

const { width, height } = Dimensions.get('window');

interface AddFoodOptionsScreenProps {
  navigation: any;
}

const AddFoodOptionsScreen: React.FC<AddFoodOptionsScreenProps> = ({ navigation }) => {
  
  const handleOptionPress = (option: 'qrCode' | 'searchDatabase' | 'customFood') => {
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
        navigation.navigate('AddCustomFood');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('qrCode')}
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
        >
          <View style={styles.optionIconContainer}>
            <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.optionTitle}>Create Custom Food</Text>
          <Text style={styles.optionDescription}>Add your own food with custom macros</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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