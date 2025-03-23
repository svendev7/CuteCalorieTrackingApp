import React, { useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HomeScreen } from './Screens/home/HomeScreen';
import Footer from '../src/components/footer';
const { width, height } = Dimensions.get('window');

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isFooterVisible, setIsFooterVisible] = useState(true);

    const handleTabPress = (tabName) => {
        setActiveTab(tabName);
    };

    const handlePlusPress = () => {
        console.log('Plus button pressed');
    };

    return (
        <ImageBackground 
            source={require('@assets/background.jpg')}
            style={styles.container}
            imageStyle={{ opacity: 0.6 }} // dit laat die kut shit gebeueren als je switched van page
        >
            <View style={styles.contentContainer}>
                {activeTab === 'home' && (
                    <HomeScreen onFooterVisibilityChange={setIsFooterVisible} />
                )}
            </View>
            
            <Footer onPlusPress={handlePlusPress} isVisible={isFooterVisible} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
});