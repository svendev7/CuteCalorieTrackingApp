import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
export const styles = StyleSheet.create({
    footerContainer: {
      position: 'absolute',
      bottom: -height * 0.016,
      width: '100%',
      height: height * 0.115,
      zIndex: 100,
    },
    backgroundSvg: {
      position: 'absolute',
      bottom: 0,
    },
    sideButton: {
      position: 'absolute',
      padding: width * 0.04,
      bottom: height * 0.037,
    },
    leftButton: {
      left: width * 0.128,
    },
    rightButton: {
      right: width * 0.128,
    },
    centerButton: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: height * 0.065,
      zIndex: 101,
    },
  });