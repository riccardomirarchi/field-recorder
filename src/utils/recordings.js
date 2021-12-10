import { createContext } from 'react';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RecordingsContext = createContext();

export const recordingsReducer = ({ recordings }, { type, payload }) => {
  switch (type) {
    case 'ADD_NEW_RECORDING':
      return {
        loading: false,
        recordings: [...recordings, payload],
      };
    case 'DELETE_RECORDING':
      return {
        loading: false,
        recordings: payload,
      };

    case 'RETRIEVE_RECORDINGS':
      return {
        loading: false,
        recordings: payload,
      };
  }
};

const options = {
  encoding: 'utf8',
};

export const pathToJSON = FileSystem.documentDirectory + 'recordingsInfo.json';

export const pathToRecordingsFolder =
  FileSystem.documentDirectory + 'Recordings/';

export const pathToImagesFolder = FileSystem.documentDirectory + 'Images/';

export const recordingsMemo = (dispatch, recordings) => ({
  RETRIEVE_RECORDINGS: async () => {
    // this function is called at the opening of the app
    // and is used to make sure that all of two main directories and json file
    // exists in the document path otherwise it will create them

    try {
      const recordings = await FileSystem.getInfoAsync(pathToRecordingsFolder);

      if (!recordings.exists) {
        await FileSystem.makeDirectoryAsync(pathToRecordingsFolder);
      }

      const images = await FileSystem.getInfoAsync(pathToImagesFolder);

      if (!images.exists) {
        await FileSystem.makeDirectoryAsync(pathToImagesFolder);
      }

      let payload = [];

      const json = await FileSystem.getInfoAsync(pathToJSON);

      if (!json.exists) {
        await FileSystem.writeAsStringAsync(
          pathToJSON,
          JSON.stringify([]),
          options,
        );
      } else {
        payload = JSON.parse(
          await FileSystem.readAsStringAsync(pathToJSON, options),
        );
      }
      dispatch({
        type: 'RETRIEVE_RECORDINGS',
        payload,
      });
    } catch (e) {
      console.log(e, 'error while getting folders info in file system');
    }
  },
  ADD_NEW_RECORDING: newRecording => {
    // this function moves the recording and the additional photo from the temporary cache dir
    // to the document directory of the app which contains a dedicated folder for both images and recordings
    // then it updates the json with all the new recordings' info and the state

    return new Promise(async (resolve, reject) => {
      const audioFileName = newRecording.audioUri.split('/').pop();
      let imageFileName = null;

      try {
        await FileSystem.moveAsync({
          from: newRecording.audioUri,
          to: pathToRecordingsFolder + audioFileName,
        });

        if (newRecording.imageUri) {
          imageFileName = newRecording.imageUri.split('/').pop();
          await FileSystem.copyAsync({
            from: newRecording.imageUri,
            to: pathToImagesFolder + imageFileName,
          });
        }

        const payload = Object.assign(newRecording, {
          imageUri: imageFileName ? imageFileName : null,
          audioUri: audioFileName,
        });

        await FileSystem.writeAsStringAsync(
          pathToJSON,
          JSON.stringify([...recordings, payload]),
          options,
        );

        dispatch({
          type: 'ADD_NEW_RECORDING',
          payload,
        });

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  DELETE_RECORDING: (recordingToBeDeleted, forceDelete) => {
    // this function takes an identifier and remove the recording with that id
    // both from the state and in the file system

    return new Promise(async (resolve, reject) => {
      const payload = recordings.filter(item => item !== recordingToBeDeleted);
      try {
        await FileSystem.deleteAsync(
          pathToRecordingsFolder + recordingToBeDeleted.audioUri,
          {
            idempotent: forceDelete,
          },
        );

        if (recordingToBeDeleted.imageUri)
          await FileSystem.deleteAsync(
            pathToImagesFolder + recordingToBeDeleted.imageUri,
            {
              idempotent: forceDelete,
            },
          );

        resolve();
      } catch (e) {
        if (forceDelete) resolve(e);
        reject(e);
      } finally {
        await FileSystem.writeAsStringAsync(
          pathToJSON,
          JSON.stringify(payload),
          options,
        );

        dispatch({
          type: 'DELETE_RECORDING',
          payload,
        });
      }
    });
  },
});

// low quality recording presets (default)
export const iosRecordingPreset = {
  extension: '.caf',
  audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 256000,
  linearPCMBitDepth: 16,
  linearPCMIsBigEndian: false,
  linearPCMIsFloat: false,
};

export const androidRecordingPreset = {
  extension: '.3gp',
  outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
  audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 256000,
};

export const recordingOptions = {
  isMeteringEnabled: true,
  android: androidRecordingPreset,
  ios: iosRecordingPreset,
};

export const formatMillis = millis => {
  let h = Math.floor(millis / 1000 / 60 / 60);
  let m = Math.floor((millis / 1000 / 60 / 60 - h) * 60);
  let s = Math.floor(((millis / 1000 / 60 / 60 - h) * 60 - m) * 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};
