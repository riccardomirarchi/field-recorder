import React, { useContext, useEffect } from 'react';
import { FlatList, View, Text } from 'react-native';
import styles from '@styles/styles';
import CardItem from '@components/library/CardItem';
import { RecordingsContext } from '@utils/recordings';
import { useIsFocused } from '@react-navigation/native';

const Library = ({ navigation, route }) => {
  const focused = useIsFocused();

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
    state: { recordings },
  } = useContext(RecordingsContext);

  const _renderItem = ({ item }) => {
    return <CardItem item={item} />;
  };

  return (
    <FlatList
      data={recordings}
      renderItem={_renderItem}
      // onScroll={({nativeEvent}) => console.log(nativeEvent.contentOffset.y)}
      keyExtractor={item => item.initialRecordingTimestamp}
      contentContainerStyle={styles.container}
      ListEmptyComponent={() => {
        return (
          <View style={{ alignItems: 'center', flex: 1, paddingTop: 30 }}>
            <Text style={{ color: '#4f4f4f' }} >You don't have any recording yet.</Text>
          </View>
        );
      }}
    />
  );
};

export default Library;
