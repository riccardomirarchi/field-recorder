import React, { useEffect, useRef } from 'react'
import { TouchableWithoutFeedback, Animated } from 'react-native'
import styles from '@styles/styles';
import Icon from 'react-native-vector-icons/AntDesign';

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

const EventItemCard = ({ onPress, item, highlighted }) => {
  const colorAnim = useRef(new Animated.Value(0)).current;

  const animateEvent = (toValue) => {
    Animated.timing(colorAnim, {
      toValue,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }

  useEffect(() => {
    if (highlighted == item) {
      animateEvent(1)

      setTimeout(() => animateEvent(0), 2000)
    }
  }, [highlighted])

  const inputRange = [0, 1]

  const backgroundColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(255,255,255,1)', 'rgba(0,27,72, 1)']
  })

  const textColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(70,70,70,1)', 'rgba(255,255,255, 1)']
  })

  const iconColor = colorAnim.interpolate({
    inputRange,
    outputRange: ['rgba(128,128,128,1)', 'rgba(255,255,255, 1)']
  })

  return (
    <TouchableWithoutFeedback
      onPress={onPress}>
      <Animated.View
        style={[
          styles.cardItemContainer,
          {
            height: 55,
            justifyContent: 'space-between',
            backgroundColor
          },
        ]}>
        <Animated.Text style={[styles.cardItemTextStyle, { color: textColor }]}>{item.title}</Animated.Text>

        <AnimatedIcon name={'playcircleo'} size={24} style={{ color: iconColor }} />
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default EventItemCard