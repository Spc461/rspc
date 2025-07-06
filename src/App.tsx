import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from './0-firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

import LoadingScreen from './components/LoadingScreen';
import FloatingElements from './components/FloatingElements';
import ChoicePage from './components/ChoicePage';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import WorkshopSection from './components/WorkshopSection';
import ClubSection from './components/ClubSection';
import JobApplicationForm from './components/JobApplicationForm';

type AppState = 'loading' | 'choice' | 'courses' | 'basic-form' | 'full-form' | 'workshops' | 'clubs' | 'jobs' | 'admin-login' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (currentPage === 'loading') {
        setCurrentPage('choice');
      }
      if (user && currentPage === 'admin-login') {
        setCurrentPage('admin-dashboard');
      }
      if (!user && currentPage === 'admin-dashboard') {
        setCurrentPage('choice');
      }
    });

    return () => unsubscribe();
  }, [currentPage]);

  const handleChoiceSelect = (type: 'courses' | 'workshops' | 'clubs' | 'jobs' | 'admin' | 'basic' | 'full') => {
    if (type === 'admin') {
      setCurrentPage(user ? 'admin-dashboard' : 'admin-login');
    } else if (type === 'basic' || type === 'full') {
      setCurrentPage(type === 'basic' ? 'basic-form' : 'full-form');
    } else {
      setCurrentPage(type);
    }
  };

  const handleBackToChoice = () => setCurrentPage('choice');
  const handleBackToCourses = () => setCurrentPage('courses');
  const handleAdminLoginSuccess = () => setCurrentPage('admin-dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#22b0fc] to-indigo-900 relative overflow-hidden" dir="rtl">
      <FloatingElements />
      
      <div className="relative z-10 container mx-auto px-4">
        <AnimatePresence mode="wait">
          {currentPage === 'loading' && <LoadingScreen key="loading" />}

          {currentPage === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChoicePage onChoiceSelect={handleChoiceSelect} />
            </motion.div>
          )}

          {currentPage === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChoicePage 
                onChoiceSelect={handleChoiceSelect} 
                onBack={handleBackToChoice}
                showCourseTypes={true}
              />
            </motion.div>
          )}

          {/* Add similar motion.div wrappers for other pages with duration: 0.3 */}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;