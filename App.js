import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { refreshToken, getStoredToken, logoutUser } from './Routes';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import LoggedInScreen from './screens/LoggedInScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');

  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      // Get stored token
      const token = await getStoredToken();
      
      if (!token) {
        setCurrentScreen('login');
        return;
      }

      // Attempt to refresh token
      const result = await refreshToken(token);

      if (result.success) {
        // Token refreshed successfully, navigate to logged in screen
        setCurrentScreen('loggedIn');
      } else {
        // Token refresh failed, navigate to login
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentScreen('login');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentScreen('login');
  };

  if (currentScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#020618ff" />
      </View>
    );
  }

  if (currentScreen === 'login') {
    return <LoginScreen 
      onLoginSuccess={() => setCurrentScreen('loggedIn')}
      onNavigateToCreateAccount={() => setCurrentScreen('createAccount')}
    />;
  }

  if (currentScreen === 'createAccount') {
    return <CreateAccountScreen 
      onNavigateToLogin={() => setCurrentScreen('login')}
    />;
  }

  if (currentScreen === 'loggedIn') {
    return <LoggedInScreen onLogout={handleLogout} />;
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f4c542',
    justifyContent: 'center',
    alignItems: 'center',
  },
});