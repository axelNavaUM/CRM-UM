// src/controllers/loginController.ts
import { authModel } from '@/models/auth/authModel';

export async function loginController(username: string, password: string) {

  const response = await authModel.login(username, password);
  
  if (!response.session) {
    throw new Error('Credenciales inválidas');
  }

  return response.session;
}

export async function logoutController() {
  await authModel.logout();
}
