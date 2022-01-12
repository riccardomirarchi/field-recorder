import React from 'react';
import {Button, PermissionsAndroid} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const ImageComponent = ({setImageUri, imageUri, ADD_WAITING_RECORDING}) => {
  const {showActionSheetWithOptions} = useActionSheet();

  // actually useless, rn image picker handles this camera permission on its own
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err, 'error while asking for permission');
    }
  };

  const choosePhoto = () => {
    var options = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    launchImageLibrary(options, async res => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.errorCode) {
        console.log(res.errorCode);
      } else {
        setImageUri(res.assets[0].uri);
        ADD_WAITING_RECORDING();
      }
    });
  };

  const takePhoto = async () => {
    var options = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    launchCamera(options, res => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.errorCode) {
        console.log(res.errorCode);
      } else {
        setImageUri(res.assets[0].uri);
        ADD_WAITING_RECORDING();
      }
    });
  };

  const onPress = () => {
    const options = ['Take a photo', 'Choose from Library', 'Cancel'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            // open camera to take a photo
            takePhoto();
            break;
          case 1:
            // open library to choose photo
            choosePhoto();
            break;
          default:
            break;
        }
      },
    );
  };

  return (
    <Button
      onPress={onPress}
      title={!imageUri ? 'Add a photo' : 'Replace photo'}
    />
  );
};

export default ImageComponent;
