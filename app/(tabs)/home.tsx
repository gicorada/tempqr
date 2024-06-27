import { View, Text, StyleSheet } from 'react-native';
import Scan from '../../components/Scan';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Scan></Scan>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
