import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../0-firebase/config';
import { Workshop } from '../types';
import format from 'date-fns/format';
import arSA from 'date-fns/locale/ar-SA';

interface WorkshopSectionProps {
  onRegister: (workshop: Workshop) => void;
}

const WorkshopSection = ({ onRegister }: WorkshopSectionProps) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'workshops'), 
      where('isActive', '==', true),
      orderBy('date', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workshopsData: Workshop[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const workshopDate = data.date?.toDate();
        
        // Show all future workshops (including today)
        if (workshopDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          
          if (workshopDate >= today) {
            workshopsData.push({ 
              id: doc.id, 
              ...data,
              date: workshopDate,
              createdAt: data.createdAt?.toDate()
            } as Workshop);
          }
        }
      });
      setWorkshops(workshopsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching workshops:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22b0fc]"></div>
        <p className="mr-4 text-gray-600">جاري تحميل الورش...</p>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد ورش متاحة حالياً</h3>
        <p className="text-gray-500">تابعونا للحصول على آخر التحديثات حول الورش القادمة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">الورش المجانية القادمة</h2>
        <p className="text-gray-600 text-lg">
          انضم إلى ورشنا المجانية واكتسب مهارات جديدة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop, index) => (
          <motion.div
            key={workshop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={workshop.imageUrl}
                alt={workshop.arabicName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  e.currentTarget.src = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-sm font-semibold text-gray-800">مجاني</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {workshop.arabicName}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {workshop.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="ml-3 text-[#22b0fc]" />
                  <span className="font-medium">
                    {format(workshop.date, 'EEEE، dd MMMM yyyy', { locale: arSA })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={18} className="ml-3 text-[#22b0fc]" />
                  <span>{workshop.duration}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={18} className="ml-3 text-[#22b0fc]" />
                  <span>
                    {workshop.maxParticipants - workshop.currentParticipants} مقعد متبقي
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="ml-3 text-[#22b0fc]" />
                  <span>أكاديمية رايزين</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRegister(workshop)}
                disabled={workshop.currentParticipants >= workshop.maxParticipants}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                  workshop.currentParticipants >= workshop.maxParticipants
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#22b0fc] to-blue-600 hover:from-[#1a9de8] hover:to-blue-700 text-white shadow-lg hover:shadow-[#22b0fc]/25'
                }`}
              >
                {workshop.currentParticipants >= workshop.maxParticipants 
                  ? 'الورشة مكتملة' 
                  : 'سجل الآن مجاناً'
                }
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkshopSection;