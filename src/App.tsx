import React, { useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HomeScreen } from './Screens/home/HomeScreen';
import { SettingsScreen } from './Screens/settings/SettingsScreen';
import Footer from './components/footer/Footer';
const { width, height } = Dimensions.get('window');


export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [customBackground, setCustomBackground] = useState<string | null>(null);
    const updateCustomBackground = (uri: string | null) => {
        setCustomBackground(uri);
    };
    

    return (
        <View style={styles.containerWrapper}>

                <View style={styles.overlay} />
                <View style={styles.contentContainer}>
                {activeTab === 'home' ? (
                    <HomeScreen 
                        onFooterVisibilityChange={setIsFooterVisible}
                        customBackground={customBackground}
                        onSettingsPress={() => setActiveTab('settings')}
                    />
                    ) : (
                        <SettingsScreen 
                            navigate={(tab) => setActiveTab(tab)}
                            updateCustomBackground={setCustomBackground}
                            customBackground={customBackground}
                        />
                    )}
                    
                    {activeTab === 'home' && (
                        <Footer isVisible={isFooterVisible} />
                    )}
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
        backgroundColor: '#534741',
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
