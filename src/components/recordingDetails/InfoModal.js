import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';
import styles from '@styles/styles';
import {formatMillis} from '@utils/recordings';

const sty = StyleSheet.create({
  text: {
    fontSize: 16,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
});

const InfoModal = ({modalVisible, setModalVisible, recording}) => {
  return (
    <View style={styles.centeredView}>
      <Modal
        hardwareAccelerated={true}
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={sty.text}>Name: {recording.recordingName}</Text>
            <Text style={sty.text}>
              Date:{' '}
              {new Date(
                recording.initialRecordingTimestamp,
              ).toLocaleDateString()}
            </Text>
            <Text style={sty.text}>
              Duration: {formatMillis(recording.duration)}
            </Text>
            {recording.geolocation && (
              <>
                <Text style={sty.text}>
                  Latitude: {recording.geolocation.latitude}
                </Text>
                <Text style={sty.text}>
                  Longitude: {recording.geolocation.longitude}
                </Text>
                <Text style={sty.text}>
                  Accuracy: {recording.geolocation.accuracy}
                </Text>
              </>
            )}
            {recording.orientation && (
              <Text style={sty.text}>Heading: {recording.orientation}°</Text>
            )}

            <Pressable onPress={() => setModalVisible(false)}>
              <View
                style={{
                  padding: 10,
                  borderRadius: 20,
                  backgroundColor: '#001B48',
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 16, color: '#fff'}}>Close</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InfoModal;
