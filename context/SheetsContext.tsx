import React, { createContext, useContext, useState } from 'react';

export interface Sheet {
  id: string;
  component: React.ReactNode;
  zIndex: number;
}

interface SheetsContextType {
  sheets: Sheet[];
  addSheet: (id: string, component: React.ReactNode) => void;
  removeSheet: (id: string) => void;
  closeAllSheets: () => void;
  getTopSheet: () => Sheet | null;
}

const SheetsContext = createContext<SheetsContextType | undefined>(undefined);

export const useSheetsContext = () => {
  const context = useContext(SheetsContext);
  if (!context) {
    throw new Error('useSheetsContext must be used within a SheetsProvider');
  }
  return context;
};

interface SheetsProviderProps {
  children: React.ReactNode;
}

export const SheetsProvider: React.FC<SheetsProviderProps> = ({ children }) => {
  const [sheets, setSheets] = useState<Sheet[]>([]);

  const addSheet = (id: string, component: React.ReactNode) => {
    setSheets(prev => {
      // Si ya existe un sheet con el mismo ID, lo reemplazamos
      const existingIndex = prev.findIndex(sheet => sheet.id === id);
      if (existingIndex !== -1) {
        const newSheets = [...prev];
        newSheets[existingIndex] = {
          id,
          component,
          zIndex: prev.length + 1000 // z-index incremental
        };
        return newSheets;
      }
      
      // Agregar nuevo sheet al final
      return [...prev, {
        id,
        component,
        zIndex: prev.length + 1000
      }];
    });
  };

  const removeSheet = (id: string) => {
    setSheets(prev => prev.filter(sheet => sheet.id !== id));
  };

  const closeAllSheets = () => {
    setSheets([]);
  };

  const getTopSheet = () => {
    return sheets.length > 0 ? sheets[sheets.length - 1] : null;
  };

  const value: SheetsContextType = {
    sheets,
    addSheet,
    removeSheet,
    closeAllSheets,
    getTopSheet
  };

  return (
    <SheetsContext.Provider value={value}>
      {children}
    </SheetsContext.Provider>
  );
}; 