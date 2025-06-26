// ===========================================
// 4. TU ARQUITECTURA MVC CORRECTA
// ===========================================
/*
📁 app/ (VIEW)
  📁 (tabs)/
    📄 loginScreen.tsx      ← Solo UI y estados locales

📁 hooks/ (INTERMEDIARIO)
  📁 auth/
    📄 useAuthLogin.ts      ← Maneja React hooks + llama controller
    📄 useGoogleLogin.ts    ← Hook para Google login
    📄 useLogout.ts         ← Hook para logout

📁 controller/ (CONTROLLER)
  📁 auth/
    📄 authController.ts    ← Lógica de control (API calls, validaciones)

📁 model/ (MODEL)
  📁 auth/
    📄 authModel.ts         ← Modelos de datos
    📄 userModel.ts         ← Tipos y interfaces

📁 store/ (ESTADO GLOBAL)
  📁 session/
    📄 sessionStore.ts      ← Zustand store
*/

// ===========================================
// 5. FLUJO DE TU MVC
// ===========================================
/*
1. VIEW (loginScreen.tsx)
   ↓ Usuario hace clic en "Login"
   
2. HOOK (useAuthLogin.ts)
   ↓ Maneja estado React (loading, alerts, navigation)
   ↓ Llama al controller
   
3. CONTROLLER (authController.ts)
   ↓ Valida datos
   ↓ Hace llamada API
   ↓ Transforma respuesta
   
4. MODEL (authModel.ts)
   ↓ Define estructura de datos
   ↓ Tipos y interfaces
   
5. De vuelta al HOOK
   ↓ Guarda en store
   ↓ Navega a siguiente pantalla
   ↓ Muestra mensaje de éxito
*/
