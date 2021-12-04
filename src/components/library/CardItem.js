import React from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import styles from '@styles/styles';

const CardItem = ({item}) => {
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate('Recording Details', {recording: item})
      }>
      <View style={styles.cardItemContainer}>
        <Text style={styles.cardItemTextStyle}>{item.recordingName}</Text>
        <Icon name={'rightcircle'} size={24} color={'#464646'} />
      </View>
    </TouchableWithoutFeedback>
  );
};
export default CardItem;
