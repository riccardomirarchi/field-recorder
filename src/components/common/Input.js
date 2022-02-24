import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  inputStyle: {
    backgroundColor: '#2c2c2c',
    padding: 10,
    borderRadius: 20,
    textAlign: 'left',
    zIndex: 2,
    height: 45,
    marginTop: 20,
    marginBottom: 2,
  },
});

const Input = React.forwardRef((props, ref) => {
  const {
    placeholder,
    autoComplete,
    onChangeText,
    onFocus = () => null,
    returnKeyType = 'next',
    secureTextEntry = false,
    style = {},
    onSubmitEditing = () => null,
    value,
    multiline = false,
    editable,
    onEndEditing = () => null
  } = props;
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={'#b3b1ab'}
      color={'white'}
      value={value}
      selectTextOnFocus={editable}
      editable={editable}
      ref={ref}
      secureTextEntry={secureTextEntry}
      autoComplete={autoComplete}
      onChangeText={text => onChangeText(text)}
      returnKeyType={returnKeyType}
      keyboardAppearance={'dark'}
      onSubmitEditing={() => onSubmitEditing()}
      onFocus={() => onFocus({})}
      style={[styles.inputStyle, style]}
      numberOfLines={multiline ? 5 : null}
      multiline={multiline}
      onEndEditing={onEndEditing}
    />
  );
});

export default Input;
