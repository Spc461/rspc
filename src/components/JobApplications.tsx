import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
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
import { JobApplication } from '../types';
import format from 'date-fns/format';
import arSA from 'date-fns/locale/ar-SA';

const JobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<'all' | 'teacher' | 'staff'>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const applicationsQuery = query(
      collection(db, 'jobApplications'), 
      orderBy('applicationDate', 'desc')
    );
    
    const unsubscribeApplications = onSnapshot(applicationsQuery, (querySnapshot) => {
      const apps: JobApplication[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({ 
          id: doc.id, 
          ...data,
          applicationDate: data.applicationDate?.toDate() 
        } as JobApplication);
      });
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribeApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesJobType = selectedJobType === 'all' || app.jobType === selectedJobType;
    const matchesSearch = !searchTerm || 
      (app.fullName && app.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.phone && app.phone.includes(searchTerm)) ||
      (app.email && app.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesJobType && matchesSearch;
  });

  const handleStatusChange = async (appId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'jobApplications', appId), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (appId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await deleteDoc(doc(db, 'jobApplications', appId));
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = [
      'الاسم الكامل', 'العمر', 'الهاتف', 'البريد الإلكتروني', 
      'نوع الوظيفة', 'التخصص', 'الحالة', 'تاريخ التقديم'
    ].join(',');

    const rows = filteredApplications.map(app => [
      `"${app.fullName}"`,
      `"${app.age}"`,
      `"${app.phone}"`,
      `"${app.email || ''}"`,
      app.jobType === 'teacher' ? 'مدرس' : 'موظف إداري',
      `"${app.teachingLanguage || app.staffField || ''}"`,
      app.status === 'pending' ? 'قيد المراجعة' : app.status === 'approved' ? 'مقبول' : 'مرفوض',
      `"${app.applicationDate ? format(app.applicationDate, 'yyyy-MM-dd HH:mm', { locale: arSA }) : 'غير متوفر'}"`
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `طلبات_التوظيف_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: applications.length,
    teachers: applications.filter(app => app.jobType === 'teacher').length,
    staff: applications.filter(app => app.jobType === 'staff').length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22b0fc] mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل طلبات التوظيف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {selectedApplication && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedApplication(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">تفاصيل طلب التوظيف</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="إغلاق"
              >
                ×
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default JobApplications;
