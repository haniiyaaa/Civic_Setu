import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Disable swipe-back gesture on Login — it's the nav root for unauth users */}
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
