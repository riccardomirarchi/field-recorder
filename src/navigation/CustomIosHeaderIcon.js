import React from 'react';
import {Animated, TouchableOpacity} from 'react-native';
import styles from '@styles/styles';

const CustomIosHeaderIcon = ({
  onPress,
  disabled = false,
  icon,
  additionalStyle = {},
  iconName,
  iconSize,
  iconColor,
}) => {
  const AnimatedIcon = Animated.createAnimatedComponent(icon);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.iosHeaderTouchable, additionalStyle]}>
      <AnimatedIcon name={iconName} color={iconColor} size={iconSize} />
    </TouchableOpacity>
  );
};

export default CustomIosHeaderIcon;
