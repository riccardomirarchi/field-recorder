import React from 'react';
import { View, Text, Switch } from 'react-native';
import styles from '@styles/styles';

const CardItem = ({ text, enabled, setEnabled }) => {

	return (
		<View style={styles.cardItemContainer}>
			<Text style={styles.cardItemTextStyle}>{text}</Text>
			<Switch
				ios_backgroundColor="#808080"
				onValueChange={setEnabled}
				value={enabled} />
		</View>
	);
};
export default CardItem;
