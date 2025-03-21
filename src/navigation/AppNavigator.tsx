// import { createStackNavigator } from '@react-navigation/stack';
// import { HomeScreen } from '../Screens/home/HomeScreen';
// import { SettingsScreen } from '../Screens/settings/SettingsScreen';

// type RootStackParamList = {
//   Home: undefined;
//   Settings: undefined;
// };

// const Stack = createStackNavigator<RootStackParamList>();

// export const AppNavigator = () => (
//   <Stack.Navigator
//     screenOptions={{
      
//       headerShown: false,
//       // ADD THIS TO BURY THE 'large' DEMON 👇
//       headerStatusBarHeight: 0, // Explicit number
//       headerTitleStyle: { fontSize: 16 }, // Numbers only
//     }}
//   >
//     <Stack.Screen name="Home" component={HomeScreen} />
//     <Stack.Screen 
//       name="Settings" 
//       component={SettingsScreen}
//       options={{
//         headerShown: true,
//         headerStyle: { 
//           backgroundColor: '#000',
//           height: 56 // <-- NUMBERS ONLY YOU HEATHEN
//         },
//         headerTintColor: '#fff'
//       }}
//     />
//   </Stack.Navigator>
// );