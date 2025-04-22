"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const COLORS = {
  background: "#1C1C1E",
  accent: "#06D6A0",
  text: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.3)",
  border: "rgba(6, 214, 160, 0.5)",
}

interface AnimatedFooterProps {
  isVisible: boolean
  activeTab?: string
  onAddPress?: () => void
  onRocketPress?: () => void
  onStatsPress?: () => void
  onQuickAddPress?: () => void
}

const AnimatedFooter: React.FC<AnimatedFooterProps> = ({
  isVisible = true,
  activeTab,
  onAddPress,
  onRocketPress,
  onStatsPress,
  onQuickAddPress,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [previousTab, setPreviousTab] = useState(activeTab)

  const rotateAnim = useRef(new Animated.Value(0)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current
  const footerVisibilityAnim = useRef(new Animated.Value(isVisible ? 0 : 100)).current
  const footerOpacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current
  const slideDirectionAnim = useRef(new Animated.Value(0)).current

  const menuItem1Anim = useRef(new Animated.Value(0)).current
  const menuItem2Anim = useRef(new Animated.Value(0)).current
  const menuItem3Anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isVisible && isOpen) {
      setIsOpen(false)
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start()
    }

    Animated.parallel([
      Animated.timing(footerVisibilityAnim, {
        toValue: isVisible ? 0 : 100,
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [isVisible])

  useEffect(() => {
    if (activeTab !== previousTab && previousTab && activeTab) {
      const tabOrder = ["home", "meals", "stats", "games", "profile"]
      const prevIndex = tabOrder.indexOf(previousTab)
      const currentIndex = tabOrder.indexOf(activeTab)

      const direction = prevIndex < currentIndex ? 1 : -1

      Animated.parallel([
        Animated.timing(footerOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideDirectionAnim, {
          toValue: -100 * direction,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        slideDirectionAnim.setValue(100 * direction)

        Animated.parallel([
          Animated.timing(footerOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideDirectionAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start()
      })

      setPreviousTab(activeTab)
    }
  }, [activeTab])

  const toggleMenu = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start()

    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start()

    const menuItems = [menuItem1Anim, menuItem2Anim, menuItem3Anim]

    menuItems.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: isOpen ? 0 : 1,
        duration: 300,
        delay: isOpen ? 0 : index * 50,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start()
    })

    setIsOpen(!isOpen)
  }

  const handleButtonPress = (callback?: () => void) => {
    if (isOpen) {
      toggleMenu()
    }

    if (callback) {
      callback()
    }
  }

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  })

  const shadowOpacity = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.5],
  })

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: footerVisibilityAnim }, { translateX: slideDirectionAnim }],
          opacity: footerOpacityAnim,
        },
      ]}
    >
      {isOpen && (
        <View style={styles.menuContainer}>
          <Animated.View
            style={[
              styles.menuItemContainer,
              {
                opacity: menuItem1Anim,
                transform: [
                  {
                    scale: menuItem1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: menuItem1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={() => handleButtonPress(onAddPress)} activeOpacity={0.8}>
              <Text style={styles.menuText}>Log Meal</Text>
              <Ionicons name="fast-food" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItemContainer,
              {
                opacity: menuItem2Anim,
                transform: [
                  {
                    scale: menuItem2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: menuItem2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleButtonPress(onStatsPress)}
              activeOpacity={0.8}
            >
              <Text style={styles.menuText}>Stats</Text>
              <Ionicons name="stats-chart" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItemContainer,
              {
                opacity: menuItem3Anim,
                transform: [
                  {
                    scale: menuItem3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: menuItem3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleButtonPress(onRocketPress)}
              activeOpacity={0.8}
            >
              <Text style={styles.menuText}>Games</Text>
              <Ionicons name="rocket" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <Animated.View
        style={[
          styles.toggleButtonContainer,
          {
            transform: [{ scale: buttonScaleAnim }],
            shadowOpacity: shadowOpacity,
          },
        ]}
      >
        <TouchableOpacity style={styles.toggleButton} onPress={toggleMenu} activeOpacity={0.9}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={36} color={COLORS.text} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 30,
    alignItems: "center",
    zIndex: 100,
  },
  toggleButtonContainer: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  toggleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  menuContainer: {
    position: "absolute",
    bottom: 75,
    right: 0,
    alignItems: "flex-end",
    width: 150,
  },
  menuItemContainer: {
    width: "100%",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    width: "100%",
  },
  menuText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 8,
  },
})

export default AnimatedFooter
