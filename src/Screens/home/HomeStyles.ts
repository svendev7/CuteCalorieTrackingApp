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
    bottom: height * 0.17,
    left: width * 0.12,
    alignItems: 'center',
    zIndex: 1,
  },
  storeContainerUpdated: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.12,
    alignItems: 'center',
    zIndex: 2,
  },
  flameContainer: {
    position: 'absolute',
    bottom: height * 0.17,
    right: width * 0.12,
    alignItems: 'center',
    zIndex: 1,
  },
  flameContainerUpdated: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width * 0.12,
    alignItems: 'center',
    zIndex: 2,
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
    zIndex: 1,
  },
  centerImage: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: height * 0.3,
    zIndex: 1,
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
  // Bottom sheet styles
  bottomSheetContainer: {
    position: 'absolute',
    left: (width - 370) / 2,
    bottom: -height * 0.65,
    width: 370,
    height: height * 0.8,
    zIndex: 999,
  },
  topContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#7D7C7C',
    borderRadius: 10,
    marginBottom: 10,
    zIndex: 999,
  },
  bottomContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#7D7C7C',
    borderRadius: 10,
    zIndex: 999,
  },
  bottomSheetHandle: {
    width: '100%',
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: '#6C6C6C',
    borderRadius: 3,
    marginTop: 8,
  },
  peekContent: {
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  peekText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandedContent: {
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  expandedText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(108, 108, 108, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
  },
});