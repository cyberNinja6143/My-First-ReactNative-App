import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoggedInScreen({ onLogout }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.successText}>You made it past the login!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4c542',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#020618ff',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#020618ff',
    alignItems: 'center',
  },
  buttonText: {
    color: "#eceefaff",
    fontWeight: "bold",
    fontSize: 18,
  },
});