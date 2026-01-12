import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
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
