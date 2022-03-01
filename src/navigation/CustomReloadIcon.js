import React from 'react';
import {TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const CustomReloadIcon = ({onPress, disabled, deleteIconAnimation}) => {
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        right: 20,
        bottom: 22,
        zIndex: 3,
        elevation: 5,
        flex: 1,
      }}
      onPress={onPress}
      disabled={disabled}>
      <AnimatedIcon
        name={'delete'}
        size={24}
        style={{
          color: '#fff',
          opacity: deleteIconAnimation,
          transform: [
            {
              scale: deleteIconAnimation,
            },
          ],
        }}
      />
    </TouchableOpacity>
  );
};

export default CustomReloadIcon;
