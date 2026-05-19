import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { BRAND_NAME, BRAND_LOGO } from '@constants/branding';
import PawTrail from '@components/PawTrail';

const OwnerHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <PawTrail count={6} />
      {BRAND_LOGO ? (
        <Image source={BRAND_LOGO} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoEmoji}>🐾</Text>
        </View>
      )}
      <Text style={styles.title}>Bienvenido a {BRAND_NAME}</Text>
      <Text style={styles.subtitle}>Tu cuenta de cliente</Text>
      <PawTrail count={5} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logo: { width: 140, height: 140, marginBottom: 16 },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 56 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default OwnerHomeScreen;
