import * as AuthSession from 'expo-auth-session';

const clientId = '1076932641700-ut46bi6r6g5upunvg6in7j4cmp0tlhvl.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const googleAuthService = {
  signIn: async () => {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const result = await AuthSession.startAsync({
      authUrl:
        `${discovery.authorizationEndpoint}?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token&scope=profile email`,
    });

    if (result.type === 'success') {
      const access_token = result.params.access_token;

      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      }).then(res => res.json());

      return userInfo;
    }

    throw new Error('Login cancelado o fallido');
  }
};
