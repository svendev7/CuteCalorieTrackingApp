# Firebase Setup for PebblyPal

This document outlines the steps needed to set up Firebase/Firestore for the PebblyPal app's meal tracking system.

## Prerequisites

- A Firebase project (existing from user authentication)
- Firebase CLI tools installed

## Firestore Database Setup

1. Make sure you have a Firebase project set up with Firestore enabled.

2. Set up the necessary indexes for the query operations:

   The application uses compound queries for retrieving meals by user, which require composite indexes. These are defined in the `firestore.indexes.json` file.

   To deploy the indexes:
   ```
   firebase deploy --only firestore:indexes
   ```

3. Deploy the security rules from `firestore.rules`:
   ```
   firebase deploy --only firestore:rules
   ```

## Data Structure

### Collections

1. **users** - User profiles and preferences
   - Standard fields from authentication/onboarding

2. **meals** - All meal data including custom, saved, and logged meals
   - Fields:
     - `id`: Automatic document ID
     - `userId`: User who created the meal
     - `mealName`: Name of the meal
     - `protein`, `carbs`, `fat`, `calories`, etc.: Nutritional information
     - `foods`: Array of food items that make up the meal
     - `isCustom`: Boolean indicating if this is a saved custom meal
     - `isFavorite`: Boolean marking favorite status
     - `loggedTime`: When the meal was logged
     - `date`: Date the meal was consumed
     - `createdAt`, `updatedAt`, `lastUsed`: Timestamps for sorting and querying

## Client Implementation Details

The app uses several services to interact with Firebase:

1. **mealService.ts** - Handles all meal-related operations:
   - Creating, updating, and deleting meals
   - Retrieving user's meals (recent, favorites, custom)

2. **userService.ts** - Manages user profile operations

## Features Implemented

1. **User-specific meal data**:
   - All meals are associated with a specific user ID
   - Security rules ensure users can only access their own data

2. **Custom meal creation and saving**:
   - Users can create, save, and reuse custom meals

3. **Meal logging**:
   - Users can log meals with or without saving them

4. **Recent and favorite meals**:
   - Recently used meals are tracked
   - Users can mark meals as favorites for easy access

## Troubleshooting

If you encounter any issues with queries failing due to missing indexes, check the Firebase console. It typically provides a direct link to create any missing indexes when queries fail.

## Next Steps

1. **Food Database**: Create a separate collection for individual food items
2. **Enhanced User Preferences**: Add more fields to the user document for personalization
3. **Meal Planning**: Allow users to plan meals in advance 