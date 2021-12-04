import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'native-base';

const styles = StyleSheet.create({
  socialBtns: {
    height: 50,
    width: 300,
    borderRadius: 40,
    borderColor: 'gray',
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 0.6,
    justifyContent: 'center',
    paddingLeft: 11.2,
    backgroundColor: 'white',
    marginVertical: 15,
    flexDirection: 'row',
  },
});

const socialLogins = () => {
  return (
    <View
      style={{
        marginVertical: 20,
        marginTop: 40,
        alignSelf: 'center',
      }}>
      <TouchableOpacity onPress={() => null} style={styles.socialBtns}>
        <Icon
          type="FontAwesome"
          name="google"
          style={{
            fontSize: 20,
            left: 8,
            position: 'absolute',
            margin: 12,
          }}
        />
        <Text
          style={{
            color: 'black',
            margin: 12,
            fontSize: 17,
          }}>
          Accedi con Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => null}
        style={[
          styles.socialBtns,
          {
            backgroundColor: 'black',
          },
        ]}>
        <Icon
          type="FontAwesome"
          name="apple"
          style={{
            fontSize: 20,
            color: 'white',
            left: 8,
            position: 'absolute',
            margin: 12,
          }}
        />
        <Text
          style={{
            color: 'white',
            margin: 12,
            fontSize: 16,
          }}>
          Accedi con Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default socialLogins;
