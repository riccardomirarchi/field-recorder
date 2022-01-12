import React from 'react';
import {View, Text} from 'react-native';
import styles from '@styles/styles';

const CardItem = ({text, rightElement}) => {
  return (
    <View style={styles.cardItemContainer}>
      <Text style={styles.cardItemTextStyle}>{text}</Text>
      {rightElement}
    </View>
  );
};
export default CardItem;
