import React, {useRef, useState, useEffect} from 'react';
import {View, Animated, Alert} from 'react-native';
import {WINDOW_SIZE} from '@styles/styles';
import PlayerComponent from '@components/recordingDetails/playerComponent';

import {Audio} from 'expo-av';
import Input from '@components/common/Input';
import {getPlaybackOffset} from '../../utils/recordings';

const EventPlayer = ({
  event,
  opened,
  duration,
  isRecording,
  audioUri,
  index,
  setMarkedEvents,
}) => {
  useEffect(() => {
    if (opened && !isRecording) {
      bootstrapAudio();
    } else {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    }
  }, [opened, isRecording]);

  useEffect(() => {
    const getOffset = async () => {
      setPlaybackOffset(await getPlaybackOffset());
    };

    getOffset();
  }, []);

  const [playbackOffset, setPlaybackOffset] = useState(0);

  const [eventTitle, setTitle] = useState(event?.title);
  const [description, setDescription] = useState(event?.description);
  const animation = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [soundObject, setSoundObject] = useState();
  const descriptionInput = useRef();

  const updateEvents = () => {
    setMarkedEvents(events => {
      events[index].title = eventTitle;
      events[index].description = description;

      return events;
    });
  };

  const bootstrapAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const {sound: soundObject} = await Audio.Sound.createAsync(
        {uri: audioUri},
        {
          progressUpdateIntervalMillis: 80,
          positionMillis: event?.millisFromBeginning,
        },
      );

      soundObject.setOnPlaybackStatusUpdate(playbackStatus =>
        _onPlaybackStatusUpdate(playbackStatus, soundObject),
      );

      setSoundObject(soundObject);
    } catch (e) {
      console.log(e);
    }
  };

  const _onPlaybackStatusUpdate = async (playbackStatus, soundObject) => {
    setPlaying(playbackStatus.isPlaying && !playbackStatus.isBuffering);

    setPosition(playbackStatus.positionMillis);

    animateTimeline(playbackStatus.positionMillis);

    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      await soundObject.setStatusAsync({
        shouldPlay: false,
        positionMillis: event?.millisFromBeginning,
      });
      animateTimeline(event?.millisFromBeginning);
    }
  };

  const listenRecording = async () => {
    try {
      const position = event?.millisFromBeginning - playbackOffset * 1000;

      await soundObject.playFromPositionAsync(position <= 0 ? 0 : position);
      console.log('started listening');
    } catch (e) {
      console.log('error', e);
    }
  };

  const stopAndSetToEvent = async () => {
    try {
      await soundObject.setStatusAsync({
        shouldPlay: false,
        positionMillis: event?.millisFromBeginning,
      });
      console.log('paused recording');
    } catch (e) {
      console.log('error', e);
    }
  };

  const animateTimeline = position => {
    if (position === undefined || position <= 0) {
      return;
    }
    Animated.timing(animation, {
      toValue: position,
      duration: position === 0 ? 500 : 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View>
      <PlayerComponent
        playing={playing}
        animation={animation}
        onPress={() => (playing ? stopAndSetToEvent() : listenRecording())}
        onPressDisabled={() =>
          Alert.alert(
            'Attention',
            'You cannot play this event because the recording is still going. Stop the recording and come back!',
          )
        }
        disabled={isRecording}
        position={position}
        duration={duration}
        fromEvent={true}
        style={{
          width: WINDOW_SIZE.width / 1.36,
          playerWidth: WINDOW_SIZE.width / 2.4,
        }}
      />

      <Input
        placeholder={'Event title'}
        onChangeText={setTitle}
        value={eventTitle}
        onSubmitEditing={() => descriptionInput.current.focus()}
        editable={opened}
        onEndEditing={() => updateEvents()}
      />
      <Input
        placeholder={'Description'}
        onChangeText={setDescription}
        value={description}
        ref={descriptionInput}
        editable={opened}
        onEndEditing={() => updateEvents()}
      />
    </View>
  );
};

export default EventPlayer;
