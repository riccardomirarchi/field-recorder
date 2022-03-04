import React, {useRef, useContext, useEffect} from 'react';
import {TouchableWithoutFeedback, Animated, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RecordingsContext} from '@utils/recordings';
import styles from '@styles/styles';

const CustomAnimatedButton = props => {
  const {navigation} = props;

  const {
    state: {hasWaitingRec},
  } = useContext(RecordingsContext);

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasWaitingRec) showRecordHidePlusIcon();
    else showPlusHideRecordIcon();
  }, [hasWaitingRec]);

  const showPlusHideRecordIcon = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const showRecordHidePlusIcon = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const AnimatedView = ({iconName, opacity, scale}) => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          opacity,
          transform: [
            {
              scale,
            },
          ],
        }}>
        <Icon name={iconName} size={24} color={'#fff'} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.bottomCircleContainer}>
      <TouchableWithoutFeedback
        onPress={() => navigation.jumpTo('RecordingStack')}>
        <View style={[styles.bottomCircleStyle]}>
          <AnimatedView
            iconName={'plus'}
            opacity={animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })}
            scale={animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })}
          />

          <AnimatedView
            iconName={'record-circle'}
            opacity={animation}
            scale={animation}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default CustomAnimatedButton;
