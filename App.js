import { 
  StyleSheet, 
  Text, 
  View,
  Alert,
  TextInput,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import React, { useState, useEffect, useRef } from 'react';
 
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const shift = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Typing animation effect
  useEffect(() => {
    if (currentScreen === 'login') {
      const greeting = getGreeting();
      const fullText = `${greeting} master, welcome back to your app.`;
      const greetingLength = greeting.length + 7;
      let index = 0;
      
      setDisplayedText('');
      setShowCursor(true);
      
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          // Add pause after greeting
          if (index === greetingLength) {
            setTimeout(() => {
              setDisplayedText(fullText.slice(0, index + 1));
              index++;
            }, 500); // 500ms pause
          } else {
            setDisplayedText(fullText.slice(0, index + 1));
            index++;
          }
        } else {
          clearInterval(typingInterval);
          // Hide cursor after animation ends
          setTimeout(() => {
            setShowCursor(false);
          }, 500);
        }
      }, 50); // 50ms per character
      
      return () => clearInterval(typingInterval);
    }
  }, [currentScreen]);

  // Cursor blinking effect
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
  }, [showCursor, cursorOpacity]);

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
  }, [shift]);
  
  const renderLoginScreen = () => (
    <View>
      <Image 
        source={require('./assets/app-pictures/assistant.png')}
        style={styles.assistantImage}
        resizeMode="contain"
      />
      <Text style={styles.greetingText}>
        {displayedText}
        {showCursor && (
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
            |
          </Animated.Text>
        )}
      </Text>
      <Text style={styles.loginText}>Login</Text>
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
      />
      <TouchableOpacity
        style={styles.GoodButton}
        onPress={() => Alert.alert("Notice", "No login for you", [
          {text: "Okay"},
          {text: "Shit"}
        ])}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>
      
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => setCurrentScreen('createAccount')}>
        <Text style={styles.createAccountText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateAccountScreen = () => (
    <View>
      <Text style={styles.loginText}>Create Account</Text>
      <Text style={styles.align_left}>Username</Text>
      <TextInput
        style={styles.inputText}
        onChangeText={setUsername}
        value={username}
        placeholder="Enter your username"
        placeholderTextColor="#aaaaaa"
        autoCapitalize="none"
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
      />
      <TouchableOpacity
        style={styles.GoodButton}
        onPress={() => Alert.alert("Success", "Account created!", [
          {text: "Okay", onPress: () => setCurrentScreen('login')}
        ])}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('login')}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
  
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
          {currentScreen === 'login' ? renderLoginScreen() : renderCreateAccountScreen()}
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
  assistantImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
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
 buttonText: {
    color: "#eceefaff",
    fontWeight: "bold",
    fontSize: 18,
  },
  createAccountButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#020618ff',
    alignItems: 'center',
    width: 400,
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
  greetingText: {
    maxWidth: 400,
    fontSize: 18,
    color: 'black',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    paddingHorizontal: 5,
    height: 66,
  },
  cursor: {
    color: 'black',
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