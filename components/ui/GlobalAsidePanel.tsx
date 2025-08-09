import { useAsidePanel } from '@/context/AsidePanelContext';
import React from 'react';
import { Dimensions } from 'react-native';
import AsidePanel from './AsidePanel';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

const GlobalAsidePanel: React.FC = () => {
  const { showAsidePanel, asidePanelContent, asidePanelTitle, closeAsidePanel } = useAsidePanel();

  if (!showAsidePanel || !asidePanelContent) {
    return null;
  }

  return (
    <AsidePanel 
      open={showAsidePanel} 
      onClose={closeAsidePanel}
    >
      {asidePanelContent}
    </AsidePanel>
  );
};

export default GlobalAsidePanel; 