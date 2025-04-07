import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const colors = {
  background: '#121212',    
  text: '#FFFFFF',             
  secondary: '#A0A0A0',        
  subtleText: '#EEEEEE',       
  handleBar: '#8E8E8E',        
  cardBackground: '#1E1E1E',   
  backgroundShape: 'rgba(120, 120, 120, 0.05)', 
  backgroundOpacity: 0.8, 
  protein: '#F23636',          
  carbs: '#6DE96D',            
  fat: '#FF9B9B',              
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.1,
    backgroundColor: colors.background,
  },
  topLeft: {
    position: 'absolute',
    top: height * 0.09,
    left: width * 0.07,
    zIndex: 1,
    flexDirection: 'column', 
    justifyContent: 'flex-start',
    gap: width * 0.01,
  },
  name: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  heartsContainer: {
    flexDirection: 'row',
    left: width * 0.005,
    marginTop: 2,
  },
  heartIcon: {
    marginRight: width * 0.007,
  },
  storeContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    left: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  flameContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    right: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  iconText: {
    color: colors.text,
    fontSize: Math.min(width, height) * 0.03,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: height * 0.09,
    right: width * 0.05,
    padding: width * 0.02,
    zIndex: 1,
    borderRadius: width * 0.04,
  },
  centerImage: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: height * 0.18,
    zIndex: 1,
  },
  errorText: {
    color: '#FF3B30',
    alignSelf: 'center',
    marginTop: height * 0.3,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSheetWrapper: {
    position: 'absolute',
    left: (width - 370) / 2,
    bottom: height * 0.117 - 110,
    width: 370,
    height: height * 0.6,
    zIndex: 5,
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetScrollView: {
    height: height * 0.8,
    maxHeight: height * 0.8,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetContent: {
    paddingBottom: 50,
    minHeight: height * 1.2,
  },
  bottomSheetTopShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
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
    backgroundColor: colors.handleBar,
    borderRadius: 3,
    marginTop: 8,
  },
  peekContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    height: 160,
  },
  topContainer: {
    width: '100%',
    height: 175,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 10,
    zIndex: 999,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    paddingVertical: 20,
    zIndex: 999,
    minHeight: height * 0.5,
  },
  expandedContent: {
    padding: 20,
  },
  expandedTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  expandedText: {
    color: colors.subtleText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  calorieSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -35,
    marginBottom: 15,
    zIndex: 1,
  },
  calorieTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieSubtitle: {
    color: colors.text,
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
    marginTop: -3,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 5,
  },
  macroColumn: {
    alignItems: 'center',
    width: '30%',
  },
  macroBarContainer: {
    height: 6,
    backgroundColor: 'rgba(217, 217, 217, 0.33)',
    borderRadius: 3,
    marginBottom: 2,
    marginTop: 3,
    width: 45,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
  proteinBar: {
    backgroundColor: colors.protein,
    opacity: 0.8,
  },
  carbsBar: {
    backgroundColor: colors.carbs,
    opacity: 0.8,
  },
  fatBar: {
    backgroundColor: colors.fat,
    opacity: 0.8,
  },
  macroLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  macroValue: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 1,
  },
  backgroundShape1: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.02,
    left: -width * 0.3,
    zIndex: 0,
    transform: [{ rotate: '35deg' }],
  },
  backgroundShape2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 30,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.25,
    right: -width * 0.25,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  backgroundShape3: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    transform: [{ rotate: '45deg' }],
    top: height * 0.65,
    left: width * 0.15,
    zIndex: 0,
  },
  backgroundShape5: {
    position: 'absolute',
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.07,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.45,
    left: width * 0.05,
    zIndex: 0,
    transform: [{ rotate: '-25deg' }],
  },
  backgroundDots: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.05,
  },
  mealsContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    marginLeft: -15
  },
  dateContainer: {
    marginBottom: 15,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(120, 120, 120, 0.2)",
    marginHorizontal: -5,
    marginLeft: -8,
    marginBottom: -9,
  },
});