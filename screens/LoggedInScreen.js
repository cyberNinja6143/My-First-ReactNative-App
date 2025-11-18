import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { retrieveUser, getStoredToken } from '../Routes'; // Update path
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'

export default function LoggedInScreen({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pictures');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        const result = await retrieveUser(token);
        if (result.success) {
          setUserInfo({
            username: result.username,
            email: result.email,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Header with user avatar */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Home</Text>
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

        {/* Main content area */}
        <View style={styles.content}>
          {/* Content will go here based on active tab */}
          <Text style={styles.placeholderText}>
            {activeTab === 'pictures' ? 'Pictures View' : `Tab ${activeTab}`}
          </Text>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'pictures' && styles.navButtonActive]}
            onPress={() => setActiveTab('pictures')}
          >
            <Ionicons 
              name="images-outline" 
              size={28} 
              color={activeTab === 'pictures' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'pictures' && styles.navTextActive]}>
              Pictures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'tab2' && styles.navButtonActive]}
            onPress={() => setActiveTab('tab2')}
          >
            <Ionicons 
              name="ellipse-outline" 
              size={28} 
              color={activeTab === 'tab2' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'tab2' && styles.navTextActive]}>
              Tab 2
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'tab3' && styles.navButtonActive]}
            onPress={() => setActiveTab('tab3')}
          >
            <Ionicons 
              name="ellipse-outline" 
              size={28} 
              color={activeTab === 'tab3' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'tab3' && styles.navTextActive]}>
              Tab 3
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 'tab4' && styles.navButtonActive]}
            onPress={() => setActiveTab('tab4')}
          >
            <Ionicons 
              name="ellipse-outline" 
              size={28} 
              color={activeTab === 'tab4' ? '#f4c542' : '#666'} 
            />
            <Text style={[styles.navText, activeTab === 'tab4' && styles.navTextActive]}>
              Tab 4
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f4c542',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020618ff',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#020618ff',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    // Optional: add background highlight for active button
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