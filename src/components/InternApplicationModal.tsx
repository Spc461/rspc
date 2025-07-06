import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../0-firebase/config';

const InternApplicationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    placeOfBirth: '',
    address: '',
    skills: '',
    agreedToContract: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const signatureRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        throw new Error('Signature is required');
      }
      const applicationData = {
        ...formData,
        age: parseInt(formData.age),
        signature: signatureRef.current.toDataURL(),
        applicationDate: new Date(),
        status: 'pending'
      };
      await addDoc(collection(db, 'internApplications'), applicationData);
      setSubmitStatus('success');
      setTimeout(() => {
        setFormData({
          fullName: '', age: '', phone: '', email: '', dateOfBirth: '',
          placeOfBirth: '', address: '', skills: '', agreedToContract: false
        });
        setSubmitStatus(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting intern application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">طلب تربص</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {submitStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تم التقديم بنجاح!</h3>
            <p className="text-gray-600">تم تقديم طلب التربص بنجاح. سنتواصل معك قريباً.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" required placeholder="الاسم الكامل" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="number" required placeholder="العمر" value={formData.age} onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="tel" required placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="text" required placeholder="مكان الميلاد" value={formData.placeOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, placeOfBirth: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <input type="text" required placeholder="العنوان الكامل" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <textarea placeholder="اذكر مهاراتك وخبراتك..." value={formData.skills} onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300" />
            <div>
              <label className="block font-semibold mb-1">التوقيع *</label>
              <SignatureCanvas ref={signatureRef} canvasProps={{ className: 'w-full h-32 border border-gray-300 rounded-lg' }} />
              <button type="button" onClick={() => signatureRef.current?.clear()} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">مسح التوقيع</button>
            </div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" required checked={formData.agreedToContract} onChange={(e) => setFormData(prev => ({ ...prev, agreedToContract: e.target.checked }))} />
              <span>أوافق على الشروط والسياسات</span>
            </label>
            {submitStatus === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">حدث خطأ أثناء التقديم. حاول مجدداً.</div>}
            <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-3 rounded-xl text-white font-bold ${isSubmitting ? 'bg-gray-500' : 'bg-purple-500 hover:bg-purple-600'}`}>
              {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InternApplicationModal;
