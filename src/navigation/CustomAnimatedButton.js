import React, {useState, useRef, useContext} from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RecordingsContext} from '@utils/recordings';

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
    right: 20,
    bottom: 20,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS == 'android' ? 90 : 100,
    right: 0,
  },
  secondaryBtn: {
    width: 35,
    height: 35,
    bottom: -35,
  },
});

const CustomAnimatedButton = props => {
  const {
    state: {hasWaitingRec},
  } = useContext(RecordingsContext);

  const {navigation} = props;

  const [opened, setOpened] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    Animated.spring(animation, {
      toValue: opened ? 0 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setOpened(x => !x);
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const pin = {
    transform: [
      {
        scale: animation,
      },
      {
        translateY,
      },
    ],
  };

  const text = {
    transform: [
      {
        scale: animation,
      },
      {
        translateY,
      },
      {
        translateX: translateY,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View>
        {/* <Animated.Text
          style={[
            {
              position: 'absolute',
              bottom: 54 - 79,
              left: -70,
              width: 180,
              opacity: animation,
              shadowRadius: 10,
              shadowColor: 'gray',
              shadowOpacity: 0.8,
              color: 'gray',
            },
            text,
          ]}>
          New audio recording
        </Animated.Text> */}
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.jumpTo('RecordingStack');
            toggleMenu();
          }}>
          <Animated.View style={[styles.btnStyle, styles.secondaryBtn, pin]}>
            <Icon name={'record-circle'} size={18} color={'#fff'} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      <TouchableWithoutFeedback
        onPress={() => navigation.jumpTo('RecordingStack')}>
        <Animated.View style={[styles.btnStyle, rotation]}>
          <Icon
            name={!hasWaitingRec ? 'plus' : 'record-circle'}
            size={24}
            color={'#fff'}
          />
          {/* <Icon name={'plus'} size={24} color={'#fff'} /> */}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default CustomAnimatedButton;
