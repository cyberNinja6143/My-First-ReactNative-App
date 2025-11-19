import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Platform,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { retrieveUser, getStoredToken, deleteUser } from '../Routes';
import { Ionicons } from '@expo/vector-icons';

import MyPhotosScreen from '../screens/PostLogin/MyPhotosScreen';
import ExploreScreen from '../screens/PostLogin/ExploreScreen';

const { width, height } = Dimensions.get('window');

export default function LoggedInScreen({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('pictures');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserInfo();
  }, []);

  // Animate when tab changes
  useEffect(() => {
    animateTabChange();
  }, [activeTab]);

  const animateTabChange = () => {
    // Fade out and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in and slide back
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const loadUserInfo = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        const result = await retrieveUser(token);
        if (result.success) {
          setUserInfo({
            username: result.username,
            email: result.email,
            uuid: result.uuid,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    return userInfo?.username?.charAt(0).toUpperCase() || '?';
  };

  const handleLogout = () => {
    setShowUserModal(false);
    onLogout();
  };

  const handleDeleteAccountPress = () => {
    setShowUserModal(false);
    setTimeout(() => {
      setShowDeleteConfirm(true);
    }, 300);
  };

  const handleDeleteAccount = async () => {
    if (!userInfo?.uuid) {
      Alert.alert('Error', 'Unable to delete account. User information not found.');
      return;
    }

    setDeletingAccount(true);

    try {
      const token = await getStoredToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        setDeletingAccount(false);
        setShowDeleteConfirm(false);
        return;
      }

      const result = await deleteUser(token, userInfo.uuid);

      if (result.success) {
        setShowDeleteConfirm(false);
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted.',
          [
            {
              text: 'OK',
              onPress: () => onLogout(),
            },
          ],
          { cancelable: false }
        );
      } else {
        setDeletingAccount(false);
        Alert.alert(
          'Deletion Failed',
          result.message || 'Unable to delete your account. Please try again later.'
        );
      }
    } catch (error) {
      setDeletingAccount(false);
      console.error('Delete account error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while deleting your account.'
      );
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'pictures':
        return 'My Photos';
      case 'explore':
        return 'Explore';
      default:
        return 'Home';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pictures':
        return <MyPhotosScreen userInfo={userInfo} />;
      case 'explore':
        return <ExploreScreen userInfo={userInfo} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? [] : ['top']}>
      <View style={{ flex: 1 }}>
        {/* Static Diagonal Lines Background */}
        <View style={styles.linesContainer}>
          <View style={styles.diagonalLine} />
          <View style={[styles.diagonalLine, styles.diagonalLine2]} />
          <View style={[styles.diagonalLine, styles.diagonalLine3]} />
        </View>

        {/* Header with user avatar */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => setShowUserModal(true)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#020618ff" />
            ) : (
              <Text style={styles.avatarText}>{getInitial()}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Main content area with animation */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderContent()}
        </Animated.View>

        {/* Bottom Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'pictures' && styles.navButtonActive]}
            onPress={() => setActiveTab('pictures')}
          >
            <Ionicons 
              name="images-outline" 
              size={36} 
              color={activeTab === 'pictures' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'pictures' && styles.navTextActive]}>
              My Photos
            </Text>
          </TouchableOpacity>

          <View style={styles.navDivider} />

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'explore' && styles.navButtonActive]}
            onPress={() => setActiveTab('explore')}
          >
            <Ionicons 
              name="people-outline" 
              size={36} 
              color={activeTab === 'explore' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'explore' && styles.navTextActive]}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showUserModal}
          onRequestClose={() => setShowUserModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowUserModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalContent}
              onPress={() => {}}
            >
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{getInitial()}</Text>
              </View>
              
              {userInfo && (
                <>
                  <Text style={styles.modalUsername}>{userInfo.username}</Text>
                  <Text style={styles.modalEmail}>{userInfo.email}</Text>
                </>
              )}

              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccountPress}
              >
                <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Delete Account Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteConfirm}
          onRequestClose={() => !deletingAccount && setShowDeleteConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModalContent}>
              <Ionicons name="warning-outline" size={60} color="#ff3b30" />
              
              <Text style={styles.confirmTitle}>Delete Account?</Text>
              <Text style={styles.confirmMessage}>
                This action cannot be undone. All your photos, comments, and data will be permanently deleted.
              </Text>

              <View style={styles.confirmButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={deletingAccount}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.confirmButton, styles.deleteButton]}
                  onPress={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4c542',
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  linesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  diagonalLine: {
    position: 'absolute',
    width: Math.sqrt(width * width + height * height) * 1.5,
    height: 4,
    backgroundColor: '#DAA520',
    top: '50%',
    left: '50%',
    marginLeft: -Math.sqrt(width * width + height * height) * 0.75,
    marginTop: -2,
    transform: [{ rotate: '45deg' }],
  },
  diagonalLine2: {
    marginTop: -30,
  },
  diagonalLine3: {
    marginTop: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020618ff',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#020618ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#f4c542',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 0,
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#020618ff',
    paddingVertical: 12,
    marginHorizontal: 40,
    marginBottom: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {},
  navDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#f4c542',
    opacity: 0.3,
    alignSelf: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#f4c542',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#eceefaff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 350,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#020618ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarText: {
    color: '#f4c542',
    fontSize: 36,
    fontWeight: 'bold',
  },
  modalUsername: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020618ff',
    marginBottom: 8,
  },
  modalEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  logoutButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#020618ff',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#eceefaff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  deleteAccountButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#020618ff',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteAccountButtonText: {
    color: '#eceefaff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  confirmModalContent: {
    backgroundColor: '#eceefaff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020618ff',
    marginTop: 15,
    marginBottom: 15,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#020618ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});