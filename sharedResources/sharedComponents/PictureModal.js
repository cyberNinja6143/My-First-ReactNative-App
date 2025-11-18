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
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  Alert
} from 'react-native';
import { getStoredToken, getComments, addComment, removeComment } from '../../Routes';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PictureModal({ 
  visible, 
  picture, 
  userInfo, 
  loading, 
  onClose, 
  onDelete,
  isExplore 
}) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (visible && picture) {
      loadComments(picture.pictureId);
    } else {
      setComments([]);
      setCommentText('');
    }
  }, [visible, picture]);

  const loadComments = async (pictureId) => {
    setLoadingComments(true);
    try {
      const result = await getComments(pictureId);
      if (result.success) {
        setComments(result.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setPostingComment(true);
    try {
      const token = await getStoredToken();
      if (token && picture) {
        const result = await addComment(token, picture.pictureId, commentText.trim());
        if (result.success) {
          setCommentText('');
          await loadComments(picture.pictureId);
        } else {
          Alert.alert('Error', result.message || 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getStoredToken();
              if (token && picture) {
                const result = await removeComment(token, commentId);
                if (result.success) {
                  await loadComments(picture.pictureId);
                } else {
                  Alert.alert('Error', result.message || 'Failed to delete comment');
                }
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUserInfo}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>
              {item.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.commentTextContainer}>
            <View style={styles.commentTopRow}>
              <Text style={styles.commentUsername}>{item.username || 'Anonymous'}</Text>
              <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        </View>
        {userInfo && item.userUUID === userInfo.uuid && (
          <TouchableOpacity 
            style={styles.commentDeleteButton}
            onPress={() => handleDeleteComment(item.commentId)}
          >
            <Ionicons name="trash-outline" size={18} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.pictureModalOverlay}>
          <TouchableOpacity 
            style={styles.pictureModalBackground}
            activeOpacity={1}
            onPress={onClose}
          >
            <View style={styles.pictureModalContent}>
              {loading ? (
                <View style={styles.pictureLoadingContainer}>
                  <ActivityIndicator size="large" color="#f4c542" />
                  <Text style={styles.pictureLoadingText}>Loading image...</Text>
                </View>
              ) : picture ? (
                <>
                  {/* Picture Header */}
                  <View style={styles.pictureModalHeader}>
                    <View style={styles.pictureModalHeaderLeft}>
                      {isExplore ? (
                        <>
                          <Text style={styles.pictureModalFileName} numberOfLines={1}>
                            Posted by {picture.author}
                          </Text>
                          <Text style={styles.pictureModalFileInfo}>
                            {formatDate(picture.uploadedAt)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.pictureModalFileName} numberOfLines={1}>
                            {picture.fileName}
                          </Text>
                          <Text style={styles.pictureModalFileInfo}>
                            {picture.width} × {picture.height} • {(picture.fileSize / 1024).toFixed(0)} KB
                          </Text>
                        </>
                      )}
                    </View>
                    {!isExplore && onDelete && (
                      <TouchableOpacity 
                        style={styles.pictureModalDeleteButton}
                        onPress={() => onDelete(picture.pictureId)}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Picture Image */}
                  <ScrollView 
                    style={styles.pictureScrollContainer}
                    contentContainerStyle={styles.pictureScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={styles.pictureImageContainer}>
                      <Image
                        source={{ 
                          uri: `data:${picture.contentType};base64,${picture.imageData}`
                        }}
                        style={styles.fullPictureImage}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsSectionTitle}>Comments</Text>
                      
                      {loadingComments ? (
                        <View style={styles.commentsLoadingContainer}>
                          <ActivityIndicator size="small" color="#f4c542" />
                        </View>
                      ) : comments.length === 0 ? (
                        <View style={styles.noCommentsContainer}>
                          <Text style={styles.noCommentsText}>No comments yet</Text>
                          <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                        </View>
                      ) : (
                        <FlatList
                          data={comments}
                          renderItem={renderCommentItem}
                          keyExtractor={(item) => item.commentId}
                          scrollEnabled={false}
                        />
                      )}
                    </View>
                  </ScrollView>

                  {/* Comment Input */}
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      placeholderTextColor="#999"
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.commentSendButton,
                        (!commentText.trim() || postingComment) && styles.commentSendButtonDisabled
                      ]}
                      onPress={handleAddComment}
                      disabled={!commentText.trim() || postingComment}
                    >
                      {postingComment ? (
                        <ActivityIndicator size="small" color="#020618ff" />
                      ) : (
                        <Ionicons name="send" size={20} color="#020618ff" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.pictureModalCloseButton}
                    onPress={onClose}
                  >
                    <Ionicons name="close-circle" size={40} color="#eceefaff" />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pictureModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  pictureModalBackground: {
    flex: 1,
  },
  pictureModalContent: {
    flex: 1,
  },
  pictureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  pictureScrollContainer: {
    flex: 1,
  },
  pictureScrollContent: {
    flexGrow: 1,
  },
  pictureImageContainer: {
    width: width,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullPictureImage: {
    width: width,
    height: height * 0.4,
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
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  commentsSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#eceefaff',
    marginBottom: 15,
  },
  commentsLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noCommentsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  commentItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentUserInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f4c542',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: '#020618ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentTextContainer: {
    flex: 1,
  },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f4c542',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#eceefaff',
    lineHeight: 20,
  },
  commentDeleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#eceefaff',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4c542',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendButtonDisabled: {
    opacity: 0.5,
  },
});