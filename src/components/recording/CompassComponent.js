import React from 'react';
import {Animated} from 'react-native';

export const CompassComponent = ({degrees}) => {
  return (
    <Animated.Image
      source={require('@components/assets/images/north_2.png')}
      style={{
        width: 50,
        height: 50,
        transform: [{rotate: `${360 - degrees}deg`}],
      }}
    />
  );
};
