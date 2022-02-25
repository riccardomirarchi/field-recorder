import React from 'react';
import {Animated} from 'react-native';

export const CompassComponent = ({degrees}) => {
  // const animation = useRef(new Animated.Value(degrees || 0)).current;

  // useEffect(() => {
  //   Animated.timing(animation, {
  //     toValue: degrees || 0,
  //     duration: 500,
  //     useNativeDriver: true,
  //   }).start();
  // }, [degrees]);

  // const transform = [
  //   {
  //     rotate: animation.interpolate({
  //       inputRange: [0, 360],
  //       outputRange: ['0deg', `-360deg`],
  //     }),
  //   },
  // ];

  return (
    <Animated.Image
      source={require('@components/assets/images/north_2.png')}
      style={{
        width: 60,
        height: 60,
        // transform,
        transform: [{rotate: `${360 - degrees}deg`}],
      }}
    />
  );
};
