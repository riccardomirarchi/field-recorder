import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import styles from '@styles/styles';
import CardItem from '../settings/CardItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {

  useEffect(() => {
    const bootstrapOptions = async () => {
      setHighQuality(JSON.parse(await AsyncStorage.getItem('recordingQuality')))
      setSaveRecordings(JSON.parse(await AsyncStorage.getItem('saveRecordings')))
    }
    bootstrapOptions()
  }, [])

  const toggleQuality = async () => {
    setHighQuality(!highQualityEnabled)
    await AsyncStorage.setItem('recordingQuality', JSON.stringify(!highQualityEnabled))
  }

  const toggleSaveRec = async () => {
    setSaveRecordings(!saveRecordingsEnabled)
    await AsyncStorage.setItem('saveRecordings', JSON.stringify(!saveRecordingsEnabled))
  }

  const [highQualityEnabled, setHighQuality] = useState(null)
  const [saveRecordingsEnabled, setSaveRecordings] = useState(false)

  return (
    <View style={styles.container}>
      <CardItem text={'High Quality Recording'} enabled={highQualityEnabled} setEnabled={toggleQuality} />
      <CardItem text={'Save Recordings'} enabled={saveRecordingsEnabled} setEnabled={toggleSaveRec} />
    </View>
  );
}
export default Settings