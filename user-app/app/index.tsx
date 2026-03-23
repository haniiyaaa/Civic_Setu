import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    if (!isLoading) {
      if (token) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 10);
      } else {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 10);
      }
    }
  }, [isLoading, token, navigationState?.key, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
}
