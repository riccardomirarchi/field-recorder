import React from 'react';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import CustomAnimatedButton from './CustomAnimatedButton';
import style from '@styles/styles';

const CustomTabBarAndroid = props => {
  return (
    <>
      <CustomAnimatedButton {...props} />
      <View style={style.androidTabBarStyle}>
        <BottomTabBar {...props} />
      </View>
    </>
  );
};

export default CustomTabBarAndroid;
