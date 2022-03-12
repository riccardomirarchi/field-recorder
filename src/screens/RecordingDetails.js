import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  FlatList,
  Text,
  Button,
  Animated,
  Alert,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Audio} from 'expo-av';
import PhotoModal from '@components/recordingDetails/photoModal';
import InfoModal from '@components/recordingDetails/InfoModal';
import PlayerComponent from '@components/recordingDetails/playerComponent';
import DeleteButton from '@components/recordingDetails/deleteButton';
import Icon from 'react-native-vector-icons/AntDesign';
import styles from '@styles/styles';
import {pathToRecordingsFolder, RecordingsContext} from '@utils/recordings';
import EventItemCard from '@components/recordingDetails/EventItemCard';
import {useIsFocused} from '@react-navigation/native';
import CustomIosHeaderIcon from '@navigation/CustomIosHeaderIcon';

const RecordingDetails = ({route, navigation}) => {
  const {
    state: {settings},
  } = useContext(RecordingsContext);

  const {
    params: {recording},
  } = route;

  const isFocused = useIsFocused();

  useEffect(() => {
    navigation.setOptions({
      ...Platform.select({
        android: {
          headerRight: () => (
            <TouchableWithoutFeedback onPress={async () => showRecordingInfo()}>
              <View style={{marginRight: 20}}>
                <Icon name={'infocirlce'} size={24} color={'#fff'} />
              </View>
            </TouchableWithoutFeedback>
          ),
        },
        ios: {
          headerRight: () => (
            <CustomIosHeaderIcon
              onPress={() => showRecordingInfo()}
              icon={Icon}
              iconName={'infocirlce'}
              iconSize={24}
              iconColor={'#fff'}
              additionalStyle={{bottom: 22}}
            />
          ),
        },
      }),
    });
  }, []);

  useEffect(() => {
    // performance improvement: when unfocusing screen the audio buffer is removed from memory
    //  will be reloaded only if the screen is focused again
    if (!isFocused && soundObject) soundObject.unloadAsync();

    if (recording.audioUri) bootstrapAudio();
    else setIsLoading(false);
  }, [isFocused]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [soundObject, setSoundObject] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;
  const [highlighted, setHighlighted] = useState();

  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

  const showRecordingInfo = () => {
    setInfoModalVisible(true);
  };

  const bootstrapAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const {sound: soundObject} = await Audio.Sound.createAsync(
        {uri: pathToRecordingsFolder + recording.audioUri},
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

  const highlightEvent = position => {
    if (!position) return;
    recording.markedEvents.forEach(event => {
      if (
        event.millisFromBeginning >= position - 80 &&
        event.millisFromBeginning <= position + 80
      ) {
        if (highlighted == event) return;
        setHighlighted(event);
        return;
      }
    });
  };

  const _onPlaybackStatusUpdate = async (playbackStatus, soundObject) => {
    setPlaying(playbackStatus.isPlaying && !playbackStatus.isBuffering);

    setPosition(playbackStatus.positionMillis);

    animateTimeline(playbackStatus.positionMillis);

    highlightEvent(playbackStatus.positionMillis);

    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      await soundObject.setStatusAsync({shouldPlay: false, positionMillis: 0});
      animateTimeline(0);
      setHighlighted();
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
      const position = millis - settings.playbackOffset * 1000;

      await soundObject.playFromPositionAsync(position <= 0 ? 0 : position);
      console.log(
        'started listening event from ',
        millis,
        'with',
        settings.playbackOffset,
        'seconds of offset',
      );
    } catch (e) {
      console.log('error', e);
    }
  };

  const _renderItem = ({item}) => {
    return (
      <EventItemCard
        item={item}
        onPress={() =>
          recording.audioUri
            ? listenFromEvent(item.millisFromBeginning)
            : showNoRecordingAlert()
        }
        highlighted={highlighted}
      />
    );
  };

  const showNoRecordingAlert = () => {
    Alert.alert(
      'Attention',
      'This recording does not contain any audio file. If you want to change this setting go to Settings page.',
      [
        {text: 'Cancel'},
        {
          text: 'Go to Settings',
          onPress: () => navigation.jumpTo('SettingsStack'),
          style: 'cancel',
        },
      ],
    );
  };

  if (isLoading)
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={'grey'} size={'large'} />
      </View>
    );

  if (error)
    return (
      <View style={[styles.container]}>
        <Text style={{color: '#4f4f4f', textAlign: 'center'}}>
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
          <View style={{alignItems: 'center', flex: 1, paddingTop: 30}}>
            <Text style={{color: '#4f4f4f'}}>
              You have marked no events in this timeline.
            </Text>
          </View>
        );
      }}
      ListHeaderComponent={
        <View>
          <InfoModal
            modalVisible={isInfoModalVisible}
            setModalVisible={setInfoModalVisible}
            recording={recording}
          />
          <View style={styles.itemContainer}>
            <PlayerComponent
              playing={playing}
              animation={animation}
              onPress={() => (!playing ? listenRecording() : pauseRecording())}
              position={position}
              duration={recording.duration}
              disabled={!recording.audioUri}
              onPressDisabled={showNoRecordingAlert}
            />
          </View>
          <View style={[styles.itemContainer, {paddingTop: 0}]}>
            {recording.imageUri && (
              <>
                <Button
                  onPress={() => setModalVisible(true)}
                  title={'Show Photo'}
                />
                <PhotoModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  imageUri={recording.imageUri}
                />
              </>
            )}
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
