import { Image, Pressable, StyleSheet, Text } from 'react-native';

export default function GoogleButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={require('../../assets/images/google.png')} style={styles.icon} />
      <Text style={styles.text}>Continúa con Google</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    width: 280,
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121417',
  },
});
