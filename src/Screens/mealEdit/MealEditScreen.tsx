// import React, { useState, useRef, useEffect } from "react"
// import { 
//   View, 
//   Text, 
//   Dimensions, 
//   TouchableOpacity, 
//   TextInput, 
//   Platform, 
//   KeyboardAvoidingView, 
//   ScrollView, 
//   Keyboard, 
//   LayoutAnimation,
//   UIManager,
//   findNodeHandle,
//   NativeModules,
//   KeyboardEvent
// } from "react-native"
// import { MaterialCommunityIcons } from "@expo/vector-icons"
// import { styles } from "./MealEditStyles"
// import { useAuth } from '../../hooks/useAuth'
// import { Meal } from '../../services/mealService'
// const { width, height } = Dimensions.get("window")

// // Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// interface MealEditScreenProps {
//   meal: Meal;
//   onClose: () => void;
//   onSave: (meal: Meal) => void;
// }

// export const MealEditScreen = ({
//   meal,
//   onClose,
//   onSave,
// }: MealEditScreenProps) => {
//   const { user } = useAuth();
//   const [editingField, setEditingField] = useState<string | null>(null);
//   const scrollViewRef = useRef<ScrollView>(null);
//   const viewRefs = useRef<{[key: string]: React.RefObject<View>}>({
//     mealName: React.createRef(),
//     calories: React.createRef(),
//     protein: React.createRef(),
//     carbs: React.createRef(),
//     fat: React.createRef(),
//     sugar: React.createRef(),
//     fibers: React.createRef(),
//     sodium: React.createRef(),
//   });
//   const inputRefs = useRef<{[key: string]: React.RefObject<TextInput>}>({
//     mealName: React.createRef(),
//     calories: React.createRef(),
//     protein: React.createRef(),
//     carbs: React.createRef(),
//     fat: React.createRef(),
//     sugar: React.createRef(),
//     fibers: React.createRef(),
//     sodium: React.createRef(),
//   });
  
//   const [formData, setFormData] = useState({
//     mealName: meal.mealName,
//     protein: meal.protein.toString(),
//     carbs: meal.carbs.toString(),
//     fat: meal.fat.toString(),
//     calories: meal.calories.toString(),
//     sugar: meal.sugar.toString(),
//     fibers: meal.fibers.toString(),
//     sodium: meal.sodium.toString(),
//   });
  
//   // Store keyboard height
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
  
//   // Set up keyboard listeners to get keyboard height
//   useEffect(() => {
//     const keyboardWillShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       (event: KeyboardEvent) => {
//         setKeyboardHeight(event.endCoordinates.height);
//       }
//     );
    
//     const keyboardWillHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//       }
//     );
    
//     return () => {
//       keyboardWillShowListener.remove();
//       keyboardWillHideListener.remove();
//     };
//   }, []);
  
//   // Function to measure view positions for accurate scrolling
//   const measureViewPosition = (ref: React.RefObject<View>): Promise<{y: number, height: number}> => {
//     return new Promise((resolve) => {
//       if (!ref.current || !scrollViewRef.current) {
//         resolve({y: 0, height: 0});
//         return;
//       }
      
//       const nodeHandle = findNodeHandle(ref.current);
//       if (!nodeHandle) {
//         resolve({y: 0, height: 0});
//         return;
//       }
      
//       ref.current.measureLayout(
//         findNodeHandle(scrollViewRef.current) as number,
//         (x, y, width, height) => {
//           resolve({y, height});
//         },
//         () => resolve({y: 0, height: 0})
//       );
//     });
//   };

//   // This calculates the scroll position to align the field with the keyboard
//   const calculateScrollPosition = async (field: string) => {
//     // Get position and height of the target view
//     const {y, height} = await measureViewPosition(viewRefs.current[field]);
    
//     // Calculate the visible area height (screen height minus keyboard height)
//     const visibleAreaHeight = height - keyboardHeight;
    
