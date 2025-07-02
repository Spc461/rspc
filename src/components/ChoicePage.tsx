import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, CreditCard, Shield, Calendar } from 'lucide-react';
import WorkshopSection from './WorkshopSection';
import WorkshopRegistrationModal from './WorkshopRegistrationModal';
import { Workshop } from '../types';

interface ChoicePageProps {
  onChoiceSelect: (type: 'basic' | 'full' | 'admin') => void;
}

const ChoicePage = ({ onChoiceSelect }: ChoicePageProps) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  const handleWorkshopRegister = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-6xl w-full">
        {/* Logo and Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-[#22b0fc] rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/mainlogo.png" 
                alt="Rising Academy Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to graduation cap if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <GraduationCap className="w-16 h-16 text-[#22b0fc] hidden" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            اختر نوع التسجيل
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            اختر طريقة التسجيل التي تناسبك في أكاديمية رايزين للتسجيل والاستشارات
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="group cursor-pointer"
            onClick={() => onChoiceSelect('basic')}
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl hover:shadow-[#22b0fc]/25 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22b0fc]/5 to-cyan-500/5 group-hover:from-[#22b0fc]/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-[#22b0fc] to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">تسجيل أولي</h3>
                <p className="text-gray-600 text-lg mb-6">
                تسجيل كمرحلة اولى يحتاج منك التوجه الى المركز بعد التواصل
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#22b0fc] rounded-full ml-3"></div>
                    حجز مكانك في الدورة
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#22b0fc] rounded-full ml-3"></div>
                    معلومات تفصيلية عن المنهج
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#22b0fc] rounded-full ml-3"></div>
                    إمكانية التواصل المباشر
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotateY: -5 }}
            className="group cursor-pointer"
            onClick={() => onChoiceSelect('full')}
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">تسجيل كلي</h3>
                <p className="text-gray-600 text-lg mb-6">
                  تسجيل كامل مع دفع اما مرة واحدة او جزئيا وضمان مكانك في الدورة
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full ml-3"></div>
                    ضمان مكانك بنسبة 100%
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full ml-3"></div>
                    امكانية التسجيل عن بعد كليا
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full ml-3"></div>
                    متابعة مستمرة بعد الدورة
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Workshops Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <WorkshopSection onRegister={handleWorkshopRegister} />
          </div>
        </motion.div>

        {/* Admin Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChoiceSelect('admin')}
            className="bg-gradient-to-r from-[#22b0fc] to-blue-600 hover:from-[#1a9de8] hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[#22b0fc]/25 transition-all duration-300 flex items-center mx-auto"
          >
            <Shield className="w-6 h-6 ml-3" />
            الدخول للإدارة
          </motion.button>
        </motion.div>
      </div>

      {/* Workshop Registration Modal */}
      {selectedWorkshop && (
        <WorkshopRegistrationModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}
    </motion.div>
  );
};

export default ChoicePage;