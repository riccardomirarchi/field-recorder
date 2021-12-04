import React from 'react';
import {Header} from '@react-navigation/stack';
import styles from '@styles/styles';
import {Animated} from 'react-native';

const CustomHeaderAndroid = props => {
  const {progress} = props;

  const opacity = Animated.add(
    progress.current,
    progress.next || 0,
  ).interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  return (
    <Animated.View style={[{opacity}, styles.androidHeaderStyle]}>
      <Header {...props} />
    </Animated.View>
  );
};

export default CustomHeaderAndroid;
