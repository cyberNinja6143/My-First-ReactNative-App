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
import { getStoredToken, getAllPictures } from '../../Routes';
import { Ionicons } from '@expo/vector-icons';
import PictureModal from '../../sharedResources/sharedComponents/PictureModal';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3;

export default function ExploreScreen({ userInfo }) {
  const [allPictures, setAllPictures] = useState([]);
  const [loadingPictures, setLoadingPictures] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [loadingFullImage, setLoadingFullImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllPictures();
  }, []);

  const loadAllPictures = async () => {
    setLoadingPictures(true);
    try {
      const token = await getStoredToken();
      if (token) {
        const result = await getAllPictures(token);
        if (result.success) {
          const sorted = result.pictures.sort((a, b) => 
            new Date(b.uploadedAt) - new Date(a.uploadedAt)
          );
          setAllPictures(sorted);
        } else {
          Alert.alert('Error', result.message || 'Failed to load pictures');
        }
      } else {
        Alert.alert('Error', 'No authentication token found');
      }
    } catch (error) {
      console.error('Error loading all pictures:', error);
      Alert.alert('Error', 'Failed to load pictures');
    } finally {
      setLoadingPictures(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllPictures();
    setRefreshing(false);
  };

  const handleViewPicture = async (pictureId) => {
    setLoadingFullImage(true);
    setShowPictureModal(true);
    
    try {
      const picture = allPictures.find(p => p.pictureId === pictureId);
      if (picture) {
        setSelectedPicture({ ...picture, isExplore: true });
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

  if (loadingPictures && !refreshing) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#020618ff" />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (allPictures.length === 0 && !refreshing) {
    return (
      <View style={styles.centerContent}>
        <Ionicons name="images-outline" size={80} color="#020618ff" style={{ opacity: 0.3 }} />
        <Text style={styles.emptyText}>No one has shared anything yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share!</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={allPictures}
        renderItem={renderPictureItem}
        keyExtractor={(item) => item.pictureId}
        numColumns={3}
        contentContainerStyle={styles.picturesGrid}
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
        onDelete={null}
        isExplore={true}
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020618ff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#020618ff',
    marginTop: 10,
  },
});