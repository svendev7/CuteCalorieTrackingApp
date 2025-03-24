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
       
    };

    return (
        <View style={styles.containerWrapper}>
            <ImageBackground 
                source={require('@assets/background.jpg')}
                style={styles.container}
            >
                <View style={styles.overlay} />
                <View style={styles.contentContainer}>
                    {activeTab === 'home' && (
                        <HomeScreen onFooterVisibilityChange={setIsFooterVisible} />
                    )}
                </View>
                
                <Footer onPlusPress={handlePlusPress} isVisible={isFooterVisible} />
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.4,
    },
    contentContainer: {
        flex: 1,
    },
});