import React from 'react';
import {View, Text} from 'react-native';
import Header from '@components/common/Header';

const LoginHeader = () => {
  return (
    <Header
      style={{
        backgroundColor: '#2c2c2c',
        alignItems: 'center',
      }}>
      <View style={{alignContent: 'center'}}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 40,
            fontWeight: 'bold',
            color: '#fff',
          }}>
          Login
        </Text>
      </View>
    </Header>
  );
};

export default LoginHeader;
