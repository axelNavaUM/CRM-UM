import { useSheetsContext } from '@/context/SheetsContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const SheetsRenderer: React.FC = () => {
  const { sheets } = useSheetsContext();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {sheets.map((sheet) => (
        <View
          key={sheet.id}
          style={[
            styles.sheetContainer,
            { zIndex: sheet.zIndex }
          ]}
          pointerEvents="box-none"
        >
          {sheet.component}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SheetsRenderer; 