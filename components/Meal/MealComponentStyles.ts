import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const colors = {
  text: '#FFFFFF',             
  secondary: '#A0A0A0',
  cardBackground: '#1C1C1E',
  separator: 'rgba(120, 120, 120, 0.2)',
  protein: '#EF476F',
  carbs: '#06D6A0',
  fat: '#FFD166',
};

export const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      width: "105%",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    imageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: "rgba(120, 120, 120, 0.2)",
    },
    mealImage: {
      width: "100%",
      height: "100%",
    },
    mealInfo: {
      marginLeft: 12,
      maxWidth: width * 0.48,
    },
    mealName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    macroText: {
      color: colors.secondary,
      fontSize: 11,
      marginBottom: 4,
    },

    macrosRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
      width: "100%",
    },
    macroItem: {
      alignItems: "center",
      flex: 1,
    },
    macroValue: {
      fontSize: 12,
      fontWeight: "600",
    },
    macroLabel: {
      color: colors.secondary,
      fontSize: 10,
    },
    proteinColor: {
      color: colors.protein,
    },
    carbsColor: {
      color: colors.carbs,
    },
    fatColor: {
      color: colors.fat,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      color: colors.secondary,
      fontSize: 12,
      marginLeft: 2,
    },
    calorieContainer: {
      alignItems: "center",
    },
    calorieValue: {
      color: "#45A557",
      fontWeight: "bold"
    },
    calorieLabel: {
      color: colors.secondary,
      fontSize: 12,
    },
});
  
  