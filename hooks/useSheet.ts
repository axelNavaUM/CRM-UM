import { useSheetsContext } from '@/context/SheetsContext';
import React from 'react';

export const useSheet = () => {
  const { addSheet, removeSheet, closeAllSheets } = useSheetsContext();

  const showSheet = (id: string, component: React.ReactNode) => {
    addSheet(id, component);
  };

  const hideSheet = (id: string) => {
    removeSheet(id);
  };

  const hideAllSheets = () => {
    closeAllSheets();
  };

  return {
    showSheet,
    hideSheet,
    hideAllSheets
  };
}; 