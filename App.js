// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
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
      const token = await AsyncStorage.getItem('jwt_token');
      
      if (!token) {
        setCurrentScreen('login');
        return;
      }

      const response = await fetch(`${API_URL}/refreash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const newToken = data.accessToken;
        
        if (newToken && newToken.trim() !== '') {
          await AsyncStorage.setItem('jwt_token', newToken);
          setCurrentScreen('loggedIn');
        } else {
          await AsyncStorage.removeItem('jwt_token');
          setCurrentScreen('login');
        }
      } else {
        await AsyncStorage.removeItem('jwt_token');
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('jwt_token');
      setCurrentScreen('login');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
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