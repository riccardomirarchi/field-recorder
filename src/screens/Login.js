import React, {useContext, useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LoginHeader from '@components/login/loginHeader';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import RegisterComponent from '@components/login/registerComponent';

import {AuthContext} from '@utils/login';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {LOG_USER} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      if (buttonRef && !loading) {
        buttonRef.current?.pulse();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = () => {
    if (!canSubmit() || loading) {
      Keyboard.dismiss();
    } else {
      LOG_USER(email, password, setErrors, setLoading);
    }
  };

  const canSubmit = () => {
    if (email && password) return true;
    return false;
  };

  const buttonRef = useRef();

  const passwordInput = useRef();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      enabled>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          <StatusBar barStyle={'light-content'} animated />

          {/* <LoginHeader /> */}

          <ScrollView style={{flex: 1, width: '100%'}}>
            <Animatable.View
              animation={'fadeIn'}
              useNativeDriver
              duration={2400}
              delay={500}>
              <View
                style={{width: '100%', paddingHorizontal: 60, marginTop: 200}}>
                <Input
                  placeholder={'Email'}
                  autoCompleteType={'email'}
                  onChangeText={setEmail}
                  onFocus={setErrors}
                  returnKeyType={'next'}
                  onSubmitEditing={() => passwordInput.current.focus()}
                />

                <Input
                  placeholder={'Password'}
                  autoCompleteType={'password'}
                  onChangeText={setPassword}
                  ref={passwordInput}
                  onFocus={setErrors}
                  secureTextEntry={true}
                  returnKeyType={'send'}
                  onSubmitEditing={() => onSubmit()}
                />

                {(errors?.email || errors?.password) && (
                  <Text
                    style={{
                      color: 'red',
                      textAlign: 'center',
                      marginTop: -15,
                      marginBottom: 10,
                    }}>
                    {errors?.email || errors?.password}
                  </Text>
                )}
              </View>

              <RegisterComponent onPress={() => console.log(navigation)} />

              <Button
                animation={'pulse'}
                ref={buttonRef}
                onPress={() => onSubmit()}
                disabled={!canSubmit() || loading}>
                {!loading ? (
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 15,
                      opacity: 1,
                      textAlign: 'center',
                    }}>
                    ACCEDI
                  </Text>
                ) : (
                  <ActivityIndicator color="#fff" />
                )}
              </Button>
            </Animatable.View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
