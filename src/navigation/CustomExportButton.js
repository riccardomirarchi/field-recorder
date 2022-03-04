import React, {useEffect, useRef, useContext} from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RecordingsContext} from '@utils/recordings';
import styles from '@styles/styles';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const CustomExportButton = ({recording}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const processingAnimation = useRef(new Animated.Value(1)).current;

  const {
    utils: {EXPORT_RECORDINGS},
  } = useContext(RecordingsContext);

  useEffect(() => {
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

  const styleLeft = {
    left: 0,
    right: null,
  };

  const style = {
    opacity: animation,
    transform: [
      {
        scale: animation,
      },
    ],
    left: 20,
    right: null,
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
    <View style={[styles.bottomCircleContainer, styleLeft]}>
      <TouchableWithoutFeedback
        onPress={async () => {
          await EXPORT_RECORDINGS([recording], setProcessing);
        }}>
        <Animated.View style={[styles.bottomCircleStyle, style]}>
          <AnimatedIcon
            name={'export'}
            size={22}
            color={'#fff'}
            style={{
              position: 'absolute',
              ...iconStyle,
            }}
          />
          <Animated.View style={activityStyle}>
            <ActivityIndicator color={'#fff'} />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default CustomExportButton;
