import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { apiClient } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Address update state
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/userProfile/getUserProfile');
      if (response.data && response.data.user) {
        setProfile(response.data.user);
        setNewAddress(response.data.user.address || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!newAddress) {
      Alert.alert('Error', 'Address cannot be empty');
      return;
    }
    try {
      setSavingAddress(true);
      await apiClient.put('/userProfile/updateAddress', { address: newAddress });
      Alert.alert('Success', 'Address updated successfully');
      setProfile({ ...profile, address: newAddress });
      setIsUpdatingAddress(false);
    } catch {
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleResetPasswordRequest = async () => {
    try {
      Alert.alert(
        'Change Password',
        'Would you like to receive an OTP on your email to reset your password?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send OTP', 
            onPress: async () => {
              const userEmail = profile?.email || user?.email;
              await apiClient.post('/userProfile/resetPassword/reqOtp', { email: userEmail });
              Alert.alert('Success', 'OTP sent to your email.');
              router.push(`/(auth)/reset-password?email=${encodeURIComponent(userEmail)}`);
            }
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to request password reset OTP');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.nameText}>{profile?.name || user?.name || 'Citizen'}</Text>
          <Text style={styles.emailText}>{profile?.email || user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color="#6c757d" />
            <Text style={styles.detailText}>{profile?.phone || 'No phone provided'}</Text>
          </View>

          <View style={styles.detailRowInfo}>
            <Ionicons name="location-outline" size={20} color="#6c757d" style={{marginTop: 2}} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              {isUpdatingAddress ? (
                <View>
                  <TextInput 
                    style={styles.addressInput}
                    value={newAddress}
                    onChangeText={setNewAddress}
                    multiline
                  />
                  <View style={styles.addressActions}>
                    <TouchableOpacity onPress={() => setIsUpdatingAddress(false)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleUpdateAddress} style={styles.saveBtn} disabled={savingAddress}>
                      {savingAddress ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.addressDisplayRow}>
                  <Text style={styles.detailTextFlow}>{profile?.address || 'No address provided'}</Text>
                  <TouchableOpacity onPress={() => setIsUpdatingAddress(true)}>
                    <Ionicons name="pencil" size={18} color="#007bff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={handleResetPasswordRequest}>
            <Ionicons name="lock-closed-outline" size={20} color="#343a40" />
            <Text style={styles.actionText}>Change Password (OTP)</Text>
            <Ionicons name="chevron-forward" size={20} color="#ced4da" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}>
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={[styles.actionText, {color: '#dc3545'}]}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // accommodate tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailRowInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#495057',
  },
  detailTextFlow: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
    paddingRight: 10,
  },
  addressDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    padding: 8,
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#6c757d',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  logoutBtn: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
  }
});
