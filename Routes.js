import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login route - Authenticates user and returns JWT token
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} { success: boolean, token?: string, errorCode?: string, message?: string }
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    const responseText = await response.text();

    if (response.status === 200) {
      const data = JSON.parse(responseText);
      const token = data.accessToken;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('jwt_token', token);
      
      return {
        success: true,
        token: token,
      };
    } else if (responseText === '588') {
      return {
        success: false,
        errorCode: '588',
        message: 'Incorrect email or password',
      };
    } else if (responseText === '566') {
      return {
        success: false,
        errorCode: '566',
        message: 'Please confirm your email before logging in',
      };
    } else if (responseText === '800') {
      return {
        success: false,
        errorCode: '800',
        message: 'Incorrect email or password',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'An unexpected error has occurred, please try again later',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }
};

/**
 * Register route - Creates a new user account
 * @param {string} username - User's desired username
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} { success: boolean, errorCode?: string, message?: string }
 */
export const registerUser = async (username, email, password) => {
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
      return {
        success: true,
        message: 'Please verify your email before logging in.',
      };
    } else if (response.status === 885 || responseText === '885') {
      return {
        success: false,
        errorCode: '885',
        message: 'This email is already registered or a verification email has already been sent to this address. Please wait 10 minutes before trying again.',
      };
    } else if (response.status === 500 || responseText === '500') {
      return {
        success: false,
        errorCode: '500',
        message: 'The server is temporarily down and will be back up as soon as possible. Please try again later.',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }
};

/**
 * Refresh token route - Validates and refreshes JWT token
 * @param {string} token - Current JWT token
 * @returns {Object} { success: boolean, token?: string, message?: string }
 */
export const refreshToken = async (token) => {
  try {
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
        // Store new token in AsyncStorage
        await AsyncStorage.setItem('jwt_token', newToken);
        
        return {
          success: true,
          token: newToken,
        };
      } else {
        // Invalid token received, remove stored token
        await AsyncStorage.removeItem('jwt_token');
        return {
          success: false,
          message: 'Invalid token received from server',
        };
      }
    } else {
      // Token refresh failed, remove stored token
      await AsyncStorage.removeItem('jwt_token');
      return {
        success: false,
        message: 'Token refresh failed',
      };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    // Remove stored token on error
    await AsyncStorage.removeItem('jwt_token');
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to verify authentication. Please login again.',
    };
  }
};

/**
 * Logout route - Clears JWT token from storage
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if removal fails, we can continue
  }
};

/**
 * Get stored JWT token
 * @returns {Promise<string|null>} The stored JWT token or null if not found
 */
export const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};