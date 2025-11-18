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
  Image,
  ActivityIndicator,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { loginUser } from '../../Routes';
import { GlobalStyles, SCREEN_DIMENSIONS } from '../../sharedResources/sharedStyles/PreLoginStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = SCREEN_DIMENSIONS;

export default function LoginScreen({ onLoginSuccess, onNavigateToCreateAccount }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Calculate responsive dimensions
  const contentWidth = Math.min(SCREEN_WIDTH * 0.9, 400);
  const imageSize = Math.min(SCREEN_WIDTH * 0.5, 200);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const greeting = getGreeting();
    const fullText = `${greeting} master, welcome back to your app.`;
    const greetingLength = greeting.length + 7;
    let index = 0;
    
    setDisplayedText('');
    setShowCursor(true);
    
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        if (index === greetingLength) {
          setTimeout(() => {
            setDisplayedText(fullText.slice(0, index + 1));
            index++;
          }, 500);
        } else {
          setDisplayedText(fullText.slice(0, index + 1));
          index++;
        }
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowCursor(false), 500);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (showCursor) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [showCursor]);

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

  const handleLogin = async () => {
    setIsLoading(true);

    // Call the centralized login function
    const result = await loginUser(email, password);

    if (result.success) {
      // Clear form and navigate
      setEmail('');
      setPassword('');
      onLoginSuccess();
    } else {
      // Show appropriate error message
      if (result.errorCode === '588' || result.errorCode === '800') {
        Alert.alert("Login Failed", result.message);
      } else if (result.errorCode === '566') {
        Alert.alert("Email Not Confirmed", result.message);
      } else if (result.errorCode === 'network') {
        Alert.alert("Network Error", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#f4c542', '#fef3c7', '#ffffff']}
        style={GlobalStyles.container}
      >
        {/* Background V shapes */}
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

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: 20,
              alignItems: 'center',
              transform: [
                { 
                  translateY: Animated.multiply(keyboardHeight, -0.3)
                }
              ],
            }}
          >
            <Image 
              source={require('../../assets/app-pictures/assistant.png')}
              style={[styles.assistantImage, { width: imageSize, height: imageSize }]}
              resizeMode="contain"
            />
            <Text style={[styles.greetingText, { maxWidth: contentWidth }]}>
              {displayedText}
              {showCursor && (
                <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                  |
                </Animated.Text>
              )}
            </Text>
            <Text style={GlobalStyles.loginText}>Login</Text>
            <Text style={[GlobalStyles.align_left, { width: contentWidth }]}>Email</Text>
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
            />
            <Text style={[GlobalStyles.align_left, { width: contentWidth }]}>Password</Text>
            <TextInput
              style={[
                GlobalStyles.inputText,
                { width: contentWidth },
                password.length > 0 && password.length < 8,
              ]}
              onChangeText={setPassword}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="#aaaaaa"
              autoCapitalize="none"
              secureTextEntry={true}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[GlobalStyles.GoodButton, { width: contentWidth }, isLoading && GlobalStyles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#eceefaff" />
              ) : (
                <Text style={GlobalStyles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            <View style={[styles.dividerContainer, { width: contentWidth }]}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
            
            <TouchableOpacity
              style={[styles.createAccountButton, { width: contentWidth }]}
              onPress={onNavigateToCreateAccount}
              disabled={isLoading}>
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  assistantImage: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  createAccountButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#020618ff',
    alignItems: 'center',
  },
  createAccountText: {
    color: "#eceefaff",
    fontWeight: "bold",
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#999',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#0f0f0fff',
    fontSize: 16,
  },
  greetingText: {
    fontSize: 18,
    color: 'black',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    paddingHorizontal: 5,
    minHeight: 66,
  },
  cursor: {
    color: 'black',
  },
});