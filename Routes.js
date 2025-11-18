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
 * This is not a route to the backend, it pulls from local storage.
 * This will be moved to a different class later to comply with SOLID design principles.
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

/**
 * Retrieve user route - Gets current user's username and UUID
 * @param {string} token - Current JWT token
 * @returns {Object} { success: boolean, username?: string, uuid?: string, email?: string, message?: string }
 */
export const retrieveUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/retrieveuser`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        username: data.username,
        uuid: data.uuid,
        email: data.email,
      };
    } else if (response.status === 409) {
      return {
        success: false,
        errorCode: '588',
        message: 'User not found',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'Failed to retrieve user information',
      };
    }
  } catch (error) {
    console.error('Retrieve user error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Upload picture route - Uploads an image with optional description
 * @param {string} token - Current JWT token
 * @param {Object} imageFile - Image file object with uri, name, and type
 * @param {string} description - Optional description for the image
 * @returns {Object} { success: boolean, pictureId?: string, fileName?: string, errorCode?: string, message?: string }
 */
export const uploadPicture = async (token, imageFile, description = null) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageFile.uri,
      name: imageFile.name || 'photo.jpg',
      type: imageFile.type || 'image/jpeg',
    });
    
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${API_URL}/uploadpicture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const responseText = await response.text();

    if (response.status === 200) {
      const data = JSON.parse(responseText);
      return {
        success: true,
        pictureId: data.pictureId,
        fileName: data.fileName,
        message: data.message,
      };
    } else if (responseText === '588') {
      return {
        success: false,
        errorCode: '588',
        message: 'User not found',
      };
    } else if (responseText === '900') {
      return {
        success: false,
        errorCode: '900',
        message: 'No image file provided',
      };
    } else if (responseText === '901') {
      return {
        success: false,
        errorCode: '901',
        message: 'Image file is too large (max 10MB)',
      };
    } else if (responseText === '902') {
      return {
        success: false,
        errorCode: '902',
        message: 'Invalid image file type. Please upload JPEG, PNG, GIF, or WebP',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'Failed to upload picture',
      };
    }
  } catch (error) {
    console.error('Upload picture error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Get pictures route - Retrieves all pictures for the authenticated user
 * @param {string} token - Current JWT token
 * @returns {Object} { success: boolean, pictures?: Array, errorCode?: string, message?: string }
 */
export const getPictures = async (token) => {
  try {
    const response = await fetch(`${API_URL}/getpictures`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        pictures: data,
      };
    } else if (response.status === 409) {
      return {
        success: false,
        errorCode: '588',
        message: 'User not found',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'Failed to retrieve pictures',
      };
    }
  } catch (error) {
    console.error('Get pictures error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Get picture route - Retrieves a specific picture by ID
 * @param {string} token - Current JWT token
 * @param {string} pictureId - Picture ID (GUID)
 * @returns {Object} { success: boolean, picture?: Object, errorCode?: string, message?: string }
 */
export const getPicture = async (token, pictureId) => {
  try {
    const response = await fetch(`${API_URL}/getpicture/${pictureId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        picture: data,
      };
    } else if (response.status === 409) {
      return {
        success: false,
        errorCode: '588',
        message: 'User not found',
      };
    } else if (response.status === 404) {
      return {
        success: false,
        errorCode: '903',
        message: 'Picture not found',
      };
    } else if (response.status === 403) {
      return {
        success: false,
        errorCode: '403',
        message: 'You do not have permission to view this picture',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'Failed to retrieve picture',
      };
    }
  } catch (error) {
    console.error('Get picture error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Delete picture route - Deletes a specific picture by ID
 * @param {string} token - Current JWT token
 * @param {string} pictureId - Picture ID (GUID)
 * @returns {Object} { success: boolean, pictureId?: string, errorCode?: string, message?: string }
 */
export const deletePicture = async (token, pictureId) => {
  try {
    const response = await fetch(`${API_URL}/deletepicture/${pictureId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        pictureId: data.pictureId,
        message: data.message,
      };
    } else if (response.status === 409) {
      return {
        success: false,
        errorCode: '588',
        message: 'User not found',
      };
    } else if (response.status === 404) {
      return {
        success: false,
        errorCode: '903',
        message: 'Picture not found',
      };
    } else if (response.status === 403) {
      return {
        success: false,
        errorCode: '403',
        message: 'You do not have permission to delete this picture',
      };
    } else {
      return {
        success: false,
        errorCode: 'unknown',
        message: 'Failed to delete picture',
      };
    }
  } catch (error) {
    console.error('Delete picture error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Add comment route - Adds a comment to a picture
 * @param {string} token - Current JWT token
 * @param {string} pictureId - Picture ID (GUID)
 * @param {string} commentText - Comment text content
 * @returns {Object} { success: boolean, comment?: Object, errorCode?: string, message?: string }
 */
export const addComment = async (token, pictureId, commentText) => {
  try {
    const response = await fetch(`${API_URL}/addcomment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PictureId: pictureId,
        CommentText: commentText,
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        comment: {
          commentId: data.commentId,
          pictureId: data.pictureId,
          userUUID: data.userUUID,
          comment: data.comment,
          createdAt: data.createdAt,
        },
        message: data.message,
      };
    } else if (response.status === 409) {
      const responseText = await response.text();
      if (responseText === '588') {
        return {
          success: false,
          errorCode: '588',
          message: 'User not found',
        };
      }
    } else if (response.status === 404) {
      const responseText = await response.text();
      if (responseText === '903') {
        return {
          success: false,
          errorCode: '903',
          message: 'Picture not found',
        };
      }
    } else if (response.status === 400) {
      const responseText = await response.text();
      if (responseText === '904') {
        return {
          success: false,
          errorCode: '904',
          message: 'Comment text cannot be empty',
        };
      }
    }
    
    return {
      success: false,
      errorCode: 'unknown',
      message: 'Failed to add comment',
    };
  } catch (error) {
    console.error('Add comment error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Remove comment route - Removes a comment by ID
 * @param {string} token - Current JWT token
 * @param {string} commentId - Comment ID (GUID)
 * @returns {Object} { success: boolean, commentId?: string, errorCode?: string, message?: string }
 */
export const removeComment = async (token, commentId) => {
  try {
    const response = await fetch(`${API_URL}/removecomment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        commentId: data.commentId,
        message: data.message,
      };
    } else if (response.status === 409) {
      const responseText = await response.text();
      if (responseText === '588') {
        return {
          success: false,
          errorCode: '588',
          message: 'User not found',
        };
      }
    } else if (response.status === 404) {
      const responseText = await response.text();
      if (responseText === '905') {
        return {
          success: false,
          errorCode: '905',
          message: 'Comment not found',
        };
      }
    } else if (response.status === 403) {
      return {
        success: false,
        errorCode: '403',
        message: 'You do not have permission to delete this comment',
      };
    }
    
    return {
      success: false,
      errorCode: 'unknown',
      message: 'Failed to remove comment',
    };
  } catch (error) {
    console.error('Remove comment error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Get comments route - Retrieves all comments for a specific picture
 * @param {string} pictureId - Picture ID (GUID)
 * @returns {Object} { success: boolean, comments?: Array, errorCode?: string, message?: string }
 */
export const getComments = async (pictureId) => {
  try {
    const response = await fetch(`${API_URL}/getcomments/${pictureId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        comments: data,
      };
    } else if (response.status === 404) {
      const responseText = await response.text();
      if (responseText === '903') {
        return {
          success: false,
          errorCode: '903',
          message: 'Picture not found',
        };
      }
    }
    
    return {
      success: false,
      errorCode: 'unknown',
      message: 'Failed to retrieve comments',
    };
  } catch (error) {
    console.error('Get comments error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};

/**
 * Update comment route - Updates a comment's text
 * @param {string} token - Current JWT token
 * @param {string} commentId - Comment ID (GUID)
 * @param {string} commentText - New comment text content
 * @returns {Object} { success: boolean, comment?: Object, errorCode?: string, message?: string }
 */
export const updateComment = async (token, commentId, commentText) => {
  try {
    const response = await fetch(`${API_URL}/updatecomment/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CommentText: commentText,
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      
      return {
        success: true,
        comment: {
          commentId: data.commentId,
          comment: data.comment,
        },
        message: data.message,
      };
    } else if (response.status === 409) {
      const responseText = await response.text();
      if (responseText === '588') {
        return {
          success: false,
          errorCode: '588',
          message: 'User not found',
        };
      }
    } else if (response.status === 404) {
      const responseText = await response.text();
      if (responseText === '905') {
        return {
          success: false,
          errorCode: '905',
          message: 'Comment not found',
        };
      }
    } else if (response.status === 400) {
      const responseText = await response.text();
      if (responseText === '904') {
        return {
          success: false,
          errorCode: '904',
          message: 'Comment text cannot be empty',
        };
      }
    } else if (response.status === 403) {
      return {
        success: false,
        errorCode: '403',
        message: 'You do not have permission to update this comment',
      };
    }
    
    return {
      success: false,
      errorCode: 'unknown',
      message: 'Failed to update comment',
    };
  } catch (error) {
    console.error('Update comment error:', error);
    return {
      success: false,
      errorCode: 'network',
      message: 'Unable to connect to the server.',
    };
  }
};