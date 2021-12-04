import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    alignItems: 'center',
  },
  textStyle: {
    color: '#283583',
    fontSize: 14,
    opacity: 0.6,
    textAlignVertical: 'center',
  },
  registerStyle: {
    fontWeight: 'bold',
    fontSize: 14.5,
    opacity: 0.8,
    alignItems: 'center',
  },
});

const RegisterComponent = ({onPress}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>Non hai un account? </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={[styles.textStyle, styles.registerStyle]}>Registrati</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterComponent;
