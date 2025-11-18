import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Platform, 
  Image,
  FlatList,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { retrieveUser, getStoredToken, getPictures, uploadPicture, deletePicture, getPicture } from '../Routes';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3; // 3 tiles per row with padding

export default function LoggedInScreen({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pictures');
  const [pictures, setPictures] = useState([]);
  const [loadingPictures, setLoadingPictures] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [loadingFullImage, setLoadingFullImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (activeTab === 'pictures') {
      loadPictures();
    }
  }, [activeTab]);

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

  const loadPictures = async () => {
    setLoadingPictures(true);
    try {
      const token = await getStoredToken();
      if (token) {
        const result = await getPictures(token);
        if (result.success) {
          setPictures(result.pictures);
        } else {
          Alert.alert('Error', result.message || 'Failed to load pictures');
        }
      }
    } catch (error) {
      console.error('Error loading pictures:', error);
      Alert.alert('Error', 'Failed to load pictures');
    } finally {
      setLoadingPictures(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPictures();
    setRefreshing(false);
  };

  const handleViewPicture = async (pictureId) => {
    setLoadingFullImage(true);
    setShowPictureModal(true);
    
    try {
      const token = await getStoredToken();
      if (token) {
        const result = await getPicture(token, pictureId);
        if (result.success) {
          setSelectedPicture(result.picture);
        } else {
          Alert.alert('Error', result.message || 'Failed to load picture');
          setShowPictureModal(false);
        }
      }
    } catch (error) {
      console.error('Error loading full picture:', error);
      Alert.alert('Error', 'Failed to load picture');
      setShowPictureModal(false);
    } finally {
      setLoadingFullImage(false);
    }
  };

  const closePictureModal = () => {
    setShowPictureModal(false);
    setSelectedPicture(null);
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos.'
        );
        return false;
      }
    }
    return true;
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        const imageFile = {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `photo_${Date.now()}.jpg`,
          type: selectedImage.type === 'image' ? 'image/jpeg' : selectedImage.mimeType || 'image/jpeg',
        };

        setUploadingPicture(true);

        const token = await getStoredToken();
        if (token) {
          const uploadResult = await uploadPicture(token, imageFile, null);
          
          if (uploadResult.success) {
            Alert.alert('Success', 'Photo uploaded successfully!');
            loadPictures();
          } else {
            Alert.alert('Upload Failed', uploadResult.message || 'Failed to upload photo');
          }
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'An error occurred while uploading the photo');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePhoto = (pictureId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getStoredToken();
              if (token) {
                const result = await deletePicture(token, pictureId);
                if (result.success) {
                  Alert.alert('Success', 'Photo deleted successfully');
                  closePictureModal();
                  loadPictures();
                } else {
                  Alert.alert('Error', result.message || 'Failed to delete photo');
                }
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'An error occurred while deleting the photo');
            }
          },
        },
      ]
    );
  };

  const getInitial = () => {
    return userInfo?.username?.charAt(0).toUpperCase() || '?';
  };

  const handleLogout = () => {
    setShowUserModal(false);
    onLogout();
  };

  const renderPictureItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.pictureItem}
      onPress={() => handleViewPicture(item.pictureId)}
    >
      <Image
        source={{ uri: `data:${item.contentType};base64,${item.thumbnail}` }}
        style={styles.pictureImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderPlusButton = () => (
    <TouchableOpacity 
      style={styles.plusButtonContainer}
      onPress={handleUploadPhoto}
      disabled={uploadingPicture}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="light" style={styles.plusButtonBlur}>
        <View style={styles.plusButtonContent}>
          {uploadingPicture ? (
            <ActivityIndicator size="large" color="#020618ff" />
          ) : (
            <>
              <Ionicons name="add" size={40} color="#020618ff" />
              <Text style={styles.plusButtonText}>Add Photo</Text>
            </>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderPicturesTab = () => {
  if (loadingPictures && !refreshing) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#020618ff" />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (pictures.length === 0 && !refreshing) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.emptyText}>You have not uploaded any photos yet</Text>
        <TouchableOpacity 
          style={styles.emptyPlusButton}
          onPress={handleUploadPhoto}
          disabled={uploadingPicture}
        >
          {uploadingPicture ? (
            <ActivityIndicator size="large" color="#f4c542" />
          ) : (
            <Ionicons name="add-circle" size={80} color="#020618ff" />
          )}
        </TouchableOpacity>
        <Text style={styles.emptySubtext}>Tap the + to upload your first photo</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[...pictures, { isPlusButton: true }]}
      renderItem={({ item }) => 
        item.isPlusButton ? renderPlusButton() : renderPictureItem({ item })
      }
      keyExtractor={(item, index) => 
        item.isPlusButton ? 'plus-button' : item.pictureId
      }
      numColumns={3}
      contentContainerStyle={[
        styles.picturesGrid,
        { flexGrow: 1 } // This ensures content can grow and be pulled
      ]}
      columnWrapperStyle={styles.picturesRow}
      bounces={true}
      alwaysBounceVertical={true}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#020618ff"
          colors={['#020618ff']}
          progressViewOffset={Platform.OS === 'ios' ? 0 : 0}
        />
      }
    />
  );
};

  const renderContent = () => {
    switch (activeTab) {
      case 'pictures':
        return renderPicturesTab();
      case 'tab2':
      case 'tab3':
      case 'tab4':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.placeholderText}>Tab {activeTab}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? [] : ['top']}>
      <View style={{ flex: 1 }}>
        {/* Header with user avatar */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>
            {activeTab === 'pictures' ? 'My Photos' : 'Home'}
          </Text>
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
          {renderContent()}
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

        {/* Full Picture Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPictureModal}
          onRequestClose={closePictureModal}
        >
          <View style={styles.pictureModalOverlay}>
            <TouchableOpacity 
              style={styles.pictureModalBackground}
              activeOpacity={1}
              onPress={closePictureModal}
            >
              <View style={styles.pictureModalContent}>
                {loadingFullImage ? (
                  <View style={styles.pictureLoadingContainer}>
                    <ActivityIndicator size="large" color="#f4c542" />
                    <Text style={styles.pictureLoadingText}>Loading image...</Text>
                  </View>
                ) : selectedPicture ? (
                  <>
                    <View style={styles.pictureModalHeader}>
                      <View style={styles.pictureModalHeaderLeft}>
                        <Text style={styles.pictureModalFileName} numberOfLines={1}>
                          {selectedPicture.fileName}
                        </Text>
                        <Text style={styles.pictureModalFileInfo}>
                          {selectedPicture.width} × {selectedPicture.height} • {(selectedPicture.fileSize / 1024).toFixed(0)} KB
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.pictureModalDeleteButton}
                        onPress={() => handleDeletePhoto(selectedPicture.pictureId)}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.pictureImageContainer}>
                      <Image
                        source={{ uri: `data:${selectedPicture.contentType};base64,${selectedPicture.imageData}` }}
                        style={styles.fullPictureImage}
                        resizeMode="contain"
                      />
                    </View>

                    <TouchableOpacity 
                      style={styles.pictureModalCloseButton}
                      onPress={closePictureModal}
                    >
                      <Ionicons name="close-circle" size={40} color="#eceefaff" />
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </TouchableOpacity>
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
    padding: 0,
  },
  centerContent: {
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
  picturesGrid: {
    padding: 10,
  },
  picturesRow: {
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  pictureItem: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eceefaff',
  },
  pictureImage: {
    width: '100%',
    height: '100%',
  },
  plusButtonContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  plusButtonBlur: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(2, 6, 24, 0.2)',
    overflow: 'hidden',
  },
  plusButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  plusButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#020618ff',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020618ff',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyPlusButton: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#020618ff',
    marginTop: 10,
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
  navButtonActive: {},
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
  // Full Picture Modal Styles
  pictureModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  pictureModalBackground: {
    flex: 1,
  },
  pictureModalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  pictureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
  },
  pictureModalHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  pictureModalFileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eceefaff',
    marginBottom: 4,
  },
  pictureModalFileInfo: {
    fontSize: 12,
    color: '#999',
  },
  pictureModalDeleteButton: {
    padding: 10,
  },
  pictureImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPictureImage: {
    width: width,
    height: height * 0.7,
  },
  pictureLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictureLoadingText: {
    fontSize: 16,
    color: '#eceefaff',
    marginTop: 15,
  },
  pictureModalCloseButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    alignSelf: 'center',
  },
});