import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomMicOffIcon = ({ onPress }) => {
	return (
		<TouchableOpacity
			style={{
				position: 'absolute',
				left: 20,
				bottom: 20,
				zIndex: 3,
				elevation: 5,
				flex: 1,
			}}
			onPress={onPress}>
			<Icon name={'mic-off'} size={27} color={'#8b0000'} />
		</TouchableOpacity>
	);
};

export default CustomMicOffIcon;
