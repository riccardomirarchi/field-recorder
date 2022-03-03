import React from 'react';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import CustomAnimatedButton from './CustomAnimatedButton';
import CustomExportButton from './CustomExportButton';
import style from '@styles/styles';

const CustomTabBar = props => {
  // stupid way for getting recording from the react navigation props...
  const recording = props.state?.routes[0]?.state?.routes[1]?.params?.recording;

  return (
    <>
      <CustomExportButton recording={recording} />
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
