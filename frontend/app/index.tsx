import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useAuthStore();

  // Always land on the public Browse tab. Login is reachable from the home
  // screen and from any protected tab — no forced auth gate up-front.
  useEffect(() => {
    if (!isLoading) {
      router.replace('/(tabs)');
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>FurrstCamp Travel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});