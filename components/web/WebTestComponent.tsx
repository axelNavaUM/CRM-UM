import { usePlatform } from '@/hooks/usePlatform';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WebTestComponent: React.FC = () => {
  const { isWeb, platform } = usePlatform();

  if (!isWeb) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.testBox}>
        <Text style={styles.testText}>
          🔍 WEB TEST
        </Text>
        <Text style={styles.platformText}>
          Platform: {platform}
        </Text>
        <Text style={styles.statusText}>
          ✅ Web Components Active
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 999999,
  },
  testBox: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  testText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default WebTestComponent; 