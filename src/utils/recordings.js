import {createContext} from 'react';
import * as FileSystem from 'expo-file-system';
import {Audio} from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import {zip as zipFolder} from 'react-native-zip-archive';

export const RecordingsContext = createContext();

export const recordingsReducer = (
  {recordings, hasWaitingRec},
  {type, payload},
) => {
  switch (type) {
    case 'ADD_NEW_RECORDING':
      return {
        loading: false,
        recordings: [...recordings, payload],
        hasWaitingRec,
      };

    case 'DELETE_RECORDINGS':
      return {
        loading: false,
        recordings: payload,
        hasWaitingRec,
      };

    case 'RETRIEVE_RECORDINGS':
      return {
        loading: false,
        recordings: payload,
        hasWaitingRec,
      };
    case 'ADD_WAITING_RECORDING':
      return {
        loading: false,
        recordings,
        hasWaitingRec: payload.hasWaitingRec,
      };
    case 'REMOVE_WAITING_RECORDING':
      return {
        loading: false,
        recordings,
        hasWaitingRec: payload.hasWaitingRec,
      };
  }
};

const options = {
  encoding: 'utf8',
};

const shareOptions = {
  title: 'Share via',
};

export const pathToJSON = FileSystem.documentDirectory + 'recordings.json';

export const pathToRecordingsFolder =
  FileSystem.documentDirectory + 'Recordings/';

export const pathToImagesFolder = FileSystem.documentDirectory + 'Images/';

export const pathToZippedFolder = FileSystem.documentDirectory + 'Zipped/';

// get settings in storage
export const getRecordingQuality = async () =>
  JSON.parse(await AsyncStorage.getItem('recordingQuality'));

export const getSaveRecordings = async () =>
  JSON.parse(await AsyncStorage.getItem('saveRecordings'));

export const getPlaybackOffset = async () =>
  JSON.parse(await AsyncStorage.getItem('playbackOffset'));

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

      const zipped = await FileSystem.getInfoAsync(pathToZippedFolder);

      if (!zipped.exists) {
        await FileSystem.makeDirectoryAsync(pathToZippedFolder);
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

      const recordingQuality = await getRecordingQuality();
      const saveRecordings = await getSaveRecordings();
      const playbackOffset = await getPlaybackOffset();

      if (recordingQuality === null || recordingQuality === undefined)
        await AsyncStorage.setItem('recordingQuality', JSON.stringify(true));

      if (saveRecordings === null || saveRecordings === undefined)
        await AsyncStorage.setItem('saveRecordings', JSON.stringify(true));

      if (playbackOffset === null || playbackOffset === undefined)
        await AsyncStorage.setItem('playbackOffset', JSON.stringify(0));

      // here we take a look at the zipped file we have in the file system, if they have been created
      // since more than a month we delete them for getting more free space on the device.
      // this is not crucial, but helps saving space, another approach would be not to save the zipped
      // file in the document directory but in the cache directory, so they will be automatically deleted
      // but we won't have control over it. For now we delete them on our own.
      const zips = await FileSystem.readDirectoryAsync(pathToZippedFolder);

      const diffInMonths = (end, start) => {
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        return Math.round(timeDiff / (2e3 * 3600 * 365.25));
      };

      zips.forEach(async element => {
        const infos = await FileSystem.getInfoAsync(
          `${pathToZippedFolder}${element}`,
        );

        var d = new Date(0);
        d.setUTCSeconds(infos.modificationTime);

        if (diffInMonths(new Date(), d) > 1) {
          await FileSystem.deleteAsync(`${pathToZippedFolder}${element}`, {
            idempotent: true,
          });
        }
      });

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
      let audioFileName = null;
      let imageFileName = null;

      const saveRecordings = await getSaveRecordings();

      try {
        // if we can sav the file we move it in the right directory, otherwise we delete the file from the cache dir
        if (saveRecordings) {
          audioFileName = newRecording.audioUri.split('/').pop();
          await FileSystem.moveAsync({
            from: newRecording.audioUri,
            to: pathToRecordingsFolder + audioFileName,
          });
        } else {
          await FileSystem.deleteAsync(newRecording.audioUri, {
            idempotent: true,
          });
        }

        if (newRecording.imageUri) {
          imageFileName = newRecording.imageUri.split('/').pop();
          await FileSystem.copyAsync({
            from: newRecording.imageUri,
            to: pathToImagesFolder + imageFileName,
          });
        }

        const payload = Object.assign(newRecording, {
          imageUri: imageFileName,
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
  DELETE_RECORDINGS: (recordingsToBeDeleted, forceDelete) => {
    // this function takes an identifier and remove the recording with that id
    // both from the state and in the file system

    return new Promise(async (resolve, reject) => {
      const payload = recordings.filter(
        item => !recordingsToBeDeleted.includes(item),
      );

      try {
        for (const recording in recordingsToBeDeleted) {
          if (recording.audioUri)
            await FileSystem.deleteAsync(
              pathToRecordingsFolder + recording.audioUri,
              {
                idempotent: forceDelete,
              },
            );

          if (recording.imageUri)
            await FileSystem.deleteAsync(
              pathToImagesFolder + recording.imageUri,
              {
                idempotent: forceDelete,
              },
            );
        }

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
          type: 'DELETE_RECORDINGS',
          payload,
        });
      }
    });
  },
  EXPORT_RECORDINGS: async (recordings, setIsProcessingExport) => {
    // this function takes a json with the recording info as a param, copy the audio
    // and image file (if present) to a newly created folder,then it zip this folder
    // and prompt the user to share it. finally it deletes the temporary unzipped
    // folder and keeps the zipped one for later use

    setIsProcessingExport(true);

    const getZippedUrl = async recording => {
      let tmpRecording = {...recording};

      // we must remove the : from the path, since stupid android file system crashes...
      const folderPath =
        pathToZippedFolder +
        `${tmpRecording.initialRecordingTimestamp.split(':').join('_')}`;

      // we check if the zipped file already exists in the file system
      // if not we create a new one, otherwise we skip and share
      const zip = await FileSystem.getInfoAsync(`${folderPath}.zip`);

      if (zip.exists) {
        console.log(
          `zipped file alreay exists at path ${folderPath}.zip, sharing directly..`,
        );

        return `${folderPath}.zip`;
      }

      try {
        // we create a folder named with the timestamp, so it'll be unique (luckily)
        await FileSystem.makeDirectoryAsync(folderPath, {
          intermediates: true,
        });

        // we copy the audio file (if present) to the folder just created
        if (tmpRecording.audioUri)
          await FileSystem.copyAsync({
            from: pathToRecordingsFolder + tmpRecording.audioUri,
            to: `${folderPath}/${tmpRecording.audioUri}`,
          });

        // we copy the image file (if present) to the folder just created
        if (tmpRecording.imageUri) {
          await FileSystem.copyAsync({
            from: pathToImagesFolder + tmpRecording.imageUri,
            to: `${folderPath}/${tmpRecording.imageUri}`,
          });
        }

        // remove useless info from exported json
        delete tmpRecording.audioUri;
        delete tmpRecording.imageUri;

        // we create the json file with all the infos.
        await FileSystem.writeAsStringAsync(
          `${folderPath}/Info.json`,
          JSON.stringify(tmpRecording),
          options,
        );

        // we zip the folder with all the infos
        await zipFolder(folderPath, `${folderPath}.zip`);
      } catch (e) {
        console.log(e, 'error while creating zip file');
        setIsProcessingExport(false);
      } finally {
        // in the end we delete the newly created folder
        // just the folder, not the zipped file
        await FileSystem.deleteAsync(folderPath, {
          idempotent: true,
        });
      }

      return `${folderPath}.zip`;
    };

    // this function return an array of url, each one of them pointing to the path of the zipped file in the fs
    const getUrls = async () => {
      return Promise.all(
        recordings.map(async recording => await getZippedUrl(recording)),
      );
    };

    // in the end we share the files
    try {
      setTimeout(() => setIsProcessingExport(false), 500);

      await Share.open({
        ...shareOptions,
        urls: await getUrls(),
      });
    } catch (e) {
      console.log(e, 'error while sharing file');
    }
  },
  RENAME_RECORDING: async (newRecordingName, recordingToBeRenamed) => {
    // this is an 'in place' change, so the state will be updated automatically, no need to dispatch
    // an action and update the state manually, we only need to update the recordings in the fs
    recordingToBeRenamed.recordingName = newRecordingName;

    await FileSystem.writeAsStringAsync(
      pathToJSON,
      JSON.stringify(recordings),
      options,
    );
  },
  ADD_WAITING_RECORDING: () => {
    dispatch({
      type: 'ADD_WAITING_RECORDING',
      payload: {hasWaitingRec: true},
    });
  },
  REMOVE_WAITING_RECORDING: () => {
    dispatch({
      type: 'REMOVE_WAITING_RECORDING',
      payload: {hasWaitingRec: false},
    });
  },
});

// low quality recording presets (default)
const iosRecordingPreset = {
  extension: '.caf',
  audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 128000,
  linearPCMBitDepth: 16,
  linearPCMIsBigEndian: false,
  linearPCMIsFloat: false,
};

const androidRecordingPreset = {
  extension: '.m4a',
  outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
  audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 96000,
};

// high quality rec presets
const iosRecordingPresetHighQuality = {
  extension: '.caf',
  audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 320000,
  linearPCMBitDepth: 16,
  linearPCMIsBigEndian: false,
  linearPCMIsFloat: false,
};

const androidRecordingPresetHighQuality = {
  extension: '.m4a',
  outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
  audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 320000,
};

export const LOW_QUALITY_PRESETS = {
  android: androidRecordingPreset,
  ios: iosRecordingPreset,
};

export const HIGH_QUALITY_PRESETS = {
  android: androidRecordingPresetHighQuality,
  ios: iosRecordingPresetHighQuality,
};

export const recordingOptions = async () => ({
  isMeteringEnabled: true, // this is crucial for ui metering animations
  ...(JSON.parse(await AsyncStorage.getItem('recordingQuality')) === true
    ? HIGH_QUALITY_PRESETS
    : LOW_QUALITY_PRESETS),
});

export const formatMillis = millis => {
  let h = Math.floor(millis / 1000 / 60 / 60);
  let m = Math.floor((millis / 1000 / 60 / 60 - h) * 60);
  let s = Math.floor(((millis / 1000 / 60 / 60 - h) * 60 - m) * 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};
