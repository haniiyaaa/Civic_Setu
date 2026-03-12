import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { apiClient } from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Road Damage',
  'Garbage Issue',
  'Water Supply',
  'Electricity',
  'Drainage Problem',
  'Public Property Damage',
  'Other'
];

export default function CreateReportScreen() {
  const router = useRouter();
  
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to submit a report.');
        return;
      }
      let locationReq = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: locationReq.coords.latitude,
        lng: locationReq.coords.longitude
      });
      
      // Reverse geocode to get an address string optionally
      try {
        let geocode = await Location.reverseGeocodeAsync(locationReq.coords);
        if (geocode.length > 0) {
          const addr = geocode[0];
          // Filter out null/undefined values and join with comma
          const fullAddress = [
            addr.name, 
            addr.street, 
            addr.subregion, 
            addr.city, 
            addr.region, 
            addr.postalCode
          ].filter(Boolean).join(', ');
          
          setAddress(fullAddress || 'Unknown Location');
        }
      } catch (err) {}
    })();
  }, []);

  const pickImage = async (useCamera = false) => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }
    
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    };

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take photos.');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleAddMedia = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(false) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description || !category || !location) {
      Alert.alert('Error', 'Please provide a description, category, and ensure location is active.');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      if (address) formData.append('address', address);
      
      images.forEach((uri, index) => {
        const fileExt = uri.split('.').pop() || 'jpeg';
        const fileName = `proof_${index}_${Date.now()}.${fileExt}`;
        formData.append('media', {
          uri: uri,
          name: fileName,
          type: `image/${fileExt}`
        } as unknown as Blob); 
        // React Native FormData accepts an object with uri, name, type
      });

      await apiClient.post('/report/citizen/reportupload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Failed to Submit', 
        error.response?.data?.message || 'Could not upload your report.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryBadge, category === cat && styles.categoryBadgeActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Proof Images (Max 5)</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={handleAddMedia}>
              <Ionicons name="camera" size={32} color="#6c757d" />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#007bff" />
          <Text style={styles.locationText}>
            {location ? (address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`) : 'Fetching location...'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
          disabled={loading || !location}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Report</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 10,
  },
  categoryBadgeActive: {
    backgroundColor: '#007bff',
  },
  categoryText: {
    color: '#495057',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#6c757d',
    fontSize: 12,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  locationText: {
    marginLeft: 8,
    color: '#495057',
    fontSize: 14,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
