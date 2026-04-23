import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const RequirementClarificationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clarifications Needed</Text>
      <Text style={styles.subtitle}>
        This is the key feature - staff can see orders with missing requirements and request
        clarification from drivers
      </Text>
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
    textAlign: 'center',
  },
});

export default RequirementClarificationScreen;
