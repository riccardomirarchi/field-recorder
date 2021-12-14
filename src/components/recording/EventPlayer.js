import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Animated,
  Text,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import styles, {utilsStyles, SCREEN_SIZE} from '@styles/styles';
import PlayerComponent from '@components/recordingDetails/playerComponent';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/AntDesign';
import {Audio} from 'expo-av';
import Input from '@components/common/Input';

const EventPlayer = ({event, opened}) => {
  useEffect(() => {
    if (opened) {
      bootstrapAudio();
    } else {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    }
  }, [opened]);

  const [eventTitle, setTitle] = useState(event?.title);
  const [description, setDescription] = useState(event?.description);
  const [isLoading, setIsLoading] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [soundObject, setSoundObject] = useState();
  const [error, setError] = useState();
  const descriptionInput = useRef();

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

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setError(e);
      setIsLoading(false);
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
      await soundObject.playFromPositionAsync(event?.millisFromBeginning);
      console.log('started listening');
    } catch (e) {
      console.log('error', e);
    }
  };

  const closeAndSave = () => {
    const newEvents = markedEvents;
    newEvents[index] = {
      title: eventTitle,
      millisFromBeginning: event?.millisFromBeginning,
      description,
    };
    setMarkedEvents(newEvents);
    setModalVisible(false);
    soundObject.unloadAsync();
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
    if (position === undefined) {
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
      <View style={[utilsStyles.mv25, utilsStyles.ph25]}>
        <Input
          placeholder={'Event title'}
          onChangeText={setTitle}
          value={eventTitle}
          onSubmitEditing={() => descriptionInput.current.focus()}
        />
        <Input
          placeholder={'Description'}
          onChangeText={setDescription}
          value={description}
          ref={descriptionInput}
          multiline={true}
        />
      </View>
    </View>
  );
};

export default EventPlayer;
