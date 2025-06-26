import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    maxWidth: 960,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 288,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
  },
  progressContainer: {
    paddingVertical: 24,
  },
  progressBox: {
    flex: 1,
    minWidth: 288,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    padding: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    color: '#92aec9',
    fontSize: 16,
  },
  success: {
    color: '#0bda5b',
    fontSize: 16,
    fontWeight: '500',
  },
  barChart: {
    minHeight: 180,
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: '#233648',
    borderTopWidth: 2,
    borderTopColor: '#92aec9',
  },
  barLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 13,
    color: '#92aec9',
    fontWeight: 'bold',
  },
});
