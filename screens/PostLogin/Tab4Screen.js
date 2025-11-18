import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Tab4Screen({ userInfo }) {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Tab 4 Content</Text>
      <Text style={styles.subText}>This is a placeholder for Tab 4</Text>
      {userInfo && (
        <Text style={styles.userText}>Welcome, {userInfo.username}!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020618ff',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  userText: {
    fontSize: 14,
    color: '#020618ff',
    textAlign: 'center',
  },
});