"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal, Image } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

interface SavedMeal {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  imageUrl: string
  lastUsed?: string
}

interface SavedMealsScreenProps {
  onClose: () => void
  onSelectMeal: (meal: SavedMeal) => void
}

export const SavedMealsScreen: React.FC<SavedMealsScreenProps> = ({ onClose, onSelectMeal }) => {
  // Mock data for saved meals
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([
    {
      id: "1",
      name: "Chicken & Rice Bowl",
      protein: 35,
      carbs: 45,
      fat: 12,
      calories: 430,
      imageUrl: "https://via.placeholder.com/80",
      lastUsed: "2 days ago",
    },
    {
      id: "2",
      name: "Protein Smoothie",
      protein: 25,
      carbs: 30,
      fat: 5,
      calories: 270,
      imageUrl: "https://via.placeholder.com/80",
      lastUsed: "Yesterday",
    },
    {
      id: "3",
      name: "Avocado Toast",
      protein: 12,
      carbs: 35,
      fat: 15,
      calories: 320,
      imageUrl: "https://via.placeholder.com/80",
      lastUsed: "3 days ago",
    },
    {
      id: "4",
      name: "Greek Yogurt with Berries",
      protein: 18,
      carbs: 25,
      fat: 8,
      calories: 240,
      imageUrl: "https://via.placeholder.com/80",
      lastUsed: "1 week ago",
    },
    {
      id: "5",
      name: "Salmon & Vegetables",
      protein: 30,
      carbs: 20,
      fat: 18,
      calories: 360,
      imageUrl: "https://via.placeholder.com/80",
      lastUsed: "5 days ago",
    },
  ])

  const handleDeleteMeal = (id: string) => {
    setSavedMeals(savedMeals.filter((meal) => meal.id !== id))
  }

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#EDEDED" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Saved Meals</Text>
            <View style={{ width: 40 }} />
          </View>

          {savedMeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="food-off" size={60} color="#A0A0A0" />
              <Text style={styles.emptyText}>No saved meals found</Text>
              <Text style={styles.emptySubtext}>Create and save meals to quickly log them later</Text>
            </View>
          ) : (
            <FlatList
              data={savedMeals}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.mealItem} onPress={() => onSelectMeal(item)}>
                  <View style={styles.mealItemContent}>
                    <Image source={{ uri: item.imageUrl }} style={styles.mealImage} />
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{item.name}</Text>
                      <Text style={styles.mealMacros}>
                        {item.protein}g P • {item.carbs}g C • {item.fat}g F
                      </Text>
                      <Text style={styles.mealCalories}>{item.calories} Cal</Text>
                      {item.lastUsed && <Text style={styles.lastUsed}>Last used: {item.lastUsed}</Text>}
                    </View>
                  </View>
                  <View style={styles.mealItemActions}>
                    <TouchableOpacity onPress={() => handleDeleteMeal(item.id)} style={styles.deleteButton}>
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalView: {
    flex: 1,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: height * 0.05,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  headerTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E2E2E",
    padding: 15,
    marginBottom: 15,
  },
  mealItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color: "#EDEDED",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  mealMacros: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 2,
  },
  mealCalories: {
    color: "#D93036",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  lastUsed: {
    color: "#A0A0A0",
    fontSize: 12,
    fontStyle: "italic",
  },
  mealItemActions: {
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    color: "#A0A0A0",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "80%",
  },
})
