import React from 'react';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import {View} from 'react-native';
import CustomAnimatedButton from './CustomAnimatedButton';
import CustomExportButton from './CustomExportButton';
import style from '@styles/styles';

const CustomTabBarAndroid = props => {
  // stupid way for getting recording from the react navigation props...
  const recording = props.state?.routes[0]?.state?.routes[1]?.params?.recording;

  return (
    <>
      <CustomExportButton recording={recording} />
      <CustomAnimatedButton {...props} />
      <View style={style.androidTabBarStyle}>
        <BottomTabBar {...props} />
      </View>
    </>
  );
};

export default CustomTabBarAndroid;
