"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal, Image, ActivityIndicator } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { auth } from "../../config/firebase"
import { getSavedMealsByUserId, deleteMeal, Meal, updateMeal } from "../../services/mealService"

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

const SavedMealsScreen: React.FC<SavedMealsScreenProps> = ({ onClose, onSelectMeal }) => {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    if (visible) {
      fetchSavedMeals()
    }
  }, [visible])
  
  useEffect(() => {
    setVisible(true)
    return () => {
      setVisible(false)
    }
  }, [])

  const fetchSavedMeals = async () => {
    try {
      setLoading(true)
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        throw new Error('User not authenticated')
      }
      
      const meals = await getSavedMealsByUserId(currentUser.uid)
      
      // Transform Firestore meals to SavedMeal format
      const transformedMeals = meals.map(meal => ({
        id: meal.id,
        name: meal.mealName,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        calories: meal.calories,
        imageUrl: meal.imageUrl || 'https://via.placeholder.com/80',
        lastUsed: meal.lastUsed ? formatLastUsed(meal.lastUsed) : undefined
      }))
      
      setSavedMeals(transformedMeals)
      setError(null)
    } catch (err) {
      console.error('Error fetching saved meals:', err)
      setError('Failed to load saved meals')
    } finally {
      setLoading(false)
    }
  }

  const formatLastUsed = (timestamp: any): string => {
    if (!timestamp) return ''
    
    try {
      const date = timestamp.toDate()
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    } catch (err) {
      return ''
    }
  }

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal(id)
      setSavedMeals(savedMeals.filter((meal) => meal.id !== id))
    } catch (err) {
      console.error('Error deleting meal:', err)
      setError('Failed to delete meal')
    }
  }

  const handleEditMeal = (meal: SavedMeal) => {
    // You can implement meal editing functionality here
    // For now, just show an alert that editing is not yet implemented
    console.log("Edit meal:", meal);
    alert("Meal editing will be implemented in a future update");
  }

  if (loading) {
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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3E92CC" />
              <Text style={styles.loadingText}>Loading saved meals...</Text>
            </View>
          </View>
        </View>
      </Modal>
    )
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

          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchSavedMeals} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!error && savedMeals.length === 0 ? (
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
                    <Image 
                      source={{ 
                        uri: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400"
                      }} 
                      style={styles.mealImage} 
                    />
                    <View style={styles.mealInfo}>
                      <View style={styles.mealNameRow}>
                        <Text style={styles.mealName}>{item.name}</Text>
                        <TouchableOpacity 
                          style={styles.moreOptionsButton} 
                          onPress={() => handleEditMeal(item)}
                        >
                          <MaterialCommunityIcons name="pencil-outline" size={18} color="#EDEDED" />
                        </TouchableOpacity>
                      </View>
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
    color: "#3E92CC",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  lastUsed: {
    color: "#707070",
    fontSize: 12,
    fontStyle: "italic",
  },
  mealItemActions: {
    marginLeft: 10,
  },
  deleteButton: {
    padding: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#A0A0A0",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#EDEDED",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: "#3E92CC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  mealNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  moreOptionsButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default SavedMealsScreen;
