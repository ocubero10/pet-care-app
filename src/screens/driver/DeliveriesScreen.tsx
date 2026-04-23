import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const DeliveriesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Deliveries</Text>
      <Text style={styles.subtitle}>Deliver groomed pets back to owners</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default DeliveriesScreen;
