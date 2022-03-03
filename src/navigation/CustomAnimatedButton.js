import React, {useRef, useContext, useEffect} from 'react';
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

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => navigation.jumpTo('RecordingStack')}>
        <View style={[styles.btnStyle]}>
          <Animated.View
            style={{
              position: 'absolute',
              opacity: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ],
            }}>
            <Icon name={'plus'} size={24} color={'#fff'} />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              opacity: animation,
              transform: [
                {
                  scale: animation,
                },
              ],
            }}>
            <Icon name={'record-circle'} size={24} color={'#fff'} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default CustomAnimatedButton;
