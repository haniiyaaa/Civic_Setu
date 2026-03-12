import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    try {
      const response = await apiClient.get('/report/citizen/myreports');
      if (response.data && response.data.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch user reports', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyReports();
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return '#28a745';
      case 'in progress': return '#ffc107';
      default: return '#dc3545'; // Pending
    }
  };

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // ... (keep fetch logic, just adding to renderItem and returned JSX)

  const openReportDetails = (report: any) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => openReportDetails(item)}>
      {item.media && item.media.length > 0 && (
        <Image source={{ uri: item.media[0] }} style={styles.image} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{item.category || 'General Issue'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven&apos;t submitted any reports yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

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
              
              <View style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(selectedReport.status) }]}>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100, // account for tab bar
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 150,
    width: '100%',
    backgroundColor: '#e9ecef',
  },
  cardBody: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#adb5bd',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalCategory: { fontSize: 20, fontWeight: 'bold', color: '#343a40' },
  modalImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15, backgroundColor: '#e9ecef' },
  statusBadgeDetail: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 15 },
  modalDescription: { fontSize: 16, color: '#495057', marginBottom: 10, lineHeight: 22 },
  modalAddress: { fontSize: 14, color: '#6c757d', marginBottom: 15 },
  resolutionBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#e9ecef' },
  resolutionTitle: { fontWeight: 'bold', marginBottom: 5, color: '#28a745' },
  resolutionText: { color: '#495057' },
});
