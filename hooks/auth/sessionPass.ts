import { useSessionStore } from '@/store/session/sessionStore';

export const useSessionCheck = () => {
    const session = useSessionStore((state) => state.session);

    const checkSession = () =>{
        return !!session; //Retorna verdadero si hay una session activa
    };

    return {
        session, 
        checkSession
    };
}