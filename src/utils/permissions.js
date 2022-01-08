import { PermissionsAndroid, ToastAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Audio } from 'expo-av';

export const hasGeolocationPermissionAndroid = async () => {
  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return 'granted';
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show('Location permission denied...', ToastAndroid.LONG);
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    ToastAndroid.show('Location permission revoked...', ToastAndroid.LONG);
  }

  return 'not granted';
};

export const requestPermissions = async () => {

  let permissionStatus = 'not granted'

  if (Platform.OS === 'ios') {
    permissionStatus = await Geolocation.requestAuthorization('whenInUse');
  } else {
    permissionStatus = await hasGeolocationPermissionAndroid();
  }

  await Audio.requestPermissionsAsync();

  return permissionStatus
}