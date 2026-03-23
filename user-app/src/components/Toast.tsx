import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState extends ToastConfig {
  visible: boolean;
}

// Module-level singleton reference so any screen can call showToast()
let toastRef: { show: (config: ToastConfig) => void } | null = null;

export const showToast = (config: ToastConfig) => {
  if (toastRef) {
    toastRef.show(config);
  }
};

export function ToastProvider() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((config: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ ...config, visible: true });

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setToast(null);
        translateY.setValue(-20);
      });
    }, config.duration ?? 3000);
  }, [opacity, translateY]);

  useEffect(() => {
    toastRef = { show };
    return () => { toastRef = null; };
  }, [show]);

  if (!toast) return null;

  const iconName =
    toast.type === 'success' ? 'checkmark-circle' :
    toast.type === 'error' ? 'close-circle' : 'information-circle';

  const color =
    toast.type === 'success' ? '#28a745' :
    toast.type === 'error' ? '#dc3545' : '#007bff';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }], borderLeftColor: color },
      ]}
      pointerEvents="none"
    >
      <Ionicons name={iconName as any} size={24} color={color} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    borderLeftWidth: 4,
    zIndex: 9999,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
  },
  message: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
});
