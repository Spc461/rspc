import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from './0-firebase/config';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 3 seconds
    const loadingTimer = setTimeout(() => {
      setCurrentPage('choice');
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // If user is logged in and on admin-login page, redirect to dashboard
      if (user && currentPage === 'admin-login') {
        setCurrentPage('admin-dashboard');
      }
      // If user is logged out and on admin-dashboard page, redirect to choice
      if (!user && currentPage === 'admin-dashboard') {
        setCurrentPage('choice');
      }
    });

    return () => {
      clearTimeout(loadingTimer);
      unsubscribe();
    };
  }, [currentPage]);

  const handleChoiceSelect = (type: 'courses' | 'workshops' | 'clubs' | 'jobs' | 'admin' | 'basic' | 'full') => {
    if (type === 'admin') {
      if (user) {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('admin-login');
      }
    } else if (type === 'basic' || type === 'full') {
      setCurrentPage(type === 'basic' ? 'basic-form' : 'full-form');
    } else if (type === 'courses') {
      setCurrentPage('courses');
    } else {
      setCurrentPage(type);
    }
  };

  const handleCourseTypeSelect = (type: 'basic' | 'full') => {
    setCurrentPage(type === 'basic' ? 'basic-form' : 'full-form');
  };

  const handleBackToChoice = () => {
    setCurrentPage('choice');
  };

  const handleBackToCourses = () => {
    setCurrentPage('courses');
  };

  const handleAdminLoginSuccess = () => {
    setCurrentPage('admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#22b0fc] to-indigo-900 relative overflow-hidden" dir="rtl">
      <FloatingElements />
      
      <div className="relative z-10 container mx-auto px-4">
        <AnimatePresence mode="wait">
          {currentPage === 'loading' && (
            <LoadingScreen key="loading" />
          )}

          {currentPage === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
              transition={{ duration: 0.5 }}
            >
              <ChoicePage 
                onChoiceSelect={handleCourseTypeSelect} 
                onBack={handleBackToChoice}
                showCourseTypes={true}
              />
            </motion.div>
          )}

          {(currentPage === 'basic-form' || currentPage === 'full-form') && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RegistrationForm 
                type={currentPage === 'basic-form' ? 'basic' : 'full'} 
                onBack={handleBackToCourses}
              />
            </motion.div>
          )}

          {currentPage === 'workshops' && (
            <motion.div
              key="workshops"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <WorkshopSection onBack={handleBackToChoice} />
            </motion.div>
          )}

          {currentPage === 'clubs' && (
            <motion.div
              key="clubs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ClubSection onBack={handleBackToChoice} />
            </motion.div>
          )}

          {currentPage === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <JobApplicationForm onBack={handleBackToChoice} />
            </motion.div>
          )}

          {currentPage === 'admin-login' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdminLogin 
                onBack={handleBackToChoice}
                onLoginSuccess={handleAdminLoginSuccess}
              />
            </motion.div>
          )}

          {currentPage === 'admin-dashboard' && user && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
