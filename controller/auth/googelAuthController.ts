import { userModel } from '@/models/auth/userModel';
import { googleAuthService } from '@/services/auth/authGoogle';

export const authController = {
  loginWithGoogle: async () => {
    const userInfo = await googleAuthService.signIn();

    if (!userInfo.email.endsWith('@univermilenium.edu.com')) {
      throw new Error('Correo no permitido');
    }

    const user = await userModel.upsert({
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    });

    return user;
  },
};
