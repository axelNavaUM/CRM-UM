import { useAuth } from '@/context/AuthContext';
import { useRoleBasedContentStore } from '@/store/permisos/roleBasedContentStore';
import { useEffect } from 'react';

export const useRoleBasedContent = () => {
  const { user } = useAuth();
  const { 
    content, 
    metrics, 
    isLoading, 
    error, 
    loadContentByRole, 
    loadMetrics, 
    resetState 
  } = useRoleBasedContentStore();

  useEffect(() => {
    console.log('[DEBUG] useRoleBasedContent useEffect - user email:', user?.email);
    if (user?.email) {
      // Solo cargar si no se ha cargado antes o si el email cambió
      loadContentByRole(user.email);
    } else {
      console.log('[DEBUG] No hay usuario, reseteando estado');
      resetState();
    }
  }, [user?.email, loadContentByRole, resetState]);

  return {
    content,
    metrics,
    isLoading,
    error,
    loadMetrics
  };
}; 