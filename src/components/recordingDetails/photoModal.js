import React, {useState, useEffect} from 'react';
import {Modal, View, Image, TouchableWithoutFeedback, Text} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import styles, {SCREEN_SIZE} from '@styles/styles';
import {pathToImagesFolder} from '@utils/recordings';

const PhotoModal = ({modalVisible, setModalVisible, imageUri}) => {
  const [horizontal, setHorizontal] = useState(false);
  const [photoDimensions, setPhotoDimensions] = useState({});

  useEffect(() => {
    if (imageUri)
      Image.getSize(pathToImagesFolder + imageUri, (width, height) => {
        setPhotoDimensions({
          width,
          height,
        });
        if (width > height) {
          setHorizontal(true);
        }
      });
  }, []);

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
            {imageUri && (
              <View style={{position: 'absolute', top: 13}}>
                <Text style={{color: 'grey'}}>
                  {horizontal ? 'Horizontal' : 'Vertical'}
                </Text>
              </View>
            )}

            <TouchableWithoutFeedback
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={{position: 'absolute', right: 10, top: 10}}>
                <Icon name={'close'} size={26} color={'grey'} />
              </View>
            </TouchableWithoutFeedback>
            {imageUri ? (
              <Image
                source={{
                  uri: pathToImagesFolder + imageUri,
                }}
                style={{
                  marginTop: 30,
                  width: photoDimensions.width,
                  maxHeight: SCREEN_SIZE.height / 2,
                  maxWidth: SCREEN_SIZE.width / 1.25,
                  height: photoDimensions.height,
                  resizeMode: 'contain',
                  transform: [
                    {rotate: horizontal ? '90deg' : '0deg'},
                    {scale: horizontal ? 1.3 : 1},
                  ],
                  borderRadius: 20,
                }}
              />
            ) : (
              <Text style={styles.modalText}>This recording has no photo!</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PhotoModal;
