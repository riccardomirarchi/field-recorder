import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {
  FlatList,
  View,
  Text,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '@styles/styles';
import CardItem from '@components/library/CardItem';
import {RecordingsContext} from '@utils/recordings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused} from '@react-navigation/native';
import CustomIosHeaderIcon from '@navigation/CustomIosHeaderIcon';

const Library = ({navigation, route}) => {
  const focused = useIsFocused();
  const animation = useRef(new Animated.Value(0)).current;

  const [selectionOpened, setOpened] = useState(false);
  const [selectedIndexes, setIndexes] = useState([]);
  const [isProcessingExport, setIsProcessingExport] = useState(false);

  const marginRight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-55, 2],
  });

  const openSelection = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setOpened(true));
  };

  const closeSelection = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setOpened(false);
      setIndexes([]);
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      ...Platform.select({
        android: {
          headerLeft: () => {
            return (
              <TouchableWithoutFeedback onPress={closeSelection}>
                <Animated.View
                  style={{
                    left: 12,
                    padding: 10,
                    bottom: 0,
                    opacity: animation,
                    marginRight,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#FFF',
                      fontWeight: '600',
                    }}>
                    Done
                  </Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          },
          headerRight: () => (
            <TouchableWithoutFeedback
              onPress={async () => {
                await EXPORT_RECORDINGS(getRecordings(), setIsProcessingExport);
              }}
              disabled={!selectionOpened}>
              <Animated.View
                style={{
                  marginRight: 20,
                  opacity: animation,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {!isProcessingExport ? (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#FFF',
                        fontWeight: '600',
                        marginRight: 5,
                        bottom: 0.5,
                      }}>
                      {selectedIndexes.length}
                    </Text>
                    <Icon name={'export'} size={27} color={'#fff'} />
                  </>
                ) : (
                  <ActivityIndicator size="large" color={'#fff'} />
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          ),
        },
        ios: {
          headerLeft: () => {
            return (
              <TouchableWithoutFeedback onPress={closeSelection}>
                <Animated.View
                  style={{left: 22, bottom: 22, opacity: animation}}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#FFF',
                      fontWeight: '600',
                    }}>
                    Done
                  </Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          },
          headerRight: () => (
            <Animated.View
              style={{
                top: 12,
                opacity: animation,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#FFF',
                  fontWeight: '600',
                  marginRight: 5,
                  position: 'absolute',
                  right: 50,
                  bottom: 23,
                }}>
                {selectedIndexes.length}
              </Text>

              <CustomIosHeaderIcon
                onPress={async () => {
                  await EXPORT_RECORDINGS(
                    getRecordings(),
                    setIsProcessingExport,
                  );
                }}
                icon={Icon}
                iconName={'export'}
                iconSize={27}
                iconColor={'#fff'}
                disabled={!selectionOpened}
              />
            </Animated.View>
          ),
        },
      }),
    });
  }, [selectedIndexes, isProcessingExport, selectionOpened]);

  const getRecordings = () => {
    return selectedIndexes.map(index => recordings[index]);
  };

  useEffect(() => {
    if (route.params?.recording && focused) {
      setTimeout(() => {
        navigation.navigate('Recording Details', {
          recording: route.params.recording,
        });
      }, 500);
    }
  }, [route.params?.recording]);

  const {
    state: {recordings},
    utils: {EXPORT_RECORDINGS, DELETE_RECORDINGS},
  } = useContext(RecordingsContext);

  const _renderItem = ({item, index}) => {
    return (
      <CardItem
        item={item}
        openSelection={openSelection}
        selectionOpened={selectionOpened}
        animation={animation}
        index={index}
        setIndexes={setIndexes}
        selectedIndexes={selectedIndexes}
      />
    );
  };

  const showWarningDeleteAlert = () => {
    Alert.alert(
      'Attention',
      `Are you sure you want to delete ${selectedIndexes.length} recording${
        selectedIndexes.length > 1 ? 's' : ''
      }?`,
      [
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () =>
            DELETE_RECORDINGS(getRecordings(), true)
              .then(() => setIndexes([]))
              .catch(() =>
                Alert.alert('OPS', 'An error occured, try again later.'),
              ),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => showWarningDeleteAlert()}
        disabled={!selectedIndexes.length}>
        <Animated.View
          style={[
            styles.botttomIconContainer,
            {
              opacity: animation,
              backgroundColor: !selectedIndexes.length
                ? 'rgba(184,0,0, 0.6)'
                : 'rgba(184,0,0, 1)',
              transform: [{scale: animation}],
            },
          ]}>
          <Icon name={'delete'} size={24} color={'#fff'} />
        </Animated.View>
      </TouchableWithoutFeedback>
      <FlatList
        data={recordings}
        renderItem={_renderItem}
        keyExtractor={item => item.initialRecordingTimestamp}
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => {
          return (
            <View style={{alignItems: 'center', flex: 1, paddingTop: 30}}>
              <Text style={{color: '#4f4f4f'}}>
                You don't have any recording yet.
              </Text>
            </View>
          );
        }}
      />
    </>
  );
};

export default Library;