//     // Position we want the field to be at (align field bottom with keyboard top)
//     // We subtract the field height so the field is completely visible
//     // And add a small gap (20) for visual comfort
//     const targetPosition = visibleAreaHeight - height - 20;
    
//     // Calculate how much we need to scroll
//     const scrollPosition = y - targetPosition;
    
//     return Math.max(0, scrollPosition);
//   };

//   // Prevent keyboard flickering by maintaining keyboard visibility
//   const handleFieldPress = async (field: string) => {
//     // Don't reprocess if already editing this field
//     if (editingField === field) return;
    
//     // Avoid flicker by preventing keyboard dismiss
//     const isAlreadyEditing = editingField !== null;
    
//     // Set new field immediately
//     setEditingField(field);
    
//     // If keyboard is already showing, we can calculate position immediately
//     if (keyboardHeight > 0) {
//       const scrollPosition = await calculateScrollPosition(field);
      
//       // Scroll to the field position
//       if (scrollViewRef.current) {
//         scrollViewRef.current.scrollTo({
//           y: scrollPosition,
//           animated: true
//         });
//       }
//     }
    
//     // Focus timing depends on whether we're already editing
//     const focusDelay = isAlreadyEditing ? 10 : 100;
    
//     // Focus new input after scrolling
//     setTimeout(() => {
//       if (inputRefs.current[field]?.current) {
//         inputRefs.current[field].current?.focus();
        
//         // If keyboard wasn't showing before, we need to wait for it to appear
//         // and then recalculate the scroll position
//         if (keyboardHeight === 0) {
//           setTimeout(async () => {
//             if (scrollViewRef.current && keyboardHeight > 0) {
//               const scrollPosition = await calculateScrollPosition(field);
              
//               scrollViewRef.current.scrollTo({
//                 y: scrollPosition,
//                 animated: true
//               });
//             }
//           }, 300); // Wait for keyboard to fully appear
//         }
//       }
//     }, focusDelay);
//   };

//   const handleFieldChange = (value: string) => {
//     if (!editingField) return;
    
//     if (editingField !== 'mealName') {
//       // Only allow numbers and decimal point for numeric fields
//       const numericValue = value.replace(/[^0-9.]/g, '');
//       setFormData(prev => ({ ...prev, [editingField]: numericValue }));
//     } else {
//       setFormData(prev => ({ ...prev, [editingField]: value }));
//     }
//   };

//   const handleFieldSubmit = () => {
//     if (!editingField) return;
    
//     // Simply unfocus the input
//     if (inputRefs.current[editingField]?.current) {
//       inputRefs.current[editingField].current?.blur();
//     }
    
//     // Clear editing state
//     setEditingField(null);
//   };

//   const handleSave = () => {
//     if (!user) return;

//     // Make sure to dismiss any active keyboard
//     if (editingField) {
//       inputRefs.current[editingField]?.current?.blur();
//       setEditingField(null);
//     }

//     const updatedMeal: Meal = {
//       ...meal,
//       mealName: formData.mealName,
//       protein: parseFloat(formData.protein) || 0,
//       carbs: parseFloat(formData.carbs) || 0,
//       fat: parseFloat(formData.fat) || 0,
//       calories: parseFloat(formData.calories) || 0,
//       sugar: parseFloat(formData.sugar) || 0,
//       fibers: parseFloat(formData.fibers) || 0,
//       sodium: parseFloat(formData.sodium) || 0,
//       updatedAt: new Date() as any
//     };

//     onSave(updatedMeal);
//   };

//   // Use layout animation for smooth transitions
//   useEffect(() => {
//     LayoutAnimation.configureNext({
//       duration: 200,
//       update: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//       },
//     });
//   }, [editingField]);

//   const renderEditableField = (field: string, label: string, unit: string = '') => {
//     const isEditing = editingField === field;
//     const value = formData[field];

