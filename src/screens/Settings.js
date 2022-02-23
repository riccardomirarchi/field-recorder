import React, {useState, useEffect, useRef} from 'react';
import {View, Switch, TextInput, Text, Alert, Animated} from 'react-native';
import styles from '@styles/styles';
import CardItem from '../settings/CardItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  useEffect(() => {
    const bootstrapOptions = async () => {
      try {
        setHighQuality(
          JSON.parse(await AsyncStorage.getItem('recordingQuality')),
        );
        setSaveRecordings(
          JSON.parse(await AsyncStorage.getItem('saveRecordings')),
        );
        setPlaybackOffset(
          JSON.parse(await AsyncStorage.getItem('playbackOffset')).toString(),
        );
        setStereoMode(JSON.parse(await AsyncStorage.getItem('stereoMode')));
      } catch (e) {
        console.log(e);
      }
    };
    bootstrapOptions();
  }, []);

  const toggleQuality = async () => {
    setHighQuality(!highQualityEnabled);
    await AsyncStorage.setItem(
      'recordingQuality',
      JSON.stringify(!highQualityEnabled),
    );
  };

  const toggleSaveRec = async () => {
    setSaveRecordings(!saveRecordingsEnabled);
    await AsyncStorage.setItem(
      'saveRecordings',
      JSON.stringify(!saveRecordingsEnabled),
    );
  };

  const saveOffsetValue = async value => {
    if (value !== '') {
      await AsyncStorage.setItem(
        'playbackOffset',
        JSON.stringify(parseInt(value)),
      );
    } else {
      await AsyncStorage.setItem('playbackOffset', JSON.stringify(0));
    }
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

  const toggleMode = async () => {
    setStereoMode(!stereoMode);
    await AsyncStorage.setItem('stereoMode', JSON.stringify(!stereoMode));
  };

  const opacity = useRef(new Animated.Value(1)).current;

  const [highQualityEnabled, setHighQuality] = useState(false);
  const [saveRecordingsEnabled, setSaveRecordings] = useState(false);
  const [playbackOffset, setPlaybackOffset] = useState('0');
  const [stereoMode, setStereoMode] = useState(false);

  useEffect(() => {
    if (!saveRecordingsEnabled && opacity) {
      console.log('ciao');
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [saveRecordingsEnabled]);

  return (
    <View style={styles.container}>
      <CardItem
        text={'Stereo'}
        rightElement={
          <Switch
            ios_backgroundColor="#808080"
            onValueChange={toggleMode}
            value={saveRecordingsEnabled ? stereoMode : false}
            disabled={saveRecordingsEnabled === false}
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
            value={saveRecordingsEnabled ? highQualityEnabled : false}
            disabled={saveRecordingsEnabled === false}
          />
        }
        style={{opacity}}
      />
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
        text={'Event Playback Offset'}
        rightElement={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 5,
            }}>
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={text => validateInput(text)}
              onEndEditing={({nativeEvent: {text}}) => saveOffsetValue(text)}
              value={playbackOffset}
              style={{
                marginHorizontal: 2,
              }}
              returnKeyType="go"
              textContentType="none"
              cancelButtonTitle="Cancel"
              placeholderTextColor={'#808080'}
            />
            <Text>secs</Text>
          </View>
        }
      />
    </View>
  );
};
export default Settings;
