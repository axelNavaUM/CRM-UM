import { userModel } from '@/models/userModel';
import { useSessionStore } from '@/store/session/sessionStore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession(); // <- ¡NECESARIO!

export function useGoogleLoginHandler() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '1076932641700-ut46bi6r6g5upunvg6in7j4cmp0tlhvl.apps.googleusercontent.com',
    androidClientId: '  .apps.googleusercontent.com',
    webClientId: '1076932641700-ut46bi6r6g5upunvg6in7j4cmp0tlhvl.apps.googleusercontent.com',
  });

  const setSession = useSessionStore(state => state.setSession);

  useEffect(() => {
    const login = async () => {
      if (response?.type === 'success' && response.authentication?.accessToken) {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: {
            Authorization: `Bearer ${response.authentication.accessToken}`,
          },
        });

        const userInfo = await res.json();

        if (!userInfo.email.endsWith('@univermilenium.edu.com')) {
          alert('Solo se permiten correos @univermilenium.edu.com');
          return;
        }

        const savedUser = await userModel.upsert({
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
        });

        setSession(savedUser);
      }
    };

    login();
  }, [response]);

  return {
    promptAsync,
  };
}