//     return (
//       <View ref={viewRefs.current[field]} style={styles.nutritionRow}>
//         <Text style={styles.nutritionLabel}>{label}</Text>
//         <View style={styles.nutritionValueContainer}>
//           {isEditing ? (
//             <View style={styles.inlineInputContainer}>
//               <TextInput
//                 ref={inputRefs.current[field]}
//                 style={[styles.nutritionValue, styles.inlineInput]}
//                 value={value}
//                 onChangeText={handleFieldChange}
//                 onBlur={() => setEditingField(null)}
//                 onSubmitEditing={handleFieldSubmit}
//                 keyboardType={field === 'mealName' ? "default" : "decimal-pad"}
//                 autoCorrect={field === 'mealName'}
//                 autoCapitalize={field === 'mealName' ? "sentences" : "none"}
//                 selectTextOnFocus={true}
//               />
//             </View>
//           ) : (
//             <TouchableOpacity 
//               onPress={() => handleFieldPress(field)}
//               style={styles.valueTouchable}
//             >
//               <Text style={styles.nutritionValue}>{value}{unit}</Text>
//               <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.overlay}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//       >
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <TouchableOpacity style={styles.backButton} onPress={() => {
//               if (editingField) {
//                 // Dismiss keyboard first
//                 Keyboard.dismiss();
//                 setEditingField(null);
//               }
//               onClose();
//             }}>
//               <View style={styles.backButtonContent}>
//                 <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
//                 <Text style={styles.backButtonText}></Text>
//               </View>
//             </TouchableOpacity>
//             <View style={styles.titleContainer}>
//               <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
//                 {formData.mealName}
//               </Text>
//               <Text style={styles.dateTime}>
//                 {meal.date}, {meal.loggedTime}
//               </Text>
//             </View>
//           </View>

//           <ScrollView 
//             ref={scrollViewRef}
//             style={styles.content}
//             keyboardShouldPersistTaps="always" // Critical for preventing keyboard dismiss
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 200 }}
//             onScrollBeginDrag={() => {
//               // Prevent keyboard dismiss when scrolling
//               if (editingField && inputRefs.current[editingField]?.current) {
//                 inputRefs.current[editingField].current?.focus();
//               }
//             }}
//           >
//             <View style={styles.card}>
//               <View style={styles.mealImageContainer}>
//                 <View style={styles.mealImage}>
//                   <MaterialCommunityIcons name="camera" size={30} color="#FFFFFF" />
//                 </View>
//               </View>

//               <View ref={viewRefs.current['mealName']} style={styles.mealNameContainer}>
//                 {editingField === 'mealName' ? (
//                   <View style={styles.inlineInputContainer}>
//                     <TextInput
//                       ref={inputRefs.current['mealName']}
//                       style={[styles.mealNameText, styles.inlineInput]}
//                       value={formData.mealName}
//                       onChangeText={handleFieldChange}
//                       onBlur={() => setEditingField(null)}
//                       onSubmitEditing={handleFieldSubmit}
//                       selectTextOnFocus={true}
//                     />
//                   </View>
//                 ) : (
//                   <TouchableOpacity 
//                     onPress={() => handleFieldPress('mealName')}
//                     style={styles.valueTouchable}
//                   >
//                     <Text style={styles.mealNameText}>{formData.mealName}</Text>
//                     <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
//                   </TouchableOpacity>
//                 )}
//               </View>

//               <View style={styles.nutritionContainer}>
//                 <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
//                 {renderEditableField('calories', 'Calories', ' kcal')}
//                 {renderEditableField('protein', 'Protein', ' g')}
//                 {renderEditableField('carbs', 'Carbs', ' g')}
//                 {renderEditableField('fat', 'Fat', ' g')}
//                 {renderEditableField('sugar', 'Sugar', ' g')}
//                 {renderEditableField('fibers', 'Fibers', ' g')}
//                 {renderEditableField('sodium', 'Sodium', ' g')}
//               </View>

//               <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//                 <Text style={styles.saveButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };