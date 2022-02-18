import 'react-native-gesture-handler';
import React, {useEffect, useMemo, useReducer} from 'react';
import {useColorScheme, LogBox} from 'react-native';
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
  const initialRecordingState = {
    loading: true,
    recordings: [],
    hasWaitingRec: false,
  };

  useEffect(() => {
    const {RETRIEVE_RECORDINGS} = recordingsContext;
    RETRIEVE_RECORDINGS();

    requestPermissions();
  }, []);

  const [recordingsState, dispatch] = useReducer(
    recordingsReducer,
    initialRecordingState,
  );

  const recordingsContext = useMemo(
    () => recordingsMemo(dispatch, recordingsState.recordings),
    [recordingsState.recordings],
  );

  if (recordingsState.loading) return null;

  return (
    <RecordingsContext.Provider
      value={{utils: recordingsContext, state: recordingsState}}>
      <MainNavigator />
    </RecordingsContext.Provider>
  );
};

export default connectActionSheet(App);
