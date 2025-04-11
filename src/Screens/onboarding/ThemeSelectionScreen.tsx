// // filepath: d:\VSC Projects\CuteCalorieTrackingApp\src\Screens\onboarding\ThemeSelectionScreen.tsx
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// const ThemeSelectionScreen = ({ navigation, currentTheme, updateTheme, isPremium }) => {
//   const themes = [
//     { 
//       id: 'light', 
//       name: 'Light Mode', 
//       description: 'Clean white background with dark text',
//       colors: ['#FFFFFF', '#F5F5F5', '#EEEEEE'],
//       textColor: '#000000',
//       premium: false,
//       icon: 'sunny-outline'
//     },
//     { 
//       id: 'dark', 
//       name: 'Dark Mode', 
//       description: 'Dark background with light text',
//       colors: ['#000000', '#121212', '#1A1A1A'],
//       textColor: '#FFFFFF',
//       premium: false,
//       icon: 'moon-outline'
//     },
//     { 
//       id: 'midnight', 
//       name: 'Midnight Blue', 
//       description: 'Deep blue tones for night time use',
//       colors: ['#0F2027', '#203A43', '#2C5364'],
//       textColor: '#FFFFFF',
//       premium: true,
//       icon: 'cloudy-night-outline'
//     },
//     { 
//       id: 'forest', 
//       name: 'Forest Green', 
//       description: 'Calming green tones inspired by nature',
//       colors: ['#134E5E', '#1A6E5E', '#2E8B57'],
//       textColor: '#FFFFFF',
//       premium: true,
//       icon: 'leaf-outline'
//     },
//     { 
//       id: 'sunset', 
//       name: 'Sunset Orange', 
//       description: 'Warm orange and red gradients',
//       colors: ['#FF416C', '#FF4B2B', '#FF7F50'],
//       textColor: '#FFFFFF',
//       premium: true,
//       icon: 'sunny'
//     },
//     { 
//       id: 'purple', 
//       name: 'Royal Purple', 
//       description: 'Rich purple tones for a royal feel',
//       colors: ['#4A148C', '#6A1B9A', '#7B1FA2'],
//       textColor: '#FFFFFF',
//       premium: true,
//       icon: 'color-palette-outline'
//     },
//   ];

//   const handleThemeSelect = (themeId) => {
//     // Check if theme is premium and user doesn't have premium
//     if (themes.find(t => t.id === themeId).premium && !isPremium) {
//       // Show premium required message or navigate to premium screen
//       // For now, we'll just return without changing the theme
//       return;
//     }
    
//     updateTheme(themeId);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>App Theme</Text>
//       </View>

//       <Text style={styles.subtitle}>
//         Choose a theme for your app experience
//       </Text>

//       <ScrollView 
//         style={styles.themesContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         {themes.map((theme) => (
//           <TouchableOpacity
//             key={theme.id}
//             style={[
//               styles.themeCard,
//               currentTheme === theme.id && styles.selectedThemeCard,
//               { backgroundColor: theme.colors[1] }
//             ]}
//             onPress={() => handleThemeSelect(theme.id)}
//             activeOpacity={theme.premium && !isPremium ? 1 : 0.7}
//           >
//             <View style={styles.themeContent}>
//               <View style={styles.themeIconContainer}>
//                 <Ionicons 
//                   name={theme.icon} 
//                   size={28} 
//                   color={theme.textColor} 
//                 />
//               </View>
//               <View style={styles.themeTextContainer}>
//                 <Text style={[styles.themeName, { color: theme.textColor }]}>
//                   {theme.name}
//                 </Text>
//                 <Text style={[styles.themeDescription, { color: theme.textColor + '99' }]}>
//                   {theme.description}
//                 </Text>
//               </View>
//               {currentTheme === theme.id && (
//                 <View style={styles.checkmarkContainer}>
//                   <Ionicons name="checkmark-circle" size={24} color={theme.textColor} />
//                 </View>
//               )}
//             </View>

//             {theme.premium && !isPremium && (
//               <View style={styles.premiumOverlay}>
//                 <MaterialIcons name="lock" size={24} color="white" />
//                 <Text style={styles.premiumText}>Premium</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {!isPremium && (
//         <TouchableOpacity style={styles.getPremiumButton}>
            
//           <Text style={styles.getPremiumButtonText}>Get Premium for All Themes </Text>
          
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#AAA',
//     marginBottom: 30,
//   },
//   themesContainer: {
//     flex: 1,
//   },
//   themeCard: {
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   selectedThemeCard: {
//     borderWidth: 2,
//     borderColor: 'white',
//   },
//   themeContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   themeIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   themeTextContainer: {
//     flex: 1,
//   },
//   themeName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   themeDescription: {
//     fontSize: 14,
//   },
//   checkmarkContainer: {
//     marginLeft: 10,
//   },
//   premiumOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   premiumText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   getPremiumButton: {
//     backgroundColor: '#FFD700',
//     borderRadius: 30,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   getPremiumButtonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'black',
//   },
// });

// export default ThemeSelectionScreen;