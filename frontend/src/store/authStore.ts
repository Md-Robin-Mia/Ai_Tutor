import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  _id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin' | 'instructor' | 'super-admin'
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  profileLoaded: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  logoutWithRedirect: (navigate: (path: string) => void) => void
  clearAuth: () => void
  setProfileLoaded: (loaded: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      profileLoaded: false,
      setAuth: (token, user) => {
        console.log('AuthStore.setAuth - Token:', token);
        console.log('AuthStore.setAuth - User:', user);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        console.log('AuthStore.logout');
        set({ token: null, user: null, isAuthenticated: false, profileLoaded: false });
      },
      logoutWithRedirect: (navigate) => {
        console.log('AuthStore.logoutWithRedirect');
        const currentUser = get().user;
        console.log('AuthStore.logoutWithRedirect - Current user role:', currentUser?.role);
        
        // Clear auth state
        set({ token: null, user: null, isAuthenticated: false, profileLoaded: false });
        
        // Redirect based on user role
        if (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') {
          console.log('AuthStore.logoutWithRedirect - Redirecting to admin login');
          navigate('/admin-login');
        } else {
          console.log('AuthStore.logoutWithRedirect - Redirecting to regular login');
          navigate('/login');
        }
      },
      clearAuth: () => {
        console.log('AuthStore.clearAuth - clearing all auth data');
        set({ token: null, user: null, isAuthenticated: false, profileLoaded: false });
      },
      setProfileLoaded: (loaded) => {
        console.log('AuthStore.setProfileLoaded:', loaded);
        set({ profileLoaded: loaded });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        console.log('AuthStore rehydrated:', state);
        if (state?.token && state?.user) {
          state.setProfileLoaded(true);
        }
      },
    }
  )
)
