import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FormField from '../ui/FormField'; // Import FormField
import PrimaryButton from '../ui/PrimaryButton'; // Import PrimaryButton

export default function NewCourseForm() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [credits, setCredits] = useState('');

  const handleSaveCourse = () => {
    console.log('Saving Course:', {
      courseName,
      description,
      duration,
      credits,
    });
    // TODO: Actual save logic, e.g., calling a controller method
    alert('Course data logged to console. See console for details.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>New Course</Text>
        </View>

        <View style={styles.fieldsWrapper}>
          <FormField
            label="Course Name"
            placeholder="Enter course name"
            value={courseName}
            onChangeText={setCourseName}
          />
          <FormField
            label="Description"
            placeholder="Enter course description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4} // Suggests a taller field for description
          />
          <FormField
            label="Duration (in semesters)"
            placeholder="e.g., 4"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          <FormField
            label="Credits"
            placeholder="e.g., 120"
            value={credits}
            onChangeText={setCredits}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton label="Save Course" onPress={handleSaveCourse} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    // Based on HTML: px-40 (very large for mobile, maybe adjust to 16 or 20)
    // py-5 (20px)
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f0f8ff', // Light background for the page
  },
  formContainer: {
    width: '100%',
    maxWidth: 512,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 0, // Padding will be handled by inner elements like titleContainer and fieldsWrapper
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    paddingHorizontal: 16, // p-4 for horizontal
    paddingVertical: 16, // p-4 for vertical (HTML has just p-4)
    alignItems: 'flex-start', // Align title to the left as per HTML structure
    // borderBottomWidth: 1, // Optional: if a separator is needed below title
    // borderBottomColor: '#e7edf4',
  },
  title: {
    color: '#0d141c',
    fontSize: 28,
    fontWeight: 'bold',
  },
  fieldsWrapper: {
    // Based on HTML: items-end gap-4 px-4 py-3 for each field's wrapper
    // This will be the container for all FormFields
    paddingHorizontal: 16, // px-4
    paddingVertical: 4, // py-3 means 12px top/bottom. Individual fields have their own margin.
                        // Let's use this for overall padding around fields.
    gap: 12, // gap-4, if applied to the container of labels. FormField handles its own marginBottom.
             // This 'gap' can also be achieved by FormField's marginBottom.
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    borderTopWidth: 1, // Optional: separator above button area
    borderTopColor: '#e7edf4',
  }
});
