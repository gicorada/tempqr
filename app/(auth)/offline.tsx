import { View, Text, StyleSheet } from 'react-native';

export default function OfflinePage() {
  return (
    <View style={styles.container}>
      <Text>You are offline. Reload the app when you are back online</Text>
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
