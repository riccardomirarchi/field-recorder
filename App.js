import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useReducer } from 'react';
import { useColorScheme } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import {
  RecordingsContext,
  recordingsReducer,
  recordingsMemo,
} from '@utils/recordings';

// navigator module
import MainNavigator from '@navigation/navigator';

const App = () => {
  const initialRecordingState = {
    loading: true,
    recordings: [],
  };

  useEffect(() => {
    const { RETRIEVE_RECORDINGS } = recordingsContext;
    RETRIEVE_RECORDINGS();
  }, []);

  const [recordingsState, dispatch] = useReducer(
    recordingsReducer,
    initialRecordingState,
  );

  const recordingsContext = useMemo(
    () => recordingsMemo(dispatch, recordingsState.recordings),
    [recordingsState.recordings],
  );

  const isDarkMode = useColorScheme() === 'dark';

  if (recordingsState.loading) return null;

  return (
    <RecordingsContext.Provider
      value={{ utils: recordingsContext, state: recordingsState }}>
      <MainNavigator isDarkMode={isDarkMode} />
    </RecordingsContext.Provider>
  );
};

export default connectActionSheet(App);
