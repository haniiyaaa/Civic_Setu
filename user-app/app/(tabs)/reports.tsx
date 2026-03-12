import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/services/api';

export default function MyReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

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
    switch (status?.toLowerCase()) {
      case 'resolved': return '#28a745';
      case 'in progress': return '#fd7e14';
      default: return '#dc3545'; // Pending
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'checkmark-circle';
      case 'in progress': return 'time';
      default: return 'alert-circle';
    }
  };

  const openReportDetails = (report: any) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => openReportDetails(item)} activeOpacity={0.85}>
      {item.media && item.media.length > 0 && (
        <Image source={{ uri: item.media[0] }} style={styles.image} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{item.category || 'General Issue'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={11} color="#fff" style={{ marginRight: 3 }} />
            <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        {item.address ? <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#adb5bd" />
          <Text style={styles.address} numberOfLines={1}> {item.address}</Text>
        </View> : null}
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
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
          <Ionicons name="document-text-outline" size={64} color="#ced4da" />
          <Text style={styles.emptyText}>No reports yet</Text>
          <Text style={styles.emptySubText}>Your submitted reports will appear here.</Text>
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

      {/* Report Details Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        useNativeDriver
        hideModalContentWhileAnimating
        swipeDirection="down"
        onSwipeComplete={() => setModalVisible(false)}
      >
        {selectedReport && (
          <View style={styles.modalContent}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategory}>{selectedReport.category || 'General Issue'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status), alignSelf: 'flex-start', marginTop: 6 }]}>
                  <Ionicons name={getStatusIcon(selectedReport.status) as any} size={11} color="#fff" style={{ marginRight: 3 }} />
                  <Text style={styles.statusText}>{selectedReport.status || 'Pending'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Report Images */}
              {selectedReport.media && selectedReport.media.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {selectedReport.media.map((url: string, idx: number) => (
                    <Image key={idx} source={{ uri: url }} style={styles.modalImage} />
                  ))}
                </ScrollView>
              )}

              {/* Description */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionLabel}>
                  <Ionicons name="document-text-outline" size={14} color="#6c757d" /> Description
                </Text>
                <Text style={styles.modalDescription}>{selectedReport.description}</Text>
              </View>

              {/* Address */}
              {selectedReport.address ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionLabel}>
                    <Ionicons name="location-outline" size={14} color="#6c757d" /> Location
                  </Text>
                  <Text style={styles.modalAddress}>{selectedReport.address}</Text>
                </View>
              ) : null}

              {/* Submitted date */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionLabel}>
                  <Ionicons name="calendar-outline" size={14} color="#6c757d" /> Submitted On
                </Text>
                <Text style={styles.modalAddress}>
                  {new Date(selectedReport.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>

              {/* Resolution Section - shown only when resolved */}
              {selectedReport.status === 'Resolved' && (
                <View style={styles.resolutionBox}>
                  <View style={styles.resolutionHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                    <Text style={styles.resolutionTitle}>Issue Resolved</Text>
                  </View>

                  {selectedReport.resolution?.resolvedAt ? (
                    <Text style={styles.resolvedDate}>
                      On {new Date(selectedReport.resolution.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  ) : null}

                  {selectedReport.resolution?.description ? (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.resolutionLabel}>Admin Note:</Text>
                      <Text style={styles.resolutionText}>{selectedReport.resolution.description}</Text>
                    </View>
                  ) : null}

                  {selectedReport.resolution?.proofImage ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.resolutionLabel}>Proof of Resolution:</Text>
                      <Image
                        source={{ uri: selectedReport.resolution.proofImage }}
                        style={styles.proofImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </View>
              )}

              {/* "In Progress" indicator */}
              {selectedReport.status === 'In Progress' && (
                <View style={styles.inProgressBox}>
                  <Ionicons name="time" size={20} color="#fd7e14" />
                  <Text style={styles.inProgressText}>
                    Your report is currently being reviewed by the admin.
                  </Text>
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  list: { padding: 16, paddingBottom: 110 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#495057', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#adb5bd', marginTop: 6, textAlign: 'center' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  image: { height: 160, width: '100%', backgroundColor: '#e9ecef' },
  cardBody: { padding: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 16, fontWeight: '700', color: '#212529', flex: 1, marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 14, color: '#6c757d', marginBottom: 8, lineHeight: 20 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  address: { fontSize: 12, color: '#adb5bd', flex: 1 },
  date: { fontSize: 11, color: '#ced4da', marginTop: 4 },

  // Modal
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, maxHeight: '90%' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#dee2e6', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  modalCategory: { fontSize: 22, fontWeight: '800', color: '#212529' },
  closeBtn: { padding: 4, marginLeft: 8 },
  modalScroll: { maxHeight: 580 },
  modalImage: { width: 240, height: 180, borderRadius: 12, marginRight: 10, backgroundColor: '#f8f9fa' },

  // Detail sections
  detailSection: { marginBottom: 14 },
  detailSectionLabel: { fontSize: 12, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  modalDescription: { fontSize: 15, color: '#343a40', lineHeight: 22 },
  modalAddress: { fontSize: 15, color: '#495057' },

  // Resolution box
  resolutionBox: { backgroundColor: '#f0fff4', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#b7ebc8' },
  resolutionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resolutionTitle: { fontSize: 16, fontWeight: '800', color: '#28a745', marginLeft: 8 },
  resolvedDate: { fontSize: 13, color: '#6c757d', marginBottom: 6, marginLeft: 28 },
  resolutionLabel: { fontSize: 12, fontWeight: '700', color: '#28a745', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  resolutionText: { fontSize: 14, color: '#495057', lineHeight: 20 },
  proofImage: { width: '100%', height: 200, borderRadius: 10, marginTop: 4 },

  // In Progress box
  inProgressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8f0', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#fdd9a8' },
  inProgressText: { fontSize: 14, color: '#fd7e14', marginLeft: 10, flex: 1, fontWeight: '500', lineHeight: 20 },
});
