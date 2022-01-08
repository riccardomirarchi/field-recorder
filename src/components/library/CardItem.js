import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import styles from '@styles/styles';

const CardItem = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate('Recording Details', { recording: item })
      }
      onLongPress={() => console.log('not yet implemented')}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={styles.cardItemContainer}>
          <Text style={styles.cardItemTextStyle}>{item.recordingName}</Text>
          <Icon name={'rightcircle'} size={24} color={'#464646'} />
        </View>
        {/* <View style={{ position: 'absolute', right: 26, bottom: 33 }}>
          <Feather name={'circle'} size={24} color={'black'} />
        </View> */}
      </View>
    </TouchableWithoutFeedback>
  );
};
export default CardItem;
