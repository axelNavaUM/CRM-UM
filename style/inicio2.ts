import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Efecto de vidrio
    backdropFilter: 'blur(10px)', // Efecto de vidrio (puede no funcionar en todos los dispositivos)
    borderBottomWidth: 1,
    borderBottomColor: '#e7edf3',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d151b',
    marginLeft: 10,
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'flex-start',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d151b',
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#0d151b',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#e7edf3',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'medium',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#cfdce7',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e7edf3',
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#0d151b',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cfdce7',
  },
  tableCell: {
    flex: 1,
    color: '#0d151b',
  },
});
