import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onClear,
}) => {
  return (
    <View style={styles.searchInputContainer}>
      <Ionicons name="search" size={18} color="#666666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={() => {
            if (onClear) {
              onClear();
            } else {
              onChangeText('');
            }
          }} 
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={18} color="#666666" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
});

export default SearchBar; 