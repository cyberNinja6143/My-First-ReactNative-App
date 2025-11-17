import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Animated,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';

export default function CreateAccountScreen({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(shift, {
        toValue: -e.endCoordinates.height / 2,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(shift, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const validateCreateAccount = () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Please enter a username");
      return false;
    }
    if (!isValid) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      Alert.alert("Validation Error", "Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateCreateAccount()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          Password: password,
          Email: email,
        }),
      });

      const responseText = await response.text();

      if (response.status === 200) {
        Alert.alert(
          "Email Sent!", 
          "Please verify your email before logging in.", 
          [
            {
              text: "Okay", 
              onPress: () => {
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                onNavigateToLogin();
              }
            }
          ]
        );
      } else if (response.status === 885 || responseText === '885') {
        Alert.alert(
          "Email in use.", 
          "This email is already registered or a verification email has already been sent to this address. Please wait 10 minutes before trying again."
        );
      } else if (response.status === 500 || responseText === '500') {
        Alert.alert(
          "Server Unavailable", 
          "The server is temporarily down and will be back up as soon as possible. Please try again later."
        );
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: 20,
              transform: [{ translateY: shift }],
            }}
          >
            <Text style={styles.loginText}>Create Account</Text>
            <Text style={styles.align_left}>Username</Text>
            <TextInput
              style={styles.inputText}
              onChangeText={setUsername}
              value={username}
              placeholder="Enter your username"
              placeholderTextColor="#aaaaaa"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Text style={styles.align_left}>Email</Text>
            <TextInput
              style={[
                styles.inputText,
                !isValid && email.length > 0 ? styles.invalidInput : null,
              ]}
              onChangeText={setEmail}
              value={email}
              placeholder="Enter your email address"
              placeholderTextColor="#aaaaaa"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            <Text style={styles.align_left}>Password</Text>
            <TextInput
              style={[
                styles.inputText,
                password.length > 0 && password.length < 8 ? styles.invalidInput : null,
              ]}
              onChangeText={setPassword}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="#aaaaaa"
              autoCapitalize="none"
              secureTextEntry={true}
              editable={!isLoading}
            />
            <Text style={styles.align_left}>Confirm Password</Text>
            <TextInput
              style={[
                styles.inputText,
                confirmPassword.length > 0 && password !== confirmPassword ? styles.invalidInput : null,
              ]}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#aaaaaa"
              autoCapitalize="none"
              secureTextEntry={true}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.GoodButton, isLoading && styles.disabledButton]}
              onPress={handleCreateAccount}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#eceefaff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={onNavigateToLogin}
              disabled={isLoading}>
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4c542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  GoodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: 'gray',
    backgroundColor: '#020618ff',
    alignItems: 'center',
    marginTop: 20,
    width: 400,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#eceefaff",
    fontWeight: "bold",
    fontSize: 18,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 15,
  },
  backButtonText: {
    color: "#020618ff",
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loginText: {
    fontSize: 35,       
    fontWeight: 'bold', 
    fontFamily: 'Arial',
    color: '#020618ff',
    textAlign: 'center',
  },
  align_left: {
    fontSize: 20,
    alignSelf: 'flex-start',
    marginTop: 15,
    marginBottom: 5,
  },
  inputText: {
    height: 40,
    width: 400,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  invalidInput: {
    textDecorationLine: "underline",
    textDecorationColor: "red",
    textDecorationStyle: "wavy",
  },
});