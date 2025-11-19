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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { retrieveUser, getStoredToken } from '../Routes';
import { Ionicons } from '@expo/vector-icons';

import MyPhotosScreen from '../screens/PostLogin/MyPhotosScreen';
import ExploreScreen from '../screens/PostLogin/ExploreScreen';

const { width, height } = Dimensions.get('window');

export default function LoggedInScreen({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
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
            </TouchableOpacity>
          </TouchableOpacity>
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
  },
  logoutButtonText: {
    color: '#eceefaff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});