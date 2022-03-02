import React, {useEffect, useRef} from 'react';
import {TouchableWithoutFeedback, Animated, View} from 'react-native';
import styles from '@styles/styles';
import Icon from 'react-native-vector-icons/AntDesign';
import {formatMillis} from '../../utils/recordings';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const EventItemCard = ({onPress, item, highlighted}) => {
  const colorAnim = useRef(new Animated.Value(0)).current;

  const animateEvent = toValue => {
    Animated.timing(colorAnim, {
      toValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (highlighted == item) {
      animateEvent(1);

      setTimeout(() => animateEvent(0), 2000);
    }
  }, [highlighted]);

  const inputRange = [0, 1];

  const backgroundColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(255,255,255,1)', 'rgba(0,27,72, 1)'],
  });

  const textColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(70,70,70,1)', 'rgba(255,255,255, 1)'],
  });

  const iconColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(128,128,128,1)', 'rgba(255,255,255, 1)'],
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={[
          styles.cardItemContainer,
          {
            height: item.description
              ? item.description.length > 43
                ? 120
                : 100
              : 55,
            justifyContent: 'space-between',
            backgroundColor,
          },
        ]}>
        <View style={styles.innerViewStyle}>
          <Animated.Text
            style={[
              styles.cardItemTextStyle,
              {color: textColor, paddingTop: 4},
            ]}>{`${item.title}  -  ${formatMillis(
            item.millisFromBeginning,
          )}`}</Animated.Text>

          <AnimatedIcon
            name={'playcircleo'}
            size={24}
            style={{color: iconColor}}
          />
        </View>

        {item.description && (
          <View style={{marginTop: 30, marginLeft: '-0.1%'}}>
            <Animated.Text
              style={[styles.cardItemTextStyle, {color: textColor}]}>
              {item.description}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default EventItemCard;
