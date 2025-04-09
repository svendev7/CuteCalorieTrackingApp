import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 300,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      borderRadius: 15,
      paddingHorizontal: width * 0.0325,
    },
    container: {
      flex: 1,
      backgroundColor: "#0A0A0A", 
      borderColor: '#2E2E2E',
      borderWidth: 1,
      borderRadius: 15,
      
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
      paddingBottom: 155,
      minHeight: height * 0.1,
      padding: width * 0.05,
      height: height * 0.9,
      maxHeight: height * 0.9,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    card: {
      backgroundColor: "#0A0A0A",
      borderRadius: 15,
      padding: width * 0.05,
      marginBottom: height * 0.05,
      borderColor: '#2E2E2E',
      borderWidth: 1,
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
      color: "#EDEDED",
      fontSize: 18,
      fontWeight: "bold",
    },
    nutritionContainer: {
      marginBottom: height * 0.03,
    },
    nutritionTitle: {
      color: "#EDEDED",
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
      color: "#EDEDED",
      fontSize: 16,
    },
    nutritionValueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    nutritionValue: {
      color: "#EDEDED",
      fontSize: 16,
      marginRight: 8,
    },
    saveButton: {
      backgroundColor: "#0B7BFE",
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: height * 0.02,
    },
    saveButtonText: {
      color: "#EDEDED",
      fontSize: 16,
      fontWeight: "bold",
    },
  })
  
  