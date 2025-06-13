import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121417',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#121417',
    marginBottom: 24,
  },
  forgot: {
    color: '#61758a',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  or: {
    color: '#61758a',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  ghostButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  ghostText: {
    color: '#121417',
    fontWeight: '700',
    fontSize: 14,
  },
});
