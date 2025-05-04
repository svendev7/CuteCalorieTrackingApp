import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { styles } from "./MealComponentStyles"
const { width } = Dimensions.get("window")

interface MealComponentProps {
  mealName: string
  protein: number
  carbs: number
  fat: number
  calories: number
  loggedTime: string
  date: string
  imageUrl?: string
  onPress: () => void
}

export const MealComponent = ({
  mealName,
  protein,
  carbs,
  fat,
  calories,
  loggedTime,
  imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400",
  onPress,
}: MealComponentProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.mealImage} resizeMode="cover" />
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
            {mealName}
          </Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.proteinColor]}>{protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.carbsColor]}>{carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.fatColor]}>{fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#A0A0A0" />
            <Text style={styles.timeText}>{loggedTime}</Text>
          </View>
        </View>
      </View>
      <View style={styles.calorieContainer}>
        <Text style={styles.calorieValue}>{calories}</Text>
        <Text style={styles.calorieLabel}>Cal</Text>
      </View>
    </TouchableOpacity>
  )
}
