import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomShareIcon = ({ onPress }) => {
	return (
		<TouchableOpacity
			style={{
				position: 'absolute',
				right: 20,
				bottom: 20,
				zIndex: 3,
				elevation: 5,
				flex: 1,
			}}
			onPress={onPress}>
			<Icon name={'export'} size={27} color={'#fff'} />
		</TouchableOpacity>
	);
};

export default CustomShareIcon;
