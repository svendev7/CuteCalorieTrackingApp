import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: width * 0.05,
    paddingTop: height * 0.1,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.07,
    left: width * 0.025,
    zIndex: 10,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: width * 0.01,
    fontSize: width * 0.045,
  },
  scrollView: {
    flex: 1,
  },
  settingsContainer: {
    padding: width * 0.05,
  },
  sectionHeader: {
    marginTop: height * 0.025,
    marginBottom: height * 0.0125,
  },
  sectionHeaderText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingItemLeft: {
    marginRight: width * 0.04,
  },
  settingItemRight: {
    flex: 1,
  },
  settingItemControl: {
    marginLeft: width * 0.025,
  },
  settingItemTitle: {
    fontSize: width * 0.04,
    color: '#FFFFFF',
  },
  settingItemDescription: {
    fontSize: width * 0.035,
    color: '#9E9E9E',
    marginTop: height * 0.005,
  },
  premiumBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginBottom: height * 0.025,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  premiumBannerText: {
    fontSize: width * 0.035,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  backgroundButtons: {
    flexDirection: 'row',
  },
  buttonSmall: {
    backgroundColor: '#FF9500',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: width * 0.02,
    marginRight: width * 0.02,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonDangerText: {
    color: '#FF3B30',
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
});