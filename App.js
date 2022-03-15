import 'react-native-gesture-handler';
import React, {useEffect, useMemo, useReducer} from 'react';
import {LogBox} from 'react-native';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import {requestPermissions} from '@utils/permissions';

import {
  RecordingsContext,
  recordingsReducer,
  recordingsMemo,
} from '@utils/recordings';

// navigator module
import MainNavigator from '@navigation/navigator';

// temporary ignoring warning log from react-native-gesture-handler library
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

const App = () => {
  const initialState = {
    loading: true,
    recordings: [],
    hasWaitingRec: false, // if not false we store the name of the recording that will be saved
    settings: { // defaults settings, true stored settings will be fetched when the component is rendered with RETRIEVE_SETTINGS function
      stereoMode: true,
      highQuality: true,
      saveRecordings: true,
      playbackOffset: 0,
    },
  };

  useEffect(() => {
    const {RETRIEVE_RECORDINGS, RETRIEVE_SETTINGS} = recordingsContext;
    RETRIEVE_RECORDINGS();
    RETRIEVE_SETTINGS();

    requestPermissions();
  }, []);

  const [state, dispatch] = useReducer(recordingsReducer, initialState);

  const recordingsContext = useMemo(
    () => recordingsMemo(dispatch, state.recordings),
    [state.recordings],
  );

  if (state.loading) return null;

  return (
    <RecordingsContext.Provider value={{utils: recordingsContext, state}}>
      <MainNavigator />
    </RecordingsContext.Provider>
  );
};

export default connectActionSheet(App);
