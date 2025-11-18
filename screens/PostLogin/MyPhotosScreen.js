import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform, 
  Image,
  FlatList,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { 
  getStoredToken, 
  getPictures, 
  uploadPicture, 
  deletePicture, 
  getPicture
} from '../../Routes';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import PictureModal from '../../sharedResources/sharedComponents/PictureModal';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3;

export default function MyPhotosScreen({ userInfo }) {
  const [pictures, setPictures] = useState([]);
  const [loadingPictures, setLoadingPictures] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [loadingFullImage, setLoadingFullImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPictures();
  }, []);

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
    <>
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
          { flexGrow: 1 }
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

      <PictureModal
        visible={showPictureModal}
        picture={selectedPicture}
        userInfo={userInfo}
        loading={loadingFullImage}
        onClose={closePictureModal}
        onDelete={handleDeletePhoto}
        isExplore={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});