import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface NutrientInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  unit?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const NutrientInput: React.FC<NutrientInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder = '0',
  unit,
  containerStyle,
  inputStyle,
  labelStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.inputLabel, labelStyle]}>
        {label}{unit ? ` (${unit})` : ''}
      </Text>
      <TextInput
        style={[styles.textInput, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onFocus={onFocus}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#666666"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default NutrientInput; 