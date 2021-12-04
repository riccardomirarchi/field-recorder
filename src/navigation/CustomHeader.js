import React from 'react';
import {BlurView} from '@react-native-community/blur';
import {Header} from '@react-navigation/stack';
import styles from '@styles/styles';
import {Animated} from 'react-native';

const CustomHeader = props => {
  const {progress} = props;

  const opacity = Animated.add(
    progress.current,
    progress.next || 0,
  ).interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  return (
    <Animated.View style={{opacity}}>
      <BlurView
        style={styles.iosHeaderStyle}
        blurType="dark"
        blurAmount={12}
        blurRadius={25}
        overlayColor="transparent">
        <Header {...props} />
      </BlurView>
    </Animated.View>
  );
};

export default CustomHeader;
