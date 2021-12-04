import {createContext} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const loginReducer = (_, {type, payload}) => {
  switch (type) {
    case 'LOG_USER':
      return {
        loading: false,
        userInfo: payload,
      };
    case 'LOGOUT_USER':
      return {
        loading: false,
        userInfo: null,
      };
    case 'REGISTER_USER':
      return {
        loading: false,
        userInfo: payload,
      };
    case 'RETRIEVE_USER':
      return {
        loading: false,
        userInfo: payload,
      };
  }
};

export const authMemo = dispatch => ({
  LOG_USER: async (email, password, setErrors, setLoading) => {
    setLoading(true);

    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        email,
      }),
    );
    setLoading(false);
    dispatch({
      type: 'LOG_USER',
      payload: {email},
    });
  },
  LOG_USER_WITH_GOOGLE: async setLoading => {
    Alert.alert('[LOG_USER_WITH_GOOGLE] not yet implemented :)');
  },
  LOG_USER_WITH_APPLE: async setLoading => {
    Alert.alert('[LOG_USER_WITH_APPLE] not yet implemented');
  },
  LOGOUT_USER: async () => {
    await AsyncStorage.removeItem('user');
    dispatch({type: 'LOGOUT_USER', payload: null});
  },
  REGISTER_USER: async (email, password, setLoading, name, surname) => {
    setLoading(true);

    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        email,
      }),
    );
    setLoading(false);
    dispatch({
      type: 'LOG_USER',
      payload: {email},
    });
  },
});
