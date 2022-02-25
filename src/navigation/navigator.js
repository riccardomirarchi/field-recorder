import React, {useContext, useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {createStackNavigator} from '@react-navigation/stack';
import {labelOptions, screenOptions} from '@navigation/utils';
import {
  Animated,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import CustomShareIcon from '../navigation/CustomShareIcon';

// screens
import Library from '@screens/Library';
import Recording from '@screens/Recording';
import RecordingDetails from '@screens/RecordingDetails';
import Settings from '@screens/Settings';

// custom tab bar
import CustomTabBarAndroid from '@navigation/CustomTabBarAndroid';
import CustomTabBar from '@navigation/CustomTabBar';
import CustomHeader from '@navigation/CustomHeader';
import CustomHeaderAndroid from '@navigation/CustomHeaderAndroid';

import CustomBackIcon from '@navigation/CustomBackIcon';
import CustomReloadIcon from '@navigation/CustomReloadIcon';

import {RecordingsContext} from '@utils/recordings';

// stack navigators
const SettingsStack = createStackNavigator();
const LibraryStack = createStackNavigator();
const RecordingStack = createStackNavigator();

const MainBottomTabs = createBottomTabNavigator();

const options = (navigation, additionalOptions = {}) => ({
  ...additionalOptions,
  ...Platform.select({
    ios: {
      headerLeft: props => (
        <CustomBackIcon {...props} onPress={() => navigation.goBack()} />
      ),
      header: props => <CustomHeader {...props} />,
    },
    android: {
      headerBackImage: () => (
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <Icon name={'leftcircle'} size={24} color={'#fff'} />
        </TouchableWithoutFeedback>
      ),
      header: props => <CustomHeaderAndroid {...props} />,
    },
  }),
  headerMode: 'float',
  headerTransparent: true,
  headerStyle: {
    ...Platform.select({
      android: {
        backgroundColor: '#808080',
        borderRadius: 25,
      },
      ios: {
        backgroundColor: 'transparent',
        borderRadius: 30,
      },
    }),
    height: 70,
    elevation: 0,
  },
  headerTitleContainerStyle: {
    ...Platform.select({
      ios: {marginTop: -42},
    }),
  },
  headerTitleStyle: {
    fontSize: 22,
    color: '#FFF',
  },
});

function LibraryS() {
  const [isProcessingExport, setIsProcessingExport] = useState(false);

  const {
    utils: {EXPORT_RECORDINGS},
  } = useContext(RecordingsContext);

  return (
    <LibraryStack.Navigator
      screenOptions={({navigation}) => options(navigation)}>
      <LibraryStack.Screen name={'Library'} component={Library} />
      <LibraryStack.Screen
        name={'Recording Details'}
        component={RecordingDetails}
        options={({
          route: {
            params: {recording},
          },
        }) => ({
          ...Platform.select({
            android: {
              headerRight: () => (
                <TouchableWithoutFeedback
                  onPress={async () => {
                    await EXPORT_RECORDINGS([recording], setIsProcessingExport);
                  }}>
                  <View style={{marginRight: 20}}>
                    {!isProcessingExport ? (
                      <MaterialIcon name={'export'} size={27} color={'#fff'} />
                    ) : (
                      <ActivityIndicator size="large" color={'#fff'} />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              ),
            },
            ios: {
              headerRight: () => (
                <CustomShareIcon
                  onPress={async () => {
                    await EXPORT_RECORDINGS([recording], setIsProcessingExport);
                  }}
                />
              ),
            },
          }),
        })}
      />
    </LibraryStack.Navigator>
  );
}

function RecordingS() {
  const deleteIconAnimation = useRef(new Animated.Value(0)).current;

  const {
    utils: {REMOVE_WAITING_RECORDING, ADD_WAITING_RECORDING},
    state: {hasWaitingRec},
  } = useContext(RecordingsContext);

  const showRecIcon = () => {
    Animated.timing(deleteIconAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const hideRecIcon = () => {
    Animated.timing(deleteIconAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (hasWaitingRec) showRecIcon();
    if (!hasWaitingRec) {
      hideRecIcon();
      setTitle('New Recording');
    }
  }, [hasWaitingRec]);

  const [title, setTitle] = useState();

  const showAlertToReset = () => {
    Alert.alert('Attention', 'You really want to discard the recording?', [
      {
        text: 'Proceed',
        onPress: () => REMOVE_WAITING_RECORDING(),
        style: 'destructive',
      },
      {text: 'Cancel'},
    ]);
  };

  return (
    <RecordingStack.Navigator
      screenOptions={({navigation}) =>
        options(navigation, {
          ...Platform.select({
            android: {
              headerRight: () => (
                <TouchableWithoutFeedback
                  onPress={() => showAlertToReset()}
                  disabled={!hasWaitingRec}>
                  <Animated.View
                    style={{
                      marginRight: 20,
                      opacity: deleteIconAnimation,
                      transform: [
                        {
                          scale: deleteIconAnimation,
                        },
                      ],
                    }}>
                    <Icon name={'delete'} size={24} color={'#fff'} />
                  </Animated.View>
                </TouchableWithoutFeedback>
              ),
            },
            ios: {
              headerRight: () =>
                hasWaitingRec && (
                  <CustomReloadIcon onPress={() => showAlertToReset()} />
                ),
            },
          }),
          headerTitle: () => (
            <TextInput
              value={title}
              onChangeText={val => setTitle(val)}
              style={{
                fontSize: 22,
                color: '#FFF',
                fontWeight: '600',
                width: Platform.OS == 'android' ? 250 : null,
              }}
              placeholder="Recording..."
              placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
              returnKeyType="go"
              textContentType="none"
              cancelButtonTitle="Cancel"
              onEndEditing={({nativeEvent: {text}}) =>
                ADD_WAITING_RECORDING(text)
              }
            />
          ),
        })
      }>
      <RecordingStack.Screen name={'New Recording'} component={Recording} />
    </RecordingStack.Navigator>
  );
}

function SettingsS() {
  return (
    <SettingsStack.Navigator
      screenOptions={({navigation}) => options(navigation)}>
      <SettingsStack.Screen name={'Settings'} component={Settings} />
    </SettingsStack.Navigator>
  );
}

function tabToRender(props) {
  if (Platform.OS == 'ios') return <CustomTabBar {...props} />;
  else return <CustomTabBarAndroid {...props} />;
}

function MainBottomNavigator() {
  return (
    <MainBottomTabs.Navigator
      initialRouteName={'LibraryStack'}
      tabBar={props => tabToRender(props)}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          borderTopColor: 'transparent',
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#d9d9d9',
        tabBarIcon: ({focused, color}) => screenOptions(route, color, focused),
        tabBarLabel: ({focused, color}) => labelOptions(route, color, focused),
        // tabBarHideOnKeyboard: true
      })}>
      <MainBottomTabs.Screen name={'LibraryStack'} component={LibraryS} />
      <MainBottomTabs.Screen
        name={'RecordingStack'}
        options={{tabBarButton: () => null}}
        component={RecordingS}
      />
      <MainBottomTabs.Screen name={'SettingsStack'} component={SettingsS} />
    </MainBottomTabs.Navigator>
  );
}

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <ActionSheetProvider>
        <>
          <StatusBar barStyle={'dark-content'} />
          <MainBottomNavigator />
        </>
      </ActionSheetProvider>
    </NavigationContainer>
  );
};

export default MainNavigator;
