import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  buttonStyle: {
    width: '40%',
    height: 55,
    borderRadius: 27,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#2c2c2c',
  },
});

const Button = React.forwardRef((props, ref) => {
  const {
    children,
    animation = null,
    duration = 1200,
    delay = 0,
    onPress,
    disabled,
    style = {},
  } = props;

  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      ref={ref}
      style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.buttonStyle,
          {
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        disabled={disabled}>
        {children}
      </TouchableOpacity>
    </Animatable.View>
  );
});
export default Button;
