import { StyleSheet } from 'react-native';

export const navbarStyles = StyleSheet.create({
  sideContainer: {
    backgroundColor: '#111a22',
    padding: 16,
    width: 240,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menu: {
    gap: 12,
  },
  menuItem: {
    color: '#fff',
    fontSize: 14,
    paddingVertical: 8,
  },
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: '#111a22',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footer: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
  },
});
