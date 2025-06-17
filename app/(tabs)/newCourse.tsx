import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import NewCourseForm from '../../components/forms/NewCourseForm';
// Navbar is now in _layout.tsx

export default function NewCourseScreen() {
  return (
    // SafeAreaView can still be useful here
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar removed, it's now rendered by the layout */}
      <View style={styles.container}>
        <NewCourseForm />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Match NewCourseForm's scrollContainer background
  },
  container: {
    flex: 1,
    // Padding is handled by NewCourseForm's scrollContainer and Navbar's own padding
  },
});
