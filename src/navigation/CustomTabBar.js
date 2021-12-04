import React from 'react';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import CustomAnimatedButton from './CustomAnimatedButton';
import style from '@styles/styles';

const CustomTabBar = props => {
  return (
    <>
      <CustomAnimatedButton {...props} />
      <BlurView
        style={style.iosTabBarStyle}
        blurType="dark"
        blurAmount={12}
        blurRadius={25}
        overlayColor="transparent">
        <BottomTabBar {...props} />
      </BlurView>
    </>
  );
};

export default CustomTabBar;
