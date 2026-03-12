import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const MUMBAI_REGION = {
  latitude: 19.0760,
  longitude: 72.8777,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      } 
      // Fetch all reports to display on map
      try {
        const response = await apiClient.get('/report/citizen/allreports');
        if (response.data && response.data.reports) {
          setReports(response.data.reports);
        }
      } catch (error) {
        console.error('Failed to fetch reports for map', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getMarkerIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'road damage': return 'car-sport-outline';
      case 'water supply': return 'water-outline';
      case 'electricity': return 'flash-outline';
      case 'garbage issue': return 'trash-outline';
      case 'drainage problem': return 'water';
      case 'public property damage': return 'build-outline';
      default: return 'alert-circle-outline';
    }
  };

  const openReportDetails = (report: any) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return '#28a745';
      case 'in progress': return '#ffc107';
      default: return '#dc3545'; // Pending
    }
  };

  // Render a non-blocking floating loader instead of hiding the map
  const renderFloatingLoader = () => {
    if (!loading) return null;
    return (
      <View style={styles.floatingLoader}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loaderText}>Loading reports...</Text>
      </View>
    );
  };

  // react-native-maps does not support web. Provide a fallback.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallbackContainer}>
        <Ionicons name="map-outline" size={64} color="#6c757d" />
        <Text style={styles.webFallbackText}>Interactive Maps are not supported on Web.</Text>
        <Text style={styles.webFallbackSubtext}>Please use the iOS or Android Expo app to view the map.</Text>
        
        <TouchableOpacity 
          style={styles.webFab}
          onPress={() => router.push('/create-report')}
        >
          <Text style={{color: '#fff', fontWeight: 'bold'}}>+ Create Report</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={MUMBAI_REGION}
        showsUserLocation={true}
      >
        {reports.map((report: any) => {
          const coords = report.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          
          return (
            <Marker
              key={report._id}
              coordinate={{ latitude: coords[1], longitude: coords[0] }}
              onPress={() => openReportDetails(report)}
            >
              <View style={[styles.markerContainer, { backgroundColor: getStatusColor(report.status) }]}>
                <Ionicons name={getMarkerIcon(report.category) as any} size={24} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {renderFloatingLoader()}
      
      {/* Floating Action Button to Create Report */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/create-report')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Floating Details Window / Modal */}
      <Modal 
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        {selectedReport && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalCategory}>{selectedReport.category || 'General Issue'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#343a40" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {selectedReport.media && selectedReport.media.length > 0 && (
                <Image source={{ uri: selectedReport.media[0] }} style={styles.modalImage} />
              )}
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                <Text style={styles.statusText}>{selectedReport.status || 'Pending'}</Text>
              </View>

              <Text style={styles.modalDescription}>{selectedReport.description}</Text>
              <Text style={styles.modalAddress}>{selectedReport.address || 'No address provided'}</Text>
              
              {selectedReport.resolution?.description && (
                <View style={styles.resolutionBox}>
                  <Text style={styles.resolutionTitle}>Resolution:</Text>
                  <Text style={styles.resolutionText}>{selectedReport.resolution.description}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingLoader: {
    position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4
  },
  loaderText: { marginLeft: 8, color: '#343a40', fontWeight: '600', fontSize: 14 },
  map: { width: '100%', height: '100%' },
  markerContainer: { padding: 5, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  fab: {
    position: 'absolute', bottom: 90, right: 20, backgroundColor: '#007bff',
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalCategory: { fontSize: 20, fontWeight: 'bold', color: '#343a40' },
  modalImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15, backgroundColor: '#e9ecef' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 15 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  modalDescription: { fontSize: 16, color: '#495057', marginBottom: 10, lineHeight: 22 },
  modalAddress: { fontSize: 14, color: '#6c757d', marginBottom: 15 },
  resolutionBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#e9ecef' },
  resolutionTitle: { fontWeight: 'bold', marginBottom: 5, color: '#28a745' },
  resolutionText: { color: '#495057' },
  webFallbackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
  webFallbackText: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginTop: 16, textAlign: 'center' },
  webFallbackSubtext: { fontSize: 14, color: '#6c757d', marginTop: 8, textAlign: 'center' },
  webFab: { marginTop: 20, backgroundColor: '#007bff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
});
