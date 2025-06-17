import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { HomeViewController } from '../../controller/homeViewController';
import { HomeViewData } from '../../models/homeViewModel';
// Navbar is now in _layout.tsx

export default function HomeScreen() {
  const [data, setData] = useState<HomeViewData>({});
  console.log('[HomeScreen] Component rendering or re-rendering');

  useEffect(() => {
    console.log('[HomeScreen] useEffect triggered - fetching data');
    const controller = new HomeViewController();
    controller.getScreenData().then(screenData => {
      console.log('[HomeScreen] Data fetched:', screenData);
      setData(screenData);
    }).catch(error => {
      console.error("[HomeScreen] Failed to load screen data:", error);
      // Set some default error message or handle error state
      setData({ welcomeMessage: "Error loading data" });
    });
  }, []);

  // Navbar is now rendered by the layout, so no need for screenContainer View here if not otherwise needed
  // The ScrollView will be the main container for this screen's content
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{data.welcomeMessage || 'Loading...'}</Text>
      <Text style={styles.subtitle}>School CRM Dashboard Content Area</Text>
      {/* Example of a button or action that could use the controller */}
      {/* <Button title="Perform Action" onPress={() => new HomeViewController().handleUserAction()} /> */}
      {/* Add more content here to test scrolling with Navbar */}
      <Text style={{ marginVertical: 200 }}>More content...</Text>
      <Text style={{ marginVertical: 200 }}>Even more content...</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // screenContainer might not be needed if Navbar is in layout and this screen is just ScrollView
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0', // Moved background color here
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
