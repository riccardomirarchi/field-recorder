import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  Button,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Audio } from 'expo-av';
import PhotoModal from '@components/recordingDetails/photoModal';
import PlayerComponent from '@components/recordingDetails/playerComponent';
import DeleteButton from '@components/recordingDetails/deleteButton';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import styles from '@styles/styles';
import { pathToRecordingsFolder } from '@utils/recordings';
import Spinner from 'react-native-loading-spinner-overlay';

const RecordingDetails = ({ route }) => {
  const {
    params: { recording },
  } = route;

  const isFocused = useIsFocused();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [soundObject, setSoundObject] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFocused && soundObject) soundObject.unloadAsync();
  }, [isFocused]);

  useEffect(() => {
    bootstrapAudio();
  }, []);

  const bootstrapAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const { sound: soundObject } = await Audio.Sound.createAsync(
        { uri: pathToRecordingsFolder + recording.audioUri },
        {
          progressUpdateIntervalMillis: 80,
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

  const animateTimeline = position => {
    if (position === undefined) return;
    Animated.timing(animation, {
      toValue: position,
      duration: position === 0 ? 500 : 80,
      useNativeDriver: true,
    }).start();
  };

  const _onPlaybackStatusUpdate = async (playbackStatus, soundObject) => {
    setPlaying(playbackStatus.isPlaying && !playbackStatus.isBuffering);

    setPosition(playbackStatus.positionMillis);

    animateTimeline(playbackStatus.positionMillis);

    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      await soundObject.setStatusAsync({ shouldPlay: false, positionMillis: 0 });
      animateTimeline(0);
    }
  };

  const listenRecording = async () => {
    try {
      await soundObject.playAsync();
      console.log('started listening');
    } catch (e) {
      console.log('error', e);
    }
  };

  const pauseRecording = async () => {
    try {
      await soundObject.pauseAsync();
      console.log('paused recording');
    } catch (e) {
      console.log('error', e);
    }
  };

  const listenFromEvent = async millis => {
    try {
      await soundObject.playFromPositionAsync(millis - 10);
      console.log('started listening event from ', millis - 10);
    } catch (e) {
      console.log('error', e);
    }
  };

  const _renderItem = ({ item }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => listenFromEvent(item.millisFromBeginning)}>
        <View
          style={[
            styles.cardItemContainer,
            {
              height: 55,
              justifyContent: 'space-between',
            },
          ]}>
          <Text style={styles.cardItemTextStyle}>{item.title}</Text>

          <Icon name={'playcircleo'} size={24} color={'gray'} />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  if (isLoading)
    return <Spinner visible={isLoading} textContent={'Loading...'} />;

  if (error)
    return (
      <View style={styles.container}>
        <Text>
          An error occured. It was not possible lo load the audio file.
        </Text>
        <View style={styles.itemContainer}>
          <DeleteButton recording={recording} />
        </View>
      </View>
    );

  return (
    <FlatList
      data={recording.markedEvents}
      renderItem={_renderItem}
      keyExtractor={item => item.title}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => {
        return (
          <View style={{ alignItems: 'center', flex: 1, paddingTop: 30 }}>
            <Text>You have marked no events in this timeline.</Text>
          </View>
        );
      }}
      ListHeaderComponent={
        <View>
          <View style={styles.itemContainer}>
            <PlayerComponent
              playing={playing}
              animation={animation}
              onPress={() => (!playing ? listenRecording() : pauseRecording())}
              position={position}
              duration={recording.duration}
            />
          </View>
          <View style={styles.itemContainer}>
            <Button
              onPress={() => setModalVisible(true)}
              title={'Open Photo'}
            />
            <PhotoModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              imageUri={recording.imageUri}
            />
          </View>
        </View>
      }
      ListFooterComponent={
        <View style={styles.itemContainer}>
          <DeleteButton recording={recording} />
        </View>
      }
    />
  );
};

export default RecordingDetails;
