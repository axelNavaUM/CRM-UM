import { Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton ({label, onPress}:any){
    return(
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    button: {
      backgroundColor: '#0d80f2',
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      width: 280,
      marginTop: 12,
    },
    label: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
  });