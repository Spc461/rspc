import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Trash2,
  User,
  FileText
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../0-firebase/config';
import { InternApplication } from '../types';
import format from 'date-fns/format';
import arSA from 'date-fns/locale/ar-SA';

const InternApplications = () => {
  const [applications, setApplications] = useState<InternApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<InternApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'internApplications'), orderBy('applicationDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const apps: InternApplication[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ...data,
          applicationDate: data.applicationDate?.toDate()
        } as InternApplication);
      });
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredApplications = applications.filter(app => {
    return (
      (!searchTerm || 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleStatusChange = async (appId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'internApplications', appId), { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (appId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await deleteDoc(doc(db, 'internApplications', appId));
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المجال', 'الحالة', 'التاريخ'].join(',');
    const rows = filteredApplications.map(app => [
      `"${app.fullName}"`,
      `"${app.phone}"`,
      `"${app.email || ''}"`,
      `"${app.internField || ''}"`,
      app.status === 'pending' ? 'قيد المراجعة' : app.status === 'approved' ? 'مقبول' : 'مرفوض',
      `"${format(app.applicationDate, 'yyyy-MM-dd HH:mm', { locale: arSA })}"`
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `طلبات_التدريب_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">جاري تحميل طلبات التدريب...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">طلبات التدريب</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={exportToCSV}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
        >
          <Download size={18} /> تصدير البيانات
        </motion.button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الهاتف أو البريد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22b0fc]"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">الاسم الكامل</th>
              <th className="px-4 py-3">الهاتف</th>
       <th className="px-4 py-3">البريد الالكتروني</th>
              <th className="px-4 py-3">العمر</th>
              <th className="px-4 py-3">المجال</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(app => (
              <tr key={app.id} className="border-b last:border-0">
                <td className="px-4 py-3">{app.fullName}</td>
                <td className="px-4 py-3">{app.phone}</td>
                <td className="px-4 py-3">{app.email}</td>
                <td className="px-4 py-3">{app.internField}</td>
                <td className="px-4 py-3">
                  {app.status === 'pending' && <span className="text-yellow-600">قيد المراجعة</span>}
                  {app.status === 'approved' && <span className="text-green-600">مقبول</span>}
                  {app.status === 'rejected' && <span className="text-red-600">مرفوض</span>}
                </td>
                <td className="px-4 py-3">{format(app.applicationDate, 'yyyy-MM-dd HH:mm', { locale: arSA })}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusChange(app.id, 'approved')}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded-lg flex items-center gap-1 text-xs"
                  >
                    <CheckCircle size={14} /> قبول
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusChange(app.id, 'rejected')}
                    className="bg-red-100 text-red-700 px-2 py-1 rounded-lg flex items-center gap-1 text-xs"
                  >
                    <XCircle size={14} /> رفض
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(app.id)}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg flex items-center gap-1 text-xs"
                  >
                    <Trash2 size={14} /> حذف
                  </motion.button>
                </td>
              </tr>
            ))}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-4">
                  لا توجد طلبات مطابقة للبحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternApplications;
