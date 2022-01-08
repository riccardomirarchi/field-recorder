import React from 'react';
import { View, TouchableWithoutFeedback, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import styles, { PLAYER_WIDTH } from '@styles/styles';
import { formatMillis } from '@utils/recordings';


const PlayerComponent = ({ playing, animation, onPress, position, duration, fromEvent = false, style = {}, onPressDisabled, disabled }) => {
  const translateX = animation.interpolate({
    inputRange: [0, duration],
    outputRange: [0, !fromEvent ? PLAYER_WIDTH - 18 : PLAYER_WIDTH / 1.62],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.playerContainer, style.width ? { width: style.width } : {}]}>
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
        <TouchableWithoutFeedback onPress={!fromEvent ? onPress : disabled ? onPressDisabled : onPress}>
          <View>
            <Icon
              name={playing ? fromEvent ? 'leftcircleo' : 'pausecircleo' : 'playcircleo'}
              size={30}
              color={'gray'}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={[styles.player, style.playerWidth ? { width: style.playerWidth } : {}]}>
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
