import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import styles, { WINDOW_SIZE } from '@styles/styles';

const CardItem = ({ item, openSelection, selectionOpened, animation, index, setIndexes, selectedIndexes }) => {
  const navigation = useNavigation();

  const [selected, setSelected] = useState(false)

  useEffect(() => {
    if (!selectionOpened) {
      setSelected(false)
    }
  }, [selectionOpened])

  useEffect(() => {
    if (selected && !selectedIndexes.includes(index)) {
      setIndexes(indexes => [
        ...indexes,
        index
      ])
    } else {
      setIndexes(indexes => indexes.filter((value) => value !== index))
    }
  }, [selected])

  const width = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [WINDOW_SIZE.width - 50, WINDOW_SIZE.width - 130]
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        !selectionOpened ? navigation.navigate('Recording Details', { recording: item }) : setSelected(x => !x)
      }}
      onLongPress={() => {
        openSelection()
        setSelected(true)
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Animated.View style={[styles.cardItemContainer, { width }]}>
          <Text style={styles.cardItemTextStyle}>{item.recordingName}</Text>
          <Icon name={'rightcircle'} size={24} color={'#464646'} />
        </Animated.View>
        <TouchableWithoutFeedback onPress={() => setSelected(x => !x)} >
          <Animated.View style={{
            position: 'absolute', right: 26, bottom: 33, opacity: animation, transform: [{
              scale: animation
            }]
          }}>
            <Feather name={selected ? 'check-circle' : 'circle'} size={24} color={'black'} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default CardItem;
