import React, {useRef, useState, useContext, useEffect} from 'react';
import {View, Animated, FlatList, Button, Alert} from 'react-native';
import RecordButton from '@components/recording/RecordButton';
import ImageComponent from '@components/recording/ImageComponent';
import {CompassComponent} from '@components/recording/CompassComponent';
import Geolocation from 'react-native-geolocation-service';
import CompassHeading from 'react-native-compass-heading';

import {Audio} from 'expo-av';
import {
  RecordingsContext,
  recordingOptions,
  formatMillis,
} from '@utils/recordings';
import flatlistContainerStyle from '@styles/styles';
import EventCardItem from '@components/recording/EventCardItem';

import {requestPermissions} from '@utils/permissions';

const Recording = ({navigation}) => {
  const {
    utils: {ADD_NEW_RECORDING, ADD_WAITING_RECORDING, REMOVE_WAITING_RECORDING},
    state: {recordings, hasWaitingRec, settings},
  } = useContext(RecordingsContext);

  // reset the state when recording is discarded
  useEffect(() => {
    if (!hasWaitingRec && (audioUri !== undefined || imageUri !== null))
      resetState();
  }, [hasWaitingRec]);

  // compass heading observer
  useEffect(() => {
    CompassHeading.start(0, ({heading}) => {
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
          Geolocation.watchPosition(
            position => {
              const {accuracy, latitude, longitude} = position.coords;
              console.log(
                {accuracy, latitude, longitude},
                'watching position changes...',
              );
              setCoords({accuracy, latitude, longitude});
            },
            error => console.log(error),
            {
              enableHighAccuracy: true,
              distanceFilter: 50,
              showsBackgroundLocationIndicator: true,
            },
          );

          return () => {
            Geolocation.stopObserving();
          };
        } else {
          console.log('geolocation permissions not granted :(');
        }
      } catch (e) {
        console.log(e, 'error while asking location usage permission');
      }
    };

    startLocationObserver();
  }, []);

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
    ADD_NEW_RECORDING(newRecording, settings.saveRecordings)
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
  // ----
  const [compassHeading, setCompassHeading] = useState(null);
  const [coords, setCoords] = useState(null);
  // ----

  const [recording, setRecording] = useState();
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
      // interruption modes throw error with expo av in expo sdk version >= 45
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const progressUpdateIntervalMillis = 200;

      const {recording} = await Audio.Recording.createAsync(
        await recordingOptions(settings),
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
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <View style={[flatlistContainerStyle.itemContainer, {paddingTop: 0}]}>
            <ImageComponent
              setImageUri={setImageUri}
              imageUri={imageUri}
              ADD_WAITING_RECORDING={() =>
                ADD_WAITING_RECORDING(`Recording ${recordings.length + 1}`)
              }
            />
          </View>
          <View style={[flatlistContainerStyle.itemContainer, {paddingTop: 0}]}>
            <CompassComponent degrees={compassHeading} />
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
            title={settings.saveRecordings ? 'Save Recording' : 'Save'}
          />
        </View>
      }
    />
  );
};
export default Recording;
