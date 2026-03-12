import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { apiClient } from '../../src/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!params.email) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleResetPassword = async () => {
    if (otp.length !== 6 || newPassword.length < 6) {
      Alert.alert('Error', 'Ensure you have a 6-digit OTP and password is at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'The new passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/auth/forgotPass/verifyOtp', { 
        email: params.email, 
        otp, 
        newPassword 
      });
      
      router.replace('/(auth)/login');
      
    } catch (error: any) {
      Alert.alert(
        'Failed', 
        error.response?.data?.message || 'Invalid OTP or unable to reset password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code and your new password.</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, styles.otpInput]}
          placeholder="Enter OTP"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
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
    marginBottom: 16,
    fontSize: 16,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});
