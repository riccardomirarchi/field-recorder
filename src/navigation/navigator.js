import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createStackNavigator } from '@react-navigation/stack';
import { labelOptions, screenOptions } from '@navigation/utils';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// screens
import Library from '@screens/Library';
import Recording from '@screens/Recording';
import RecordingDetails from '@screens/RecordingDetails';
import Settings from '@screens/Settings'

// custom tab bar
import CustomTabBarAndroid from '@navigation/CustomTabBarAndroid';
import CustomTabBar from '@navigation/CustomTabBar';
import CustomHeader from '@navigation/CustomHeader';
import CustomHeaderAndroid from '@navigation/CustomHeaderAndroid';

import CustomBackIcon from '@navigation/CustomBackIcon';

// stack navigators
const SettingsStack = createStackNavigator();
const LibraryStack = createStackNavigator();
const RecordingStack = createStackNavigator();

const MainBottomTabs = createBottomTabNavigator();

const options = navigation => ({
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
      ios: { marginTop: -40 },
    }),
  },
  headerTitleStyle: {
    fontSize: 22,
    color: '#FFF',
  },
});

function libraryStack() {
  return (
    <LibraryStack.Navigator
      screenOptions={({ navigation }) => options(navigation)}>
      <LibraryStack.Screen name={'Library'} component={Library} />
      <LibraryStack.Screen
        name={'Recording Details'}
        component={RecordingDetails}
      />
    </LibraryStack.Navigator>
  );
}

function recordingStack() {
  return (
    <RecordingStack.Navigator
      screenOptions={({ navigation }) => options(navigation)}>
      <RecordingStack.Screen name={'New Recording'} component={Recording} />
    </RecordingStack.Navigator>
  );
}

function settingsStack() {
  return (
    <SettingsStack.Navigator
      screenOptions={({ navigation }) => options(navigation)}>
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          borderTopColor: 'transparent',
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#d9d9d9',
        tabBarIcon: ({ focused, color }) => screenOptions(route, color, focused),
        tabBarLabel: ({ focused, color }) => labelOptions(route, color, focused),
      })}>
      <MainBottomTabs.Screen name={'LibraryStack'} component={libraryStack} />
      <MainBottomTabs.Screen
        name={'RecordingStack'}
        options={{ tabBarButton: () => null }}
        component={recordingStack}
      />
      <MainBottomTabs.Screen name={'SettingsStack'} component={settingsStack} />
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
