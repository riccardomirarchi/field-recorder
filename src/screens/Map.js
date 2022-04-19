import React, {useState, useContext} from 'react';
import {
  View,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from '@styles/styles';
import {RecordingsContext} from '@utils/recordings';
import MapView from 'react-native-maps';

const Map = () => {
  const {
    state: {recordings},
  } = useContext(RecordingsContext);

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        flex: 1,
      }}>
      <MapView
        style={{...StyleSheet.absoluteFillObject}}
        region={{
          latitude: recordings[0]?.geolocation.latitude,
          longitude: recordings[0]?.geolocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}></MapView>
    </View>
  );
};
export default Map;
