import React from 'react';
import {StyleSheet} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#FFF',
    top: 0,
    width: '100%',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#000',
    shadowRadius: 20,
    shadowOpacity: 0.75,
    paddingTop: getStatusBarHeight(),
    zIndex: 2,
    elevation: 2,
  },
});

export default Header = ({
  children,
  duration = 800,
  height = 75,
  style = {},
}) => {
  return (
    <Animatable.View
      animation={'fadeInDown'}
      duration={duration}
      useNativeDriver
      style={[
        styles.headerStyle,
        {
          height: getStatusBarHeight() + height,
          ...style,
        },
      ]}>
      {children}
    </Animatable.View>
  );
};
