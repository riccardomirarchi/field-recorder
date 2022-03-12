import React from 'react';
import {Text, Animated} from 'react-native';
import styles from '@styles/styles';

const CardItem = ({text, rightElement, style = {}, textStyle = {}}) => {
  return (
    <Animated.View style={[styles.cardItemContainer, style]}>
      <Text style={[styles.cardItemTextStyle, textStyle]}>{text}</Text>
      {rightElement}
    </Animated.View>
  );
};
export default CardItem;
