import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.1,
  },
  topLeft: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.05,
    zIndex: 1,
    flexDirection: 'column', 
    justifyContent: 'flex-start',
    gap: width * 0.02,
  },
  name: {
    color: 'white',
    fontSize: width * 0.08,
    fontFamily: 'Arial',
    fontWeight: 'bold',
  },
  heartsContainer: {
    flexDirection: 'row',
  },
  heartIcon: {
    marginRight: width * 0.005,
  },
  storeContainer: {
    position: 'absolute',
    bottom: height * 0.04,
    left: width * 0.12,
    alignItems: 'center',
  },
  flameContainer: {
    position: 'absolute',
    bottom: height * 0.04,
    right: width * 0.12,
    alignItems: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: Math.min(width, height) * 0.03,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    letterSpacing: 0.05,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.05,
    padding: width * 0.02,
  },
  centerImage: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: height * 0.3,
  },
  scrollContent: {
    paddingBottom: height * 0.2,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    alignSelf: 'center',
    marginTop: height * 0.3,
  },
});