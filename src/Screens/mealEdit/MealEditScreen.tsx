import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { styles } from "./MealEditStyles"
const { width, height } = Dimensions.get("window")

interface MealEditScreenProps {
  mealName: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sugar: number
  fibers: number
  sodium: number
  loggedTime: string
  date: string
  imageUrl?: string
  onClose: () => void
  onSave: () => void
}

export const MealEditScreen = ({
  mealName,
  protein,
  carbs,
  fat,
  calories,
  sugar = 5,
  fibers = 33,
  sodium = 12,
  loggedTime,
  date,
  imageUrl = "https://via.placeholder.com/80",
  onClose,
  onSave,
}: MealEditScreenProps) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <View style={styles.backButtonContent}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}></Text>
            </View>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {mealName}
            </Text>
            <Text style={styles.dateTime}>
              {date}, {loggedTime}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.mealImageContainer}>
              <View style={styles.mealImage}>
                <MaterialCommunityIcons name="camera" size={30} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.mealNameContainer}>
              <Text style={styles.mealNameText}>{mealName}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
            </View>

            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionTitle}>Nutrition Facts</Text>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{calories} kcal</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{protein} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{carbs} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{fat} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Sugar</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{sugar} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fibers</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{fibers} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Sodium</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>{sodium} g</Text>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

