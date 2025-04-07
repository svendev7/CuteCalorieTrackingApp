import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
    },
    container: {
      flex: 1,
      backgroundColor: "#1E1E1E", 
    },
    header: {
      paddingTop: height * 0.01,
      paddingBottom: height * 0.02,
      paddingHorizontal: width * 0.05,
    },
    backButton: {
      position: "absolute",
      top: height * 0.02,
      left: width * 0.025,
      zIndex: 10,
      paddingVertical: height * 0.01,
      paddingHorizontal: width * 0.02,
      
    },
    backButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButtonText: {
      color: "#FFFFFF",
      marginLeft: width * 0.01,
      fontSize: width * 0.045,
    },
    titleContainer: {
      alignItems: "center",
      marginTop: height * 0.02,
    },
    title: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      maxWidth: width * 0.7,
    },
    dateTime: {
      color: "#A0A0A0",
      fontSize: 14,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: width * 0.05,
    },
    card: {
      backgroundColor: "#2A2A2A",
      borderRadius: 15,
      padding: width * 0.05,
      marginBottom: height * 0.05,
    },
    mealImageContainer: {
      alignItems: "center",
      marginBottom: height * 0.03,
    },
    mealImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#3A3A3A",
      justifyContent: "center",
      alignItems: "center",
    },
    mealNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: height * 0.03,
    },
    mealNameText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
    nutritionContainer: {
      marginBottom: height * 0.03,
    },
    nutritionTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: height * 0.015,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.2)",
      paddingBottom: 8,
    },
    nutritionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    nutritionLabel: {
      color: "#FFFFFF",
      fontSize: 16,
    },
    nutritionValueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    nutritionValue: {
      color: "#FFFFFF",
      fontSize: 16,
      marginRight: 8,
    },
    saveButton: {
      backgroundColor: "#FF9500",
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: height * 0.02,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
  })
  
  