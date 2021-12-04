import React from 'react';
import { View, TouchableWithoutFeedback, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import styles, { PLAYER_WIDTH } from '@styles/styles';
import { formatMillis } from '@utils/recordings';

const PlayerComponent = ({ playing, animation, onPress, position, duration, fromEvent = false }) => {
  const translateX = animation.interpolate({
    inputRange: [0, duration],
    outputRange: [0, PLAYER_WIDTH - 18],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.playerContainer}>
      <View
        style={[
          styles.iconContainer,
          {
            width: 40,
            justifyContent: 'flex-start',
            flexDirection: 'row',
            marginBottom: 1,
          },
        ]}>
        <TouchableWithoutFeedback onPress={onPress}>
          <View>
            <Icon
              name={playing ? fromEvent ? 'leftcircleo' : 'pausecircleo' : 'playcircleo'}
              size={30}
              color={'gray'}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.player}>
        <Animated.View
          style={[
            styles.innerPlayer,
            {
              transform: [
                {
                  translateX,
                },
              ],
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.iconContainer,
          {
            width: 40,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            marginBottom: 1,
          },
        ]}>
        <Animated.Text style={{ fontSize: 18, color: 'gray' }}>
          {formatMillis(position ? position : duration)}
        </Animated.Text>
      </View>
    </View>
  );
};

export default PlayerComponent;
