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
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { registerUser } from '../Routes';
import { GlobalStyles, SCREEN_DIMENSIONS } from './GlobalStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = SCREEN_DIMENSIONS;

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

    // Call the centralized register function
    const result = await registerUser(username, email, password);

    if (result.success) {
      Alert.alert(
        "Email Sent!", 
        result.message, 
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
    } else {
      // Show appropriate error message based on error code
      if (result.errorCode === '885') {
        Alert.alert(
          "Email in use.", 
          result.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else if (result.errorCode === '500') {
        Alert.alert(
          "Server Unavailable", 
          result.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else if (result.errorCode === 'network') {
        Alert.alert(
          "Network Error", 
          result.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Error", 
          result.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    }

    setIsLoading(false);
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
            style={GlobalStyles.container}
          >
            {/* The diamond shape */}
            <Svg
              height={SCREEN_HEIGHT}
              width={SCREEN_WIDTH}
              style={GlobalStyles.backgroundSvg}
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
              <Text style={GlobalStyles.loginText}>Create Account</Text>
              
              <Text style={GlobalStyles.align_left}>Username</Text>
              <TextInput
                style={[GlobalStyles.inputText, { width: contentWidth }]}
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
              
              <Text style={GlobalStyles.align_left}>Email</Text>
              <TextInput
                style={[
                  GlobalStyles.inputText,
                  { width: contentWidth },
                  !isValid && email.length > 0 ? GlobalStyles.invalidInput : null,
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
              
              <Text style={GlobalStyles.align_left}>Password</Text>
              <TextInput
                style={[GlobalStyles.inputText, { width: contentWidth }]}
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
              
              <Text style={GlobalStyles.align_left}>Confirm Password</Text>
              <TextInput
                style={[GlobalStyles.inputText, { width: contentWidth }]}
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
                style={[GlobalStyles.GoodButton, { width: contentWidth }, isLoading && GlobalStyles.disabledButton]}
                onPress={handleCreateAccount}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#eceefaff" />
                ) : (
                  <Text style={GlobalStyles.buttonText}>Create Account</Text>
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
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});