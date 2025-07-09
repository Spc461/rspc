import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
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

  const handleChoiceSelect = (type: AppState | 'admin' | 'basic' | 'full') => {
    if (type === 'admin') {
      if (user) {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('admin-login');
      }
    } else if (type === 'basic' || type === 'full') {
      setCurrentPage(type === 'basic' ? 'basic-form' : 'full-form');
    } else {
      setCurrentPage(type as AppState);
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
            onBack={handleBackToChoice}
            showCourseTypes={true}
          />
        );
      case 'basic-form':
      case 'full-form':
        return (
          <RegistrationForm 
            type={currentPage === 'basic-form' ? 'basic' : 'full'} 
            onBack={handleBackToCourses}
          />
        );
      case 'workshops':
        return <WorkshopSection onBack={handleBackToChoice} />;
      case 'clubs':
        return <ClubSection onBack={handleBackToChoice} />;
      case 'jobs':
        return <JobApplicationForm onBack={handleBackToChoice} />;
      case 'internapplication':
        return <InternApplicationForm onBack={handleBackToChoice} />;
      case 'admin-login':
        return (
          <AdminLogin 
            onBack={handleBackToChoice}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        );
      case 'admin-dashboard':
        return user ? <AdminDashboard /> : <LoadingScreen />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#22b0fc', '#4338ca']}
        style={styles.gradient}
      >
        {renderCurrentPage()}
      </LinearGradient>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});