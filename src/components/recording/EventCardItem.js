import React, {useRef, useState} from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  View,
  Alert,
} from 'react-native';
import flatlistContainerStyle, {WINDOW_SIZE} from '@styles/styles';
import Icon from 'react-native-vector-icons/AntDesign';
import EventPlayer from './EventPlayer';
import {formatMillis} from '@utils/recordings';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const EventCardItem = ({
  item,
  duration,
  isRecording,
  audioUri,
  index,
  setMarkedEvents,
}) => {
  const [opened, setOpened] = useState(false);
  const [selectionActive, setSelection] = useState(false);
  const openingAnimation = useRef(new Animated.Value(0)).current;

  const selectAnimation = useRef(new Animated.Value(0)).current;

  const alertToDeleteEvent = () => {
    Alert.alert(
      'Attention',
      `Are you sure you want to delete the selected event?`,
      [
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => deleteEvent(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const deleteEvent = () => {
    setMarkedEvents(events => events.filter(event => event !== item));
    closeSelectionDialog(0);
  };

  const closeSelectionDialog = (timing = 200) => {
    Animated.timing(selectAnimation, {
      toValue: 0,
      useNativeDriver: false,
      duration: timing,
    }).start(() => setSelection(false));
  };

  const openSelectionDialog = () => {
    compressEvent();

    Animated.timing(selectAnimation, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200,
    }).start(() => setSelection(true));
  };

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
    outputRange: [55, 250],
  });

  const transform = [
    {
      rotate: openingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg'],
      }),
    },
  ];

  const width = selectAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [WINDOW_SIZE.width - 50, WINDOW_SIZE.width - 130],
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        opened ? compressEvent() : selectionActive ? null : expandEvent();
      }}
      onLongPress={() =>
        selectionActive ? closeSelectionDialog() : openSelectionDialog()
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Animated.View
          style={[
            flatlistContainerStyle.cardItemContainer,
            {
              height,
              width,
            },
          ]}>
          <View style={[flatlistContainerStyle.innerViewStyle]}>
            <Text
              style={[
                flatlistContainerStyle.cardItemTextStyle,
                {paddingTop: 3},
              ]}>
              {`Marked at ${formatMillis(item.millisFromBeginning)}`}
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

          {/* inner event player */}
          <Animated.View
            style={{
              opacity: openingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-5, 1],
              }),
              height: openingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 180],
              }),
              zIndex: openingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-2, 1],
              }),
              marginTop: 40,
              marginLeft: '-1.4%',
            }}>
            <EventPlayer
              event={item}
              opened={opened}
              duration={duration}
              isRecording={isRecording}
              audioUri={audioUri}
              index={index}
              setMarkedEvents={setMarkedEvents}
            />
          </Animated.View>
        </Animated.View>

        {/* circle */}
        <TouchableWithoutFeedback onPress={() => alertToDeleteEvent()}>
          <Animated.View
            style={{
              position: 'absolute',
              right: 21,
              bottom: 25,
              opacity: selectAnimation,
              transform: [
                {
                  scale: selectAnimation,
                },
              ],
            }}>
            <Icon name={'delete'} size={24} color={'#8b0000'} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EventCardItem;
