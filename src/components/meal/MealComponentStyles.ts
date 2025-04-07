import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
export const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(120, 120, 120, 0.2)",
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
      maxWidth: width * 0.5,
    },
    mealName: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    macroText: {
      color: "#A0A0A0",
      fontSize: 11,
      marginBottom: 4,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      color: "#A0A0A0",
      fontSize: 12,
      marginLeft: 2,
      
    },
    calorieContainer: {
      alignItems: "center",
      
    },
    calorieValue: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold"
    },
    calorieLabel: {
      color: "#A0A0A0",
      fontSize: 12,
    },
  })
  
  