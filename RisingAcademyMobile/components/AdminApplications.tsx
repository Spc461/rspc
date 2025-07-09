import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

interface Application {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'approved';
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const q = collection(db, 'applications'); // Firestore collection name
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: Application[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Application, 'id'>),
      }));
      setApplications(apps);
    });

    return () => unsubscribe();
  }, []);

  const approveApplication = async (id: string) => {
    await updateDoc(doc(db, 'applications', id), { status: 'approved' });
  };

  const deleteApplication = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'applications', id));
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Application }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.type}>نوع الطلب: {item.type}</Text>
      <Text style={styles.status}>الحالة: {item.status}</Text>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => approveApplication(item.id)} style={styles.approve}>
            <Text style={styles.buttonText}>موافقة</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteApplication(item.id)} style={styles.reject}>
            <Text style={styles.buttonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>طلبات الإدارة</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات حالياً.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  approve: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  reject: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});
