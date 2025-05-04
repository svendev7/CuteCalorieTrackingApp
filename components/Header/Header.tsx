import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: ReactNode;
  rightIconAction?: () => void;
  showSearch?: boolean;
  searchComponent?: ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightIcon,
  rightIconAction,
  showSearch = false,
  searchComponent,
  containerStyle,
  titleStyle,
}) => {
  return (
    <View style={[styles.headerContainer, containerStyle]}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
        
        {rightIcon ? (
          <TouchableOpacity onPress={rightIconAction} style={styles.rightButton}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
      
      {showSearch && searchComponent && (
        <View style={styles.searchContainer}>
          {searchComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "100%",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
  },
  rightButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    marginBottom: 15,
  },
});

export default Header; 