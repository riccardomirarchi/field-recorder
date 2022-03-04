import {StyleSheet, StatusBar, Dimensions} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {getBottomSpace} from 'react-native-iphone-x-helper';

export const WINDOW_SIZE = Dimensions.get('window');
export const SCREEN_SIZE = Dimensions.get('screen');
export const PLAYER_WIDTH = WINDOW_SIZE.width / 1.7;

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 180 : 175,
    paddingTop:
      Platform.OS === 'ios'
        ? getStatusBarHeight(true) + 100
        : StatusBar.currentHeight + 80,
    paddingHorizontal: 25,
  },
  itemContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  // ios header right icon touchable
  iosHeaderTouchable: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 3,
    elevation: 5,
    flex: 1,
  },

  // ios header style
  iosHeaderStyle: {
    position: 'absolute',
    top: getStatusBarHeight(true) + 5,
    borderRadius: 30,
    left: 20,
    right: 20,
  },

  // android header style
  androidHeaderStyle: {
    top: StatusBar.currentHeight - 15,
    backgroundColor: '#808080',
    borderRadius: 25,
    width: SCREEN_SIZE.width - 40,
    alignSelf: 'center',
  },

  // ios tab bar style
  iosTabBarStyle: {
    paddingTop: 8,
    position: 'absolute',
    bottom: getBottomSpace(),
    borderRadius: 30,
    right: 20,
    left: 20,
    height: 70,
  },

  // android tabbar style
  androidTabBarStyle: {
    paddingTop: 8,
    position: 'absolute',
    bottom: 20,
    borderRadius: 25,
    right: 20,
    backgroundColor: '#808080',
    left: 20,
    height: 70,
  },

  // recording details photo modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 35,
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',
    fontSize: 18,
  },

  // player component
  playerContainer: {
    width: WINDOW_SIZE.width - 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  player: {
    paddingHorizontal: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: PLAYER_WIDTH,
    backgroundColor: 'gray',
    height: 16,
    borderRadius: 20,
  },
  innerPlayer: {
    backgroundColor: 'white',
    height: 8,
    width: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  iconContainer: {
    marginHorizontal: 10,
    width: 40,
    flexDirection: 'row',
    marginBottom: 1,
  },

  // card item style
  cardItemContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 10, // better remove it and add to the childrens
    borderWidth: 0.8,
    shadowRadius: 10,
    shadowColor: '#464646',
    shadowOpacity: 0.25,
    borderRadius: 30,
    borderColor: '#808080',
    height: 70,
    backgroundColor: '#fff',
    elevation: 10,
    width: WINDOW_SIZE.width - 50,
  },
  innerViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    position: 'absolute',
    left: 20,
    right: 20,
    top: 15,
  },
  cardItemTextStyle: {
    color: '#464646',
    paddingTop: 1,
  },

  // custom bottom tab circles
  bottomCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS == 'android' ? 90 : 100,
    right: 0,
  },
  bottomCircleStyle: {
    backgroundColor: '#001B48',
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#001B48',
    shadowOpacity: 0.25,
    elevation: 10,
    right: 20,
    bottom: 20,
  },

  // tabs delete and export icon container
  botttomIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS == 'android' ? 110 : 120,
    left: 20,
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#001B48',
    shadowOpacity: 0.25,
    elevation: 10,
    zIndex: 5,
  },
});

export const utilsStyles = StyleSheet.create({
  pv25: {
    paddingVertical: 25,
  },
  ph25: {
    paddingHorizontal: 25,
  },
  mv25: {
    marginVertical: 25,
  },
  pt40: {
    paddingTop: 40,
  },
});

export default styles;
