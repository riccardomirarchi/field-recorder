import React, {useState, useRef, useEffect} from 'react';
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

const EventDetails = ({
  event,
  modalVisible,
  audioUri,
  duration,
  setMarkedEvents,
  setModalVisible,
  markedEvents,
  index,
}) => {
  useEffect(() => {
    if (event && audioUri) {
      bootstrapAudio();
      setTitle(event.title);
      setDescription(event.Description);
    }
  }, [event, audioUri]);

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

  const animateTimeline = position => {
    if (position === undefined) return;
    Animated.timing(animation, {
      toValue: position,
      duration: position === 0 ? 500 : 80,
      useNativeDriver: true,
    }).start();
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

  const [eventTitle, setTitle] = useState(event?.title);
  const [description, setDescription] = useState(event?.description);
  const [isLoading, setIsLoading] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [soundObject, setSoundObject] = useState();
  const [error, setError] = useState();
  const descriptionInput = useRef();

  const listenRecording = async () => {
    try {
      await soundObject.playFromPositionAsync(event?.millisFromBeginning);
      console.log('started listening');
    } catch (e) {
      console.log('error', e);
    }
  };

  return (
    <Modal visible={modalVisible} animationType={'slide'}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        enabled>
        <TouchableWithoutFeedback onPress={() => closeAndSave()}>
          <View
            style={[styles.itemContainer, utilsStyles.pv25, utilsStyles.pt40]}>
            <Icon name={'down'} color={'gray'} size={30} />
          </View>
        </TouchableWithoutFeedback>
        {isLoading ? (
          <Spinner visible={isLoading} textContent={'Loading...'} />
        ) : error ? (
          <View style={styles.container}>
            <Text>
              An error occured. It was not possible lo load the audio file.
            </Text>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{height: SCREEN_SIZE.height}}>
              <View style={[styles.itemContainer, utilsStyles.pv25]}>
                <PlayerComponent
                  playing={playing}
                  animation={animation}
                  onPress={() =>
                    playing ? stopAndSetToEvent() : listenRecording()
                  }
                  position={position}
                  duration={duration}
                  fromEvent={true}
                />
              </View>
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
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EventDetails;
