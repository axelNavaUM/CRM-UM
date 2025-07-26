import { useEffect } from 'react';
import { useUsuarioStore, Usuariosum } from '@/store/usuario/usuario';
import { UsuariosController } from '@/controller/usuarios/usuarios.controller';

export const useManagementUsuarios = (idusuario: number) => {
  const { setUsuario, setIsLoading, setError } = useUsuarioStore();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setIsLoading(true);
        const data = await UsuariosController.getById(idusuario);
        setUsuario(data);
      } catch (error: any) {
        setError(`Error al obtener usuario: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (idusuario) fetchUsuario();
  }, [idusuario]);
};
