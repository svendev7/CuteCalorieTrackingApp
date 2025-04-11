// Screens/onboarding/PremiumOfferScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const PremiumOfferScreen = ({ onComplete, onPrev, updatePremium }) => {
  const handleSubscribe = () => {
    updatePremium(true);
    onComplete();
  };

  const handleSkip = () => {
    updatePremium(false);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onPrev}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <FontAwesome5 name="gift" size={48} color="#FFD700" />
      </View>

      <View style={styles.offerCard}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>NEW USER OFFER</Text>
        </View>

        <Text style={styles.offerTitle}>Upgrade to Premium</Text>
        <Text style={styles.offerSubtitle}>
          Get personalized meal plans, advanced analytics, and more
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.discountText}>40% OFF</Text>
          <View style={styles.priceTextContainer}>
            <Text style={styles.originalPrice}>$9.99</Text>
            <Text style={styles.discountedPrice}>$5.99/month</Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.featureText}>Personalized meal plans</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.featureText}>Advanced analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.featureText}>No ads</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Maybe later</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  offerCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: '#FFD700',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  offerSubtitle: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  discountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  priceTextContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 16,
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    color: 'white',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmarkText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: 'white',
    fontSize: 16,
  },
  subscribeButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipButtonText: {
    color: '#AAA',
    fontSize: 16,
  },
});

export default PremiumOfferScreen;