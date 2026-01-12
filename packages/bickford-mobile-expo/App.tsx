import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  // Failsafe: gracefully handle iPad launch instead of crashing
  // Note: Platform.OS check is necessary for TypeScript type narrowing
  if (Platform.OS === 'ios' && Platform.isPad) {
    return (
      <View style={styles.unsupportedContainer}>
        <Text style={styles.unsupportedText}>
          This app is designed for iPhone only.{'\n'}
          Please install on an iPhone device.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>bickford</Text>
        <Text style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
          Mobile shell (Expo)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  unsupportedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});
