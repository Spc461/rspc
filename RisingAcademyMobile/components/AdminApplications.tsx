+import React, { useState } from 'react';
+import { 
+  View, 
+  Text, 
+  StyleSheet, 
+  ScrollView, 
+  TouchableOpacity,
+  Alert,
+  Modal
+} from 'react-native';
+import { LinearGradient } from 'expo-linear-gradient';
+import { Ionicons } from '@expo/vector-icons';
+import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
+import { db } from '../firebase.config';
+import { Application } from '../types';
+
+interface AdminApplicationsProps {
+  applications: Application[];
+}
+
+const AdminApplications = ({ applications }: AdminApplicationsProps) => {
+  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
+  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
+
+  const filteredApplications = applications.filter(app => {
+    if (filter === 'all') return true;
+    return app.status === filter;
+  });
+
+  const handleStatusChange = async (appId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
+    try {
+      await updateDoc(doc(db, 'applications', appId), {
+        status: newStatus
+      });
+      Alert.alert('تم', 'تم تحديث حالة الطلب بنجاح');
+    } catch (error) {
+      console.error('Error updating status:', error);
+      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الحالة');
+    }
+  };
+
+  const handleDelete = async (appId: string) => {
+    Alert.alert(
+      'تأكيد الحذف',
+      'هل أنت متأكد من حذف هذا الطلب؟',
+      [
+        { text: 'إلغاء', style: 'cancel' },
+        {
+          text: 'حذف',
+          style: 'destructive',
+          onPress: async () => {
+            try {
+              await deleteDoc(doc(db, 'applications', appId));
+              Alert.alert('تم', 'تم حذف الطلب بنجاح');
+            } catch (error) {
+              console.error('Error deleting application:', error);
+              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
+            }
+          }
+        }
+      ]
+    );
+  };
+
+  const stats = {
+    total: applications.length,
+    pending: applications.filter(app => app.status === 'pending').length,
+    approved: applications.filter(app => app.status === 'approved').length,
+    rejected: applications.filter(app => app.status === 'rejected').length,
+  };
+
+  return (
+    <View style={styles.container}>
+      {/* Stats Cards */}
+      <View style={styles.statsContainer}>
+        {[
+          { title: 'الإجمالي', value: stats.total, color: '#22b0fc', icon: 'document-text-outline' },
+          { title: 'قيد المراجعة', value: stats.pending, color: '#f59e0b', icon: 'time-outline' },
+          { title: 'مقبولة', value: stats.approved, color: '#10b981', icon: 'checkmark-circle-outline' },
+          { title: 'مرفوضة', value: stats.rejected, color: '#ef4444', icon: 'close-circle-outline' },
+        ].map((stat, index) => (
+          <View key={index} style={styles.statCard}>
+            <LinearGradient
+              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
+              style={styles.statCardGradient}
+            >
+              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
+              <Text style={styles.statValue}>{stat.value}</Text>
+              <Text style={styles.statTitle}>{stat.title}</Text>
+            </LinearGradient>
+          </View>
+        ))}
+      </View>
+
+      {/* Filter Buttons */}
+      <View style={styles.filterContainer}>
+        {[
+          { key: 'all', label: 'الكل', color: '#6b7280' },
+          { key: 'pending', label: 'قيد المراجعة', color: '#f59e0b' },
+          { key: 'approved', label: 'مقبولة', color: '#10b981' },
+          { key: 'rejected', label: 'مرفوضة', color: '#ef4444' },
+        ].map((filterOption) => (
+          <TouchableOpacity
+            key={filterOption.key}
+            style={[
+              styles.filterButton,
+              { backgroundColor: filter === filterOption.key ? filterOption.color : '#f3f4f6' }
+            ]}
+            onPress={() => setFilter(filterOption.key as any)}
+          >
+            <Text style={[
+              styles.filterButtonText,
+              { color: filter === filterOption.key ? '#ffffff' : '#6b7280' }
+            ]}>
+              {filterOption.label}
+            </Text>
+          </TouchableOpacity>
+        ))}
+      </View>
+
+      {/* Applications List */}
+      <ScrollView style={styles.applicationsList}>
+        {filteredApplications.map((app, index) => (
+          <View key={app.id} style={styles.applicationCard}>
+            <LinearGradient
+              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
+              style={styles.applicationCardGradient}
+            >
+              <View style={styles.applicationHeader}>
+                <Text style={styles.applicationName}>{app.fullName}</Text>
+                <View style={[
+                  styles.statusBadge,
+                  { backgroundColor: 
+                    app.status === 'approved' ? '#10b981' :
+                    app.status === 'rejected' ? '#ef4444' : '#f59e0b'
+                  }
+                ]}>
+                  <Text style={styles.statusText}>
+                    {app.status === 'approved' ? 'مقبول' :
+                     app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
+                  </Text>
+                </View>
+              </View>
+              
+              <Text style={styles.applicationCourse}>{app.course}</Text>
+              <Text style={styles.applicationPhone}>{app.phone}</Text>
+              
+              <View style={styles.applicationActions}>
+                <TouchableOpacity
+                  style={styles.actionButton}
+                  onPress={() => setSelectedApplication(app)}
+                >
+                  <Ionicons name="eye-outline" size={16} color="#22b0fc" />
+                  <Text style={styles.actionButtonText}>عرض</Text>
+                </TouchableOpacity>
+                
+                {app.status !== 'approved' && (
+                  <TouchableOpacity
+                    style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}
+                    onPress={() => handleStatusChange(app.id!, 'approved')}
+                  >
+                    <Ionicons name="checkmark-outline" size={16} color="#10b981" />
+                    <Text style={[styles.actionButtonText, { color: '#10b981' }]}>قبول</Text>
+                  </TouchableOpacity>
+                )}
+                
+                {app.status !== 'rejected' && (
+                  <TouchableOpacity
+                    style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
+                    onPress={() => handleStatusChange(app.id!, 'rejected')}
+                  >
+                    <Ionicons name="close-outline" size={16} color="#ef4444" />
+                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>رفض</Text>
+                  </TouchableOpacity>
+                )}
+                
+                <TouchableOpacity
+                  style={[styles.actionButton, { backgroundColor: '#f3f4f6' }]}
+                  onPress={() => handleDelete(app.id!)}
+                >
+                  <Ionicons name="trash-outline" size={16} color="#6b7280" />
+                  <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>حذف</Text>
+                </TouchableOpacity>
+              </View>
+            </LinearGradient>
+          </View>
+        ))}
+      </ScrollView>
+
+      {/* Application Details Modal */}
+      <Modal
+        visible={selectedApplication !== null}
+        animationType="slide"
+        presentationStyle="pageSheet"
+        onRequestClose={() => setSelectedApplication(null)}
+      >
+        {selectedApplication && (
+          <View style={styles.modalContainer}>
+            <View style={styles.modalHeader}>
+              <Text style={styles.modalTitle}>تفاصيل الطلب</Text>
+              <TouchableOpacity
+                style={styles.closeButton}
+                onPress={() => setSelectedApplication(null)}
+              >
+                <Ionicons name="close" size={24} color="#6b7280" />
+              </TouchableOpacity>
+            </View>
+            
+            <ScrollView style={styles.modalContent}>
+              <View style={styles.detailSection}>
+                <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>الاسم:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.fullName}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>العمر:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.age}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>الهاتف:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.phone}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>البريد:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.email || 'غير متوفر'}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>الولاية:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.wilaya}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>التعليم:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.education}</Text>
+                </View>
+              </View>
+              
+              <View style={styles.detailSection}>
+                <Text style={styles.sectionTitle}>معلومات الدورة</Text>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>الدورة:</Text>
+                  <Text style={styles.detailValue}>{selectedApplication.course}</Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>نوع التسجيل:</Text>
+                  <Text style={styles.detailValue}>
+                    {selectedApplication.registrationType === 'Basic' ? 'أولي' : 'كامل'}
+                  </Text>
+                </View>
+                <View style={styles.detailRow}>
+                  <Text style={styles.detailLabel}>الحالة:</Text>
+                  <Text style={[
+                    styles.detailValue,
+                    { color: 
+                      selectedApplication.status === 'approved' ? '#10b981' :
+                      selectedApplication.status === 'rejected' ? '#ef4444' : '#f59e0b'
+                    }
+                  ]}>
+                    {selectedApplication.status === 'approved' ? 'مقبول' :
+                     selectedApplication.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
+                  </Text>
+                </View>
+              </View>
+              
+              {(selectedApplication.experience || selectedApplication.comments) && (
+                <View style={styles.detailSection}>
+                  <Text style={styles.sectionTitle}>معلومات إضافية</Text>
+                  {selectedApplication.experience && (
+                    <View style={styles.detailRow}>
+                      <Text style={styles.detailLabel}>الخبرة:</Text>
+                      <Text style={styles.detailValue}>{selectedApplication.experience}</Text>
+                    </View>
+                  )}
+                  {selectedApplication.comments && (
+                    <View style={styles.detailRow}>
+                      <Text style={styles.detailLabel}>ملاحظات:</Text>
+                      <Text style={styles.detailValue}>{selectedApplication.comments}</Text>
+                    </View>
+                  )}
+                </View>
+              )}
+            </ScrollView>
+          </View>
+        )}
+      </Modal>
+    </View>
+  );
+};
+
+const styles = StyleSheet.create({
+  container: {
+    flex: 1,
+  },
+  statsContainer: {
+    flexDirection: 'row',
+    flexWrap: 'wrap',
+    gap: 12,
+    marginBottom: 20,
+  },
+  statCard: {
+    width: '48%',
+    borderRadius: 12,
+    overflow: 'hidden',
+  },
+  statCardGradient: {
+    padding: 16,
+    alignItems: 'center',
+  },
+  statValue: {
     fontSize: 16,
-    color: '#4b5563',
-    textAlign: 'center',
-    lineHeight: 24,
-    marginBottom: 12,
+    fontWeight: 'bold',
+    color: '#1f2937',
+    marginTop: 8,
   },
-  messageSubtext: {
+  statTitle: {
+    fontSize: 12,
+    color: '#6b7280',
+    marginTop: 4,
+    textAlign: 'center',
+  },
+  filterContainer: {
+    flexDirection: 'row',
+    gap: 8,
+    marginBottom: 20,
+  },
+  filterButton: {
+    paddingHorizontal: 12,
+    paddingVertical: 8,
+    borderRadius: 8,
+  },
+  filterButtonText: {
+    fontSize: 12,
+    fontWeight: '600',
+  },
+  applicationsList: {
+    flex: 1,
+  },
+  applicationCard: {
+    marginBottom: 12,
+    borderRadius: 12,
+    overflow: 'hidden',
+  },
+  applicationCardGradient: {
+    padding: 16,
+  },
+  applicationHeader: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+    alignItems: 'center',
+    marginBottom: 8,
+  },
+  applicationName: {
+    fontSize: 16,
+    fontWeight: 'bold',
+    color: '#1f2937',
+    flex: 1,
+  },
+  statusBadge: {
+    paddingHorizontal: 8,
+    paddingVertical: 4,
+    borderRadius: 12,
+  },
+  statusText: {
+    color: '#ffffff',
+    fontSize: 10,
+    fontWeight: '600',
+  },
+  applicationCourse: {
     fontSize: 14,
+    color: '#4b5563',
+    marginBottom: 4,
+  },
+  applicationPhone: {
+    fontSize: 12,
     color: '#6b7280',
-    textAlign: 'center',
-    fontStyle: 'italic',
+    marginBottom: 12,
   },
-  quickStats: {
-    marginBottom: 24,
+  applicationActions: {
+    flexDirection: 'row',
+    gap: 8,
+    flexWrap: 'wrap',
   },
-  sectionTitle: {
-    fontSize: 20,
-    fontWeight: 'bold',
-    color: '#ffffff',
-    marginBottom: 16,
+  actionButton: {
+    flexDirection: 'row',
+    alignItems: 'center',
+    backgroundColor: '#eff6ff',
+    paddingHorizontal: 8,
+    paddingVertical: 6,
+    borderRadius: 6,
+    gap: 4,
+  },
+  actionButtonText: {
+    fontSize: 10,
+    fontWeight: '600',
+    color: '#22b0fc',
+  },
+  modalContainer: {
+    flex: 1,
+    backgroundColor: '#ffffff',
+  },
+  modalHeader: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+    alignItems: 'center',
+    padding: 20,
+    borderBottomWidth: 1,
+    borderBottomColor: '#e5e7eb',
+  },
+  modalTitle: {
+    fontSize: 18,
+    fontWeight: 'bold',
+    color: '#1f2937',
+  },
+  closeButton: {
+    padding: 4,
+  },
+  modalContent: {
+    flex: 1,
+    padding: 20,
+  },
+  detailSection: {
+    marginBottom: 24,
+  },
+  sectionTitle: {
+    fontSize: 16,
+    fontWeight: 'bold',
+    color: '#1f2937',
+    marginBottom: 12,
+  },
+  detailRow: {
+    flexDirection: 'row',
+    marginBottom: 8,
+  },
+  detailLabel: {
+    fontSize: 14,
+    color: '#6b7280',
+    width: 80,
+  },
+  detailValue: {
+    fontSize: 14,
+    color: '#1f2937',
+    flex: 1,
+  },
+});
+
+export default AdminApplications;
+