import React, {useRef, useState, useContext, useEffect} from 'react';
import {
  Platform,
  View,
  Animated,
  FlatList,
  Button,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import RecordButton from '@components/recording/RecordButton';
import ImageComponent from '@components/recording/ImageComponent';
import Geolocation from 'react-native-geolocation-service';
import CompassHeading from 'react-native-compass-heading';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {Audio} from 'expo-av';
import {
  RecordingsContext,
  recordingOptions,
  formatMillis,
} from '@utils/recordings';
import flatlistContainerStyle from '@styles/styles';
import EventCardItem from '@components/recording/EventCardItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import CustomMicOffIcon from '@navigation/CustomMicOffIcon';
import {requestPermissions} from '@utils/permissions';

const Recording = ({navigation}) => {
  const focused = useIsFocused();

  const {
    utils: {ADD_NEW_RECORDING, ADD_WAITING_RECORDING, REMOVE_WAITING_RECORDING},
    state: {recordings, hasWaitingRec},
  } = useContext(RecordingsContext);

  // reset the state when recording is deleted before saving
  useEffect(() => {
    if (!hasWaitingRec && audioUri !== undefined) resetState();
  }, [hasWaitingRec]);

  // compass heading observer
  useEffect(() => {
    CompassHeading.start(3, ({heading}) => {
      console.log(heading, 'watching compass heading changes...');
      setCompassHeading(heading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  // geolocation observer
  useEffect(() => {
    const startLocationObserver = async () => {
      try {
        const permissionStatus = await requestPermissions();

        if (permissionStatus === 'granted') {
          Geolocation.watchPosition(position => {
            const {accuracy, latitude, longitude} = position.coords;
            console.log(
              {accuracy, latitude, longitude},
              'watching position changes...',
            );
            setCoords({accuracy, latitude, longitude});
          });

          return () => {
            Geolocation.clearWatch();
          };
        } else {
          setCoords(null);
          console.log('geolocation permissions not granted :(');
        }
      } catch (e) {
        console.log(e, 'error while asking location usage permission');
      }
    };

    startLocationObserver();
  });

  useEffect(() => {
    const canSaveRec = async () => {
      const canSaveRecording = JSON.parse(
        await AsyncStorage.getItem('saveRecordings'),
      );
      setCanSaveRecording(canSaveRecording);

      return canSaveRecording;
    };

    canSaveRec().then(canSave => {
      navigation.setOptions({
        ...Platform.select({
          android: {
            headerLeft: () => {
              // to do: check if it's rendered properly
              return (
                !canSave && (
                  <TouchableWithoutFeedback onPress={() => showMicOffAlert()}>
                    <View style={{left: 10, padding: 2, marginHorizontal: 10}}>
                      <Ionicon name={'mic-off'} size={26} color={'#8b0000'} />
                    </View>
                  </TouchableWithoutFeedback>
                )
              );
            },
          },
          ios: {
            headerLeft: () => {
              return (
                !canSave && (
                  <CustomMicOffIcon onPress={() => showMicOffAlert()} />
                )
              );
            },
          },
        }),
      });
    });
  }, [focused]);

  const showMicOffAlert = () => {
    Alert.alert(
      'Information',
      "This icon means that the audio file won't be saved in the device storage. If you want to keep the file you can change the setting in the Settings page.",
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

  const resetState = () => {
    console.log('resetting recording state...');
    setRecording(undefined);
    setInitialRecordingTimestamp();
    setAudioUri();
    setImageUri(null);
    setGeolocation(null);
    setOrientation(null);
    setMarkedEvents([]);
    setIsRecording(false);
    setPosition(0);
    setDuration(0);
  };

  const saveRecording = newRecording => {
    ADD_NEW_RECORDING(newRecording)
      .then(() => {
        Alert.alert('Success', 'You successfully saved a new recording!', [
          {
            text: 'Ok',
            onPress: () => REMOVE_WAITING_RECORDING(),
          },
          {
            text: 'View',
            onPress: () => {
              REMOVE_WAITING_RECORDING();
              navigation.jumpTo('LibraryStack', {
                screen: 'Library',
                params: {recording: newRecording},
              });
            },
          },
        ]);
      })
      .catch(e => console.log('error while saving new record', e));
  };

  // for the listeners
  const [compassHeading, setCompassHeading] = useState(null);
  const [coords, setCoords] = useState(null);

  const [recording, setRecording] = useState();
  const [canSaveRecording, setCanSaveRecording] = useState(true);
  const [initialRecordingTimestamp, setInitialRecordingTimestamp] = useState();
  const [audioUri, setAudioUri] = useState();
  const [imageUri, setImageUri] = useState(null);
  const [geolocation, setGeolocation] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [markedEvents, setMarkedEvents] = useState([]);
  const [duration, setDuration] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [position, setPosition] = useState(0); // will be used for showing elapsed time

  const animation = useRef(new Animated.Value(-160)).current;

  const animateIcon = metering => {
    if (metering === undefined || metering <= -160) {
      return;
    }
    Animated.spring(animation, {
      toValue: metering,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // to do: request at install
  const startRecording = async () => {
    // geolocation infos

    setGeolocation(coords);

    // compass heading infos
    setOrientation(compassHeading);

    // audio
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const progressUpdateIntervalMillis = 200;

      const {recording} = await Audio.Recording.createAsync(
        await recordingOptions(),
        onRecordingStatusUpdate,
        progressUpdateIntervalMillis,
      );

      console.log('Started recording..');

      setInitialRecordingTimestamp(new Date().toJSON());
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const onRecordingStatusUpdate = ({metering, durationMillis, isRecording}) => {
    animateIcon(metering);
    setIsRecording(isRecording);
    setPosition(durationMillis);
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    setRecording(undefined);
    const status = await recording.stopAndUnloadAsync();
    setDuration(status.durationMillis);
    const uri = recording.getURI();
    setAudioUri(uri);
    console.log('Recording stopped and stored tmp at', uri);
    animateIcon(-159);

    if (!hasWaitingRec)
      ADD_WAITING_RECORDING(`Recording ${recordings.length + 1}`);
  };

  const markEvent = async () => {
    if (!isRecording) {
      Alert.alert(
        'Attention',
        "You can't mark an event while you're not recording! Start a rec and have fun!",
      );
      return;
    }

    try {
      const {durationMillis} = await recording.getStatusAsync();

      setMarkedEvents(events => [
        ...events,
        {
          title: `Event n°${events.length + 1}`,
          description: null,
          millisFromBeginning: durationMillis,
          position: coords,
          compassHeading,
        },
      ]);
    } catch (e) {
      console.log('error from mark event', e);
    }
  };

  const _renderItem = ({item, index}) => {
    return (
      <EventCardItem
        item={item}
        duration={duration}
        isRecording={isRecording}
        audioUri={audioUri}
        index={index}
        setMarkedEvents={setMarkedEvents}
      />
    );
  };

  return (
    <FlatList
      data={markedEvents}
      contentContainerStyle={flatlistContainerStyle.container}
      ListHeaderComponent={
        <View>
          <View style={[flatlistContainerStyle.itemContainer, {paddingTop: 0}]}>
            <ImageComponent
              setImageUri={setImageUri}
              imageUri={imageUri}
              ADD_WAITING_RECORDING={ADD_WAITING_RECORDING}
            />
          </View>
          <View style={flatlistContainerStyle.itemContainer}>
            <RecordButton
              onPress={() =>
                !isRecording ? startRecording() : stopRecording()
              }
              animation={animation}
              isRecording={isRecording}
              audioUri={audioUri}
            />
          </View>
          <View style={flatlistContainerStyle.itemContainer}>
            <Animated.Text style={{fontSize: 18, color: 'gray'}}>
              {formatMillis(position)}
            </Animated.Text>
          </View>
          <View style={flatlistContainerStyle.itemContainer}>
            <Button
              onPress={() => markEvent()}
              disabled={!isRecording}
              title={'Mark Event'}
            />
          </View>
        </View>
      }
      renderItem={_renderItem}
      ListFooterComponent={
        <View style={flatlistContainerStyle.itemContainer}>
          <Button
            disabled={!audioUri}
            onPress={() => {
              saveRecording({
                recordingName: hasWaitingRec,
                markedEvents,
                duration,
                initialRecordingTimestamp,
                geolocation,
                orientation,
                audioUri,
                imageUri,
              });
            }}
            title={canSaveRecording ? 'Save Recording' : 'Save'}
          />
        </View>
      }
    />
  );
};
export default Recording;
