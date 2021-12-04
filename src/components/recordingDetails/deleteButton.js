import React, {useContext} from 'react';
import {Button, Alert} from 'react-native';
import {RecordingsContext} from '@utils/recordings';
import {useNavigation} from '@react-navigation/native';

const DeleteButton = ({recording}) => {
  const navigation = useNavigation();

  const {
    utils: {DELETE_RECORDING},
  } = useContext(RecordingsContext);

  const onSuccess = () => {
    Alert.alert('Success', 'You successfully deleted a recording!', [
      {
        text: 'Ok',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const onError = e => {
    console.log('error while deleting recording', e);
    Alert.alert(
      'Atttention',
      'An error occured while deleting this recording. Do you wanna force delete it?',
      [
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => performDelete(true),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const performDelete = forceDelete => {
    DELETE_RECORDING(recording, forceDelete).then(onSuccess).catch(onError);
  };

  const deleteRecording = forceDelete => {
    Alert.alert(
      'Attention',
      'Are you sure you want to delete this recording?',
      [
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => performDelete(forceDelete),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <Button
      color={'red'}
      onPress={() => deleteRecording(false)}
      title={'Delete Recording'}
    />
  );
};

export default DeleteButton;
