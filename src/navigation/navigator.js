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
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import CustomMicOffIcon from '@navigation/CustomMicOffIcon';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';

// screens
import Library from '@screens/Library';
import Recording from '@screens/Recording';
import RecordingDetails from '@screens/RecordingDetails';
import Settings from '@screens/Settings';
import Map from '@screens/Map'

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
const MapStack = createStackNavigator();

const MainBottomTabs = createBottomTabNavigator();

const options = (navigation, additionalOptions = {}) => ({
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
  ...additionalOptions,
});

function LibraryS() {
  const [title, setTitle] = useState();

  const {
    utils: {RENAME_RECORDING},
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
          headerTitle: () => (
            <TextInput
              value={title ? title : recording.recordingName}
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
                RENAME_RECORDING(text, recording)
              }
            />
          ),
        })}
      />
    </LibraryStack.Navigator>
  );
}

function MapS() {
  return (
    <MapStack.Navigator screenOptions={({navigation}) => options(navigation)}>
      <MapStack.Screen name={'Map'} component={Map} />
    </MapStack.Navigator>
  );
}

function RecordingS(props) {
  const deleteIconAnimation = useRef(new Animated.Value(0)).current;
  const {navigation} = props;

  const {
    utils: {REMOVE_WAITING_RECORDING, ADD_WAITING_RECORDING},
    state: {hasWaitingRec, settings},
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

  const showMicOffAlert = () => {
    Alert.alert(
      'Information',
      "This icon means that the audio file won't be saved in the device storage. If you want to keep the file you can change the setting in the Settings page.",
      [
        {text: 'Cancel'},
        {
          text: 'Go to Settings',
          onPress: () => navigation.jumpTo('SettingsStack'),
          style: 'cancel',
        },
      ],
    );
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
              headerLeft: () =>
                // to do: check if it's rendered properly
                !settings.saveRecordings && (
                  <TouchableWithoutFeedback onPress={() => showMicOffAlert()}>
                    <View style={{left: 10, padding: 2, marginHorizontal: 10}}>
                      <Ionicon name={'mic-off'} size={26} color={'#8b0000'} />
                    </View>
                  </TouchableWithoutFeedback>
                ),
            },
            ios: {
              headerRight: () => (
                <CustomReloadIcon
                  onPress={() => showAlertToReset()}
                  disabled={!hasWaitingRec}
                  deleteIconAnimation={deleteIconAnimation}
                />
              ),
              headerLeft: () =>
                !settings.saveRecordings && (
                  <CustomMicOffIcon onPress={() => showMicOffAlert()} />
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
      })}>
      <MainBottomTabs.Screen name={'LibraryStack'} component={LibraryS} />
      <MainBottomTabs.Screen name={'MapsStack'} component={MapS} />
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
