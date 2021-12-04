import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
    backgroundColor: '#001B48',
    borderRadius: 40,
    shadowRadius: 10,
    shadowColor: '#001B48',
    shadowOpacity: 0.2,
    position: 'absolute',
    top: 20 - 60,
    left: 20 - 60,
  },
  secondCircle: {
    height: 120,
    top: -60,
    left: -60,
    width: 120,
    backgroundColor: 'rgba(0,27,72, 0.3)',
    borderRadius: 60,
  },
});

const RecordButton = ({isRecording, animation, onPress}) => {
  const outputRange = [Platform.OS === 'android' ? 0.3 : 0, 1];

  return (
    <View>
      <Animated.View
        style={[
          styles.circle,
          styles.secondCircle,
          {
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [-160, 0],
                  outputRange,
                }),
              },
            ],
            backgroundColor: `rgba(0,27,72, 0.3)`,
          },
        ]}
      />
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.circle}>
          <Icon
            name={isRecording ? 'stop' : 'record-circle'}
            size={50}
            color={'#fff'}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default RecordButton;
