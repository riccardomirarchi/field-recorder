import React, { useRef, useState } from 'react';
import { Animated, TouchableWithoutFeedback, Text, View } from 'react-native';
import flatlistContainerStyle from '@styles/styles';
import Icon from 'react-native-vector-icons/AntDesign';
import EventPlayer from './EventPlayer';
import { formatMillis } from '@utils/recordings';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const EventCardItem = ({ item, duration, isRecording, audioUri }) => {
  const [opened, setOpened] = useState(false);
  const openingAnimation = useRef(new Animated.Value(0)).current;

  const expandEvent = () => {
    Animated.spring(openingAnimation, {
      toValue: 1,
      friction: 10,
      useNativeDriver: false,
    }).start(() => setOpened(true));
  };

  const compressEvent = () => {
    Animated.spring(openingAnimation, {
      toValue: 0,
      friction: 10,
      useNativeDriver: false,
    }).start(() => setOpened(false));
  };

  const height = openingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [55, 200],
  });

  const transform = [
    {
      rotate: openingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg'],
      }),
    },
  ];

  return (
    <Animated.View
      style={[
        flatlistContainerStyle.cardItemContainer,
        {
          height,
        },
      ]}>
      <TouchableWithoutFeedback
        onPress={() => {
          opened ? compressEvent() : expandEvent();
        }}>
        <View style={flatlistContainerStyle.innerViewStyle}>
          <Text
            style={[flatlistContainerStyle.cardItemTextStyle, { paddingTop: 4 }]}>
            {`${item.title}  -  ${formatMillis(item.millisFromBeginning)}`}
          </Text>

          <AnimatedIcon
            name={'downcircle'}
            size={24}
            style={{
              color: 'gray',
              transform,
            }}
          />
        </View>
      </TouchableWithoutFeedback>
      <Animated.View style={{
        opacity: openingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-5, 1]
        }),
        position: 'absolute',
        zIndex: openingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-1, 1]
        }),
        height: openingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100]
        }),
        backgroundColor: 'blue',
        paddingVertical: 0

      }}>
        <EventPlayer event={item} opened={opened} duration={duration} isRecording={isRecording} audioUri={audioUri} />
      </Animated.View>
    </Animated.View>
  );
};

export default EventCardItem;
