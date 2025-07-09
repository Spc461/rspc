import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase.config';

import LoadingScreen from './components/LoadingScreen';
import ChoicePage from './components/ChoicePage';
import RegistrationForm from './components/RegistrationForm';
import WorkshopSection from './components/WorkshopSection';
import ClubSection from './components/ClubSection';
import JobApplicationForm from './components/JobApplicationForm';
import InternApplicationForm from './components/InternApplicationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

type AppState = 
  | 'loading' 
  | 'choice' 
  | 'courses' 
  | 'basic-form' 
  | 'full-form' 
  | 'workshops' 
  | 'clubs' 
  | 'jobs' 
  | 'internapplication'
  | 'admin-login' 
  | 'admin-dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<AppState[]>(['loading']);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setCurrentPage('choice');
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      setCurrentPage((prevPage) => {
        if (firebaseUser && prevPage === 'admin-login') {
          return 'admin-dashboard';
        }
        if (!firebaseUser && prevPage === 'admin-dashboard') {
          return 'choice';
        }
        return prevPage;
      });
    });

    return () => {
      clearTimeout(loadingTimer);
      unsubscribe();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigationHistory]);

  const navigateToPage = useCallback((page: AppState) => {
    setNavigationHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  }, [currentPage]);

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const previousPage = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage);
    } else {
      setCurrentPage('choice');
    }
  }, [navigationHistory]);

  const handleChoiceSelect = (type: AppState | 'admin' | 'basic' | 'full') => {
    if (type === 'admin') {
      if (user) {
        navigateToPage('admin-dashboard');
      } else {
        navigateToPage('admin-login');
      }
    } else if (type === 'basic' || type === 'full') {
      navigateToPage(type === 'basic' ? 'basic-form' : 'full-form');
    } else {
      navigateToPage(type as AppState);
    }
  };

  const handleCourseTypeSelect = (type: 'basic' | 'full') => {
    navigateToPage(type === 'basic' ? 'basic-form' : 'full-form');
  };

  const handleAdminLoginSuccess = () => {
    navigateToPage('admin-dashboard');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'loading':
        return <LoadingScreen />;
      case 'choice':
        return <ChoicePage onChoiceSelect={handleChoiceSelect} />;
      case 'courses':
        return (
          <ChoicePage 
            onChoiceSelect={handleCourseTypeSelect} 
            onBack={handleBack}
            showCourseTypes={true}
          />
        );
      case 'basic-form':
      case 'full-form':
        return (
          <RegistrationForm 
            type={currentPage === 'basic-form' ? 'basic' : 'full'} 
            onBack={handleBack}
          />
        );
      case 'workshops':
        return <WorkshopSection onBack={handleBack} />;
      case 'clubs':
        return <ClubSection onBack={handleBack} />;
      case 'jobs':
        return <JobApplicationForm onBack={handleBack} />;
      case 'internapplication':
        return <InternApplicationForm onBack={handleBack} />;
      case 'admin-login':
        return (
          <AdminLogin 
            onBack={handleBack}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        );
      case 'admin-dashboard':
        return user ? <AdminDashboard onBack={handleBack} /> : <LoadingScreen />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {renderCurrentPage()}
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});