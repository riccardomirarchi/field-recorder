import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const CustomBackIcon = ({ canGoBack, onPress }) => {
  if (!canGoBack) return null;

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        left: 20,
        bottom: 22,
        zIndex: 3,
        elevation: 5,
        flex: 1,
      }}
      onPress={onPress}>
      <Icon name={'leftcircle'} size={24} color={'#fff'} />
    </TouchableOpacity>
  );
};

export default CustomBackIcon;
