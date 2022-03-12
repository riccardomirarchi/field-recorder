import React, {useState, useRef, useContext, useEffect} from 'react';
import {
  View,
  Switch,
  TextInput,
  Alert,
  Animated,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from '@styles/styles';
import CardItem from '../settings/CardItem';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RecordingsContext,
  pathToZippedFolder,
  getDirectorySpace,
  deleteDirecotoryOrFile,
} from '@utils/recordings';

const Settings = () => {
  const {
    utils: {UPDATE_SETTINGS},
    state: {settings},
  } = useContext(RecordingsContext);

  const toggleQuality = async () => {
    setHighQuality(!highQualityEnabled);
    await AsyncStorage.setItem(
      'highQuality',
      JSON.stringify(!highQualityEnabled),
    );
    UPDATE_SETTINGS({highQuality: !highQualityEnabled});
  };

  const toggleSaveRec = async () => {
    UPDATE_SETTINGS({saveRecordings: !saveRecordingsEnabled});
    setSaveRecordings(!saveRecordingsEnabled);
    await AsyncStorage.setItem(
      'saveRecordings',
      JSON.stringify(!saveRecordingsEnabled),
    );

    if (saveRecordingsEnabled) {
      setStereoMode(false);
      setHighQuality(false);

      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setStereoMode(settings.stereoMode);
      setHighQuality(settings.highQuality);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const saveOffsetValue = async value => {
    await AsyncStorage.setItem(
      'playbackOffset',
      JSON.stringify(value ? parseInt(value) : 0),
    );

    UPDATE_SETTINGS({playbackOffset: value || 0});
  };

  const toggleMode = async () => {
    setStereoMode(!stereoMode);
    await AsyncStorage.setItem('stereoMode', JSON.stringify(!stereoMode));

    UPDATE_SETTINGS({stereoMode: !stereoMode});
  };

  const validateInput = text => {
    if (/^\d+$/.test(text) || text === '') {
      setPlaybackOffset(text);
    } else {
      setPlaybackOffset(text.substring(0, text.length - 1));
      Alert.alert(
        'Attention',
        'This is the offset of the event playback expressed in seconds. This value must be numeric only. ',
      );
    }
  };

  const deleteCacheFiles = () => {
    Alert.alert(
      'Attention',
      `Are you sure you want to flush the cache and save ${cacheSize}?`,
      [
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () =>
            deleteDirecotoryOrFile(pathToZippedFolder).then(() =>
              setCacheSize('0 bytes'),
            ),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const focused = useIsFocused();

  useEffect(() => {
    getDirectorySpace(pathToZippedFolder).then(size => setCacheSize(size));
  }, [focused]);

  const [cacheSize, setCacheSize] = useState('0 bytes');

  const opacity = useRef(
    new Animated.Value(settings.saveRecordings ? 1 : 0.5),
  ).current;

  const [highQualityEnabled, setHighQuality] = useState(
    settings.saveRecordings ? settings.highQuality : false,
  );
  const [saveRecordingsEnabled, setSaveRecordings] = useState(
    settings.saveRecordings,
  );
  const [playbackOffset, setPlaybackOffset] = useState(
    settings.playbackOffset.toString(),
  );
  const [stereoMode, setStereoMode] = useState(
    settings.saveRecordings ? settings.stereoMode : false,
  );

  return (
    <View style={styles.container}>
      <CardItem
        text={'Save Recordings'}
        rightElement={
          <Switch
            ios_backgroundColor="#808080"
            onValueChange={toggleSaveRec}
            value={saveRecordingsEnabled}
          />
        }
      />
      <CardItem
        text={'Stereo'}
        rightElement={
          <Switch
            ios_backgroundColor="#808080"
            onValueChange={toggleMode}
            value={stereoMode}
            disabled={!settings.saveRecordings}
          />
        }
        style={{opacity}}
      />
      <CardItem
        text={'High Quality Recording'}
        rightElement={
          <Switch
            ios_backgroundColor="#808080"
            onValueChange={toggleQuality}
            value={highQualityEnabled}
            disabled={!settings.saveRecordings}
          />
        }
        style={{opacity}}
      />

      <CardItem
        text={'Event Playback Offset (in seconds)'}
        rightElement={
          <TextInput
            placeholder="0"
            keyboardType="number-pad"
            onChangeText={text => validateInput(text)}
            onEndEditing={({nativeEvent: {text}}) => saveOffsetValue(text)}
            value={playbackOffset}
            returnKeyType="go"
            textContentType="none"
            cancelButtonTitle="Cancel"
            placeholderTextColor={'#808080'}
          />
        }
      />
      <TouchableWithoutFeedback onPress={() => deleteCacheFiles()}>
        <View>
          <CardItem
            text={'Delete Cached Files'}
            textStyle={{
              color: 'rgba(139, 0, 0, 1)',
            }}
            rightElement={<Text>{`Size: ${cacheSize}`}</Text>}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
export default Settings;
