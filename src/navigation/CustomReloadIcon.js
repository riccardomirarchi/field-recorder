import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const CustomReloadIcon = ({onPress}) => {
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        right: 20,
        bottom: 22,
        zIndex: 3,
        elevation: 5,
        flex: 1,
      }} 
      onPress={onPress}>
      <Icon name={'reload1'} size={24} color={'#fff'} />
    </TouchableOpacity>
  );
};

export default CustomReloadIcon;
