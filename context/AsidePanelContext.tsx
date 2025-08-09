import React, { createContext, useContext, useState } from 'react';

interface AsidePanelContextType {
  showAsidePanel: boolean;
  asidePanelContent: React.ReactNode | null;
  asidePanelTitle: string;
  openAsidePanel: (content: React.ReactNode, title?: string) => void;
  closeAsidePanel: () => void;
}

const AsidePanelContext = createContext<AsidePanelContextType | undefined>(undefined);

export const AsidePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAsidePanel, setShowAsidePanel] = useState(false);
  const [asidePanelContent, setAsidePanelContent] = useState<React.ReactNode | null>(null);
  const [asidePanelTitle, setAsidePanelTitle] = useState<string>('Información Detallada');

  const openAsidePanel = (content: React.ReactNode, title: string = 'Información Detallada') => {
    setAsidePanelContent(content);
    setAsidePanelTitle(title);
    setShowAsidePanel(true);
  };

  const closeAsidePanel = () => {
    setShowAsidePanel(false);
    setAsidePanelContent(null);
    setAsidePanelTitle('Información Detallada');
  };

  return (
    <AsidePanelContext.Provider value={{
      showAsidePanel,
      asidePanelContent,
      asidePanelTitle,
      openAsidePanel,
      closeAsidePanel,
    }}>
      {children}
    </AsidePanelContext.Provider>
  );
};

export const useAsidePanel = () => {
  const context = useContext(AsidePanelContext);
  if (context === undefined) {
    throw new Error('useAsidePanel must be used within an AsidePanelProvider');
  }
  return context;
}; 