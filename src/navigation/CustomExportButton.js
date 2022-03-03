import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RecordingsContext} from '@utils/recordings';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);

const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: '#001B48',
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#001B48',
    shadowOpacity: 0.25,
    elevation: 10,
    left: 20,
    bottom: 20,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS == 'android' ? 90 : 100,
    left: 0,
  },
});

const CustomExportButton = ({recording}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const processingAnimation = useRef(new Animated.Value(1)).current;

  const {
    utils: {EXPORT_RECORDINGS},
  } = useContext(RecordingsContext);

  useEffect(() => {
    console.log(recording);
    Animated.timing(animation, {
      toValue: recording ? 1 : 0,
      useNativeDriver: true,
      duration: 150,
    }).start();
  }, [recording]);

  const setProcessing = value => {
    Animated.timing(processingAnimation, {
      useNativeDriver: true,
      toValue: !value ? 1 : 0,
      duration: 150,
    }).start();
  };

  const style = {
    opacity: animation,
    transform: [
      {
        scale: animation,
      },
    ],
  };

  const activityStyle = {
    opacity: processingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        scale: processingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
      },
    ],
  };

  const iconStyle = {
    opacity: processingAnimation,
    transform: [
      {
        scale: processingAnimation,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={async () => {
          await EXPORT_RECORDINGS([recording], setProcessing);
        }}>
        <Animated.View style={[styles.btnStyle, style]}>
          <AnimatedIcon
            name={'export'}
            size={22}
            color={'#fff'}
            style={{
              position: 'absolute',
              ...iconStyle,
            }}
          />
          <AnimatedIndicator style={activityStyle} color={'#fff'} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default CustomExportButton;
