import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { apiClient } from '../../src/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showToast } from '../../src/components/Toast';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback if accessed without params (e.g. on hot reload)
  if (!params.email) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      showToast({ type: 'error', title: 'Error', message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: params.name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        password: params.password,
        otp
      };

      await apiClient.post('/auth/citizen/verifyOtp', payload);
      
      showToast({ type: 'success', title: 'Account Created!', message: 'Please log in to continue.' });
      setTimeout(() => router.replace('/(auth)/login'), 1500);
      
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Verification Failed',
        message: error.response?.data?.message || 'Invalid OTP or server error.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {params.email}</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify &amp; Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel Signup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  formContainer: {},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 15,
    marginBottom: 24,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
});
