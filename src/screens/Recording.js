import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  Platform,
  View,
  Animated,
  PermissionsAndroid,
  FlatList,
  Button,
  ToastAndroid,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import RecordButton from '@components/recording/RecordButton';
import ImageComponent from '@components/recording/ImageComponent';
import Geolocation from 'react-native-geolocation-service';
import CompassHeading from 'react-native-compass-heading';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Audio } from 'expo-av';
import {
  RecordingsContext,
  recordingOptions,
  formatMillis,
} from '@utils/recordings';
import flatlistContainerStyle from '@styles/styles';
import CustomReloadIcon from '@navigation/CustomReloadIcon';
import EventCardItem from '@components/recording/EventCardItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import CustomMicOffIcon from '@navigation/CustomMicOffIcon';
import { requestPermissions } from '@utils/permissions';

export const hasGeolocationPermissionAndroid = async () => {
  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return 'granted';
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show('Location permission denied...', ToastAndroid.LONG);
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    ToastAndroid.show('Location permission revoked...', ToastAndroid.LONG);
  }

  return 'not granted';
};

const Recording = ({ navigation }) => {

  const focused = useIsFocused()

  useEffect(() => {

    const canSaveRec = async () => {

      const canSaveRecording = JSON.parse(await AsyncStorage.getItem('saveRecordings'))
      setCanSaveRecording(canSaveRecording)

      return canSaveRecording
    }

    canSaveRec().then(canSave => {
      navigation.setOptions({
        ...Platform.select({
          android: {
            headerRight: () => (
              <TouchableWithoutFeedback onPress={() => showAlertToReset()}>
                <View style={{ marginRight: 20 }}>
                  <Icon name={'reload1'} size={24} color={'#fff'} />
                </View>
              </TouchableWithoutFeedback>
            ),
            headerLeft: () => {
              // to do: check if it's rendered properly
              return (
                !canSave && (
                  <TouchableWithoutFeedback onPress={() => showMicOffAlert()}>
                    <View style={{ left: 10, padding: 2, marginHorizontal: 10 }} >
                      <Ionicon name={'mic-off'} size={26} color={'#8b0000'} />
                    </View>
                  </TouchableWithoutFeedback>
                )
              )
            }
          },
          ios: {
            headerRight: () => (
              <CustomReloadIcon onPress={() => showAlertToReset()} />
            ),
            headerLeft: () => {
              return (
                !canSave && (
                  <CustomMicOffIcon onPress={() => showMicOffAlert()} />
                )
              )
            }
          },
        }),
      });
    })
  }, [focused]);

  const showMicOffAlert = () => {
    Alert.alert('Information', 'This icon means that the audio file won\'t be saved in the device storage. If you want to keep the file you can change the setting in the Settings page.', [
      { text: 'Cancel' },
      { text: 'Go to Settings', onPress: () => navigation.jumpTo('SettingsStack'), style: 'cancel' },
    ]);
  }

  const showAlertToReset = () => {
    Alert.alert('Attention', 'You really want to discard the recording?', [
      { text: 'Proceed', onPress: () => resetState(), style: 'destructive' },
      { text: 'Cancel' },
    ]);
  };

  const {
    utils: { ADD_NEW_RECORDING },
    state: { recordings },
  } = useContext(RecordingsContext);

  const resetState = () => {
    setRecording(undefined);
    setInitialRecordingTimestamp();
    setAudioUri();
    setImageUri(null);
    setGeolocation(null);
    setOrientation(null);
    setMarkedEvents([]);
    setIsRecording(false);
    setPosition(0);
  };

  const saveRecording = newRecording => {
    ADD_NEW_RECORDING(newRecording)
      .then(() => {
        Alert.alert('Success', 'You successfully saved a new recording!', [
          {
            text: 'Ok',
            onPress: () => resetState(),
          },
          {
            text: 'View',
            onPress: () => {
              resetState();
              navigation.jumpTo('LibraryStack', {
                screen: 'Library',
                params: { recording: newRecording },
              });
            },
          },
        ]);
      })
      .catch(e => console.log('error while saving new record', e));
  };

  const [recording, setRecording] = useState();
  const [canSaveRecording, setCanSaveRecording] = useState(true)
  const [initialRecordingTimestamp, setInitialRecordingTimestamp] = useState();
  const [audioUri, setAudioUri] = useState();
  const [imageUri, setImageUri] = useState(null);
  const [geolocation, setGeolocation] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [markedEvents, setMarkedEvents] = useState([]);
  const [duration, setDuration] = useState();

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
    try {
      console.log('Requesting permissions...');

      const permissionStatus = await requestPermissions()

      if (permissionStatus === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            const { accuracy, latitude, longitude } = position.coords;
            setGeolocation({ accuracy, latitude, longitude });
          },
          error => {
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        console.log('geolocation permissions not granted :(');
      }
    } catch (e) {
      console.log(e, 'error while asking location usage permission');
    }

    // compass heading infos
    CompassHeading.start(0, ({ heading }) => {
      setOrientation(heading);
      CompassHeading.stop();
    });

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

      const { recording } = await Audio.Recording.createAsync(
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

  const onRecordingStatusUpdate = ({ metering, durationMillis, isRecording }) => {
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
      const status = await recording.getStatusAsync();

      setMarkedEvents(events => [
        ...events,
        {
          title: `Event n°${events.length + 1}`,
          description: null,
          millisFromBeginning: status.durationMillis,
        },
      ]);
    } catch (e) {
      console.log('error from mark event', e);
    }
  };

  const _renderItem = ({ item }) => {
    return <EventCardItem item={item} duration={duration} isRecording={isRecording} audioUri={audioUri} />;
  };

  {/* <EventDetails
        modalVisible={modalVisible}
        event={chosenEvent}
        audioUri={audioUri}
        duration={duration}
        setMarkedEvents={setMarkedEvents}
        setModalVisible={setModalVisible}
        index={eventIndex}
        markedEvents={markedEvents}
      /> */}

  return (
    <FlatList
      data={markedEvents}
      contentContainerStyle={flatlistContainerStyle.container}
      ListHeaderComponent={
        <View>
          <View
            style={[flatlistContainerStyle.itemContainer, { paddingTop: 0 }]}>
            <ImageComponent setImageUri={setImageUri} />
          </View>
          <View style={flatlistContainerStyle.itemContainer}>
            <RecordButton
              onPress={() =>
                !isRecording ? startRecording() : stopRecording()
              }
              animation={animation}
              isRecording={isRecording}
            />
          </View>
          <View style={flatlistContainerStyle.itemContainer}>
            <Animated.Text style={{ fontSize: 18, color: 'gray' }}>
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
        </View >
      }
      renderItem={_renderItem}
      ListFooterComponent={
        < View style={flatlistContainerStyle.itemContainer} >
          < Button
            disabled={!audioUri}
            onPress={() => {
              saveRecording({
                recordingName: `Recording ${recordings.length + 1}`,
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
        </View >
      }
    />
  );
};
export default Recording;
