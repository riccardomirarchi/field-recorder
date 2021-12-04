import React from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import {Text} from 'react-native';

export const screenOptions = (route, color, focused) => {
  let iconName;

  switch (route.name) {
    case 'SettingsStack':
      iconName = 'setting';
      break;
    case 'LibraryStack':
      iconName = 'folder1';
      break;
    default:
      break;
  }

  return <Icon name={iconName} color={color} size={focused ? 25 : 24} />;
};

export const labelOptions = (route, color, focused) => {
  let label;

  switch (route.name) {
    case 'SettingsStack':
      label = 'Settings';
      break;
    case 'LibraryStack':
      label = 'Library';
      break;
    default:
      break;
  }
  return (
    <Text style={{color, fontSize: 13, fontWeight: focused ? 'bold' : null}}>
      {label}
    </Text>
  );
};
