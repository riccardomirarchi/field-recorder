import React, { useRef, useState } from 'react'
import { Animated, TouchableWithoutFeedback, Text, View } from 'react-native'
import flatlistContainerStyle from '@styles/styles';
import Icon from 'react-native-vector-icons/AntDesign';
import EventPlayer from './EventPlayer';

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

const EventCardItem = ({ item }) => {
  const [opened, setOpened] = useState(false)
  const openingAnimation = useRef(new Animated.Value(0)).current;

  const expandEvent = () => {
    Animated.spring(openingAnimation, {
      toValue: 1,
      friction: 10,
      useNativeDriver: false,
    }).start(() => setOpened(true));
  }

  const compressEvent = () => {
    Animated.spring(openingAnimation, {
      toValue: 0,
      friction: 10,
      useNativeDriver: false,
    }).start(() => setOpened(false));
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        opened ? compressEvent() : expandEvent()
      }}>
      <Animated.View
        style={[
          flatlistContainerStyle.cardItemContainer,
          {
            height: openingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [55, 200]
            }),
          },
        ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, position: 'absolute', left: 20, right: 20, top: 15 }}>
          <Text style={flatlistContainerStyle.cardItemTextStyle}>
            {item.title}
          </Text>

          <AnimatedIcon name={'downcircle'} size={24} style={{
            color: 'gray', transform: [{
              rotate: openingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-180deg']
              })
            }]
          }} />
        </View>
        <Animated.View style={{ opacity: openingAnimation }}>
          <EventPlayer />
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default EventCardItem
