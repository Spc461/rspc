import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import FloatingElements from './components/FloatingElements';
import ChoicePage from './components/ChoicePage';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

type AppState = 'choice' | 'basic-form' | 'full-form' | 'admin-login' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('choice');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    return () => unsubscribe();
  }, [currentPage]);

  const handleChoiceSelect = (type: 'basic' | 'full' | 'admin') => {
    if (type === 'admin') {
      if (user) {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('admin-login');
      }
    } else {
      setCurrentPage(type === 'basic' ? 'basic-form' : 'full-form');
    }
  };

  const handleBackToChoice = () => {
    setCurrentPage('choice');
  };

  const handleAdminLoginSuccess = () => {
    setCurrentPage('admin-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#22b0fc] to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#22b0fc] to-indigo-900 relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 container mx-auto px-4">
        <AnimatePresence mode="wait">
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
                onBack={handleBackToChoice}
              />
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

export default App;