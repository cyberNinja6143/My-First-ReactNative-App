import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '@env';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateAccountScreen({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Calculate responsive dimensions
  const contentWidth = Math.min(SCREEN_WIDTH * 0.9, 400);

  // This adds the keyboard, relies on default driver to promote consistancy.
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
          isInteraction: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
          isInteraction: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // These are the notifications.
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
          ],
          { cancelable: false }
        );
      } else if (response.status === 885 || responseText === '885') {
        Alert.alert(
          "Email in use.", 
          "This email is already registered or a verification email has already been sent to this address. Please wait 10 minutes before trying again.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else if (response.status === 500 || responseText === '500') {
        Alert.alert(
          "Server Unavailable", 
          "The server is temporarily down and will be back up as soon as possible. Please try again later.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Error", 
          "An unexpected error occurred. Please try again.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        "Network Error", 
        "Unable to connect to the server. Please check your internet connection and try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4c542' }}>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY: Animated.multiply(keyboardHeight, -0.5) }],
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient
            colors={['#f4c542', '#fef3c7', '#ffffff']}
            style={styles.container}
          >
            {/* The diamond shape */}
            <Svg
                      height={SCREEN_HEIGHT}
                      width={SCREEN_WIDTH}
                      style={styles.backgroundSvg}
                    >
                      {/* Top inverted V (^ shape) - starts from top center, goes to middle edges */}
                      <Path
                        d={`M ${SCREEN_WIDTH / 2} 0 L 0 ${SCREEN_HEIGHT / 2} L ${SCREEN_WIDTH} ${SCREEN_HEIGHT / 2} Z`}
                        fill="rgba(0, 0, 0, 0.08)"
                      />
                      {/* Bottom regular V (V shape) - starts from middle edges, goes to bottom center */}
                      <Path
                        d={`M 0 ${SCREEN_HEIGHT / 2} L ${SCREEN_WIDTH / 2} ${SCREEN_HEIGHT} L ${SCREEN_WIDTH} ${SCREEN_HEIGHT / 2} Z`}
                        fill="rgba(0, 0, 0, 0.08)"
                      />
                    </Svg>

            <View style={styles.contentContainer}>
              <Text style={styles.loginText}>Create Account</Text>
              
              <Text style={styles.align_left}>Username</Text>
              <TextInput
                style={[styles.inputText, { width: contentWidth }]}
                onChangeText={setUsername}
                value={username}
                placeholder="Enter your username"
                placeholderTextColor="#aaaaaa"
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardAppearance="default"
              />
              
              <Text style={styles.align_left}>Email</Text>
              <TextInput
                style={[
                  styles.inputText,
                  { width: contentWidth },
                  !isValid && email.length > 0 ? styles.invalidInput : null,
                ]}
                onChangeText={setEmail}
                value={email}
                placeholder="Enter your email address"
                placeholderTextColor="#aaaaaa"
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardAppearance="default"
              />
              
              <Text style={styles.align_left}>Password</Text>
              <TextInput
                style={[styles.inputText, { width: contentWidth }]}
                onChangeText={setPassword}
                value={password}
                placeholder="Enter your password"
                placeholderTextColor="#aaaaaa"
                autoCapitalize="none"
                secureTextEntry={true}
                textContentType="password"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardAppearance="default"
                autoCorrect={false}
              />
              
              <Text style={styles.align_left}>Confirm Password</Text>
              <TextInput
               style={[styles.inputText, { width: contentWidth }]}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#aaaaaa"
                autoCapitalize="none"
                secureTextEntry={true}
                textContentType="newPassword"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardAppearance="default"
              />
              
              <TouchableOpacity
                style={[styles.GoodButton, { width: contentWidth }, isLoading && styles.disabledButton]}
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
            </View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  GoodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: 'gray',
    backgroundColor: '#020618ff',
    alignItems: 'center',
    marginTop: 20,
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