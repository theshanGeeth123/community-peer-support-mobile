import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { isUnauthorizedError } from "@/services/api/apiError";
import { authStorage } from "@/storage/auth.storage";

import { authApi } from "../api/auth.api";

import type {
    AuthUser,
    LoginPayload,
} from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;

  isAuthenticated: boolean;
  isInitializing: boolean;

  login: (
    payload: LoginPayload
  ) => Promise<AuthUser>;

  loginWithGoogleIdToken: (
    idToken: string
  ) => Promise<AuthUser>;

  logout: () => Promise<void>;

  logoutAll: () => Promise<void>;

  refreshCurrentUser: () => Promise<
    AuthUser | null
  >;

  setCurrentUser: (
    user: AuthUser | null
  ) => void;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  const refreshCurrentUser =
    useCallback(async () => {
      try {
        const token =
          await authStorage.getToken();

        if (!token) {
          setUser(null);
          return null;
        }

        const response =
          await authApi.getCurrentUser();

        setUser(response.data.user);

        return response.data.user;
      } catch (error) {
        /*
         * Remove the token only when the backend
         * confirms that it is no longer valid.
         *
         * A temporary network failure should not
         * automatically destroy the stored session.
         */
        if (isUnauthorizedError(error)) {
          await authStorage.removeToken();
        }

        setUser(null);

        return null;
      }
    }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshCurrentUser();
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, [refreshCurrentUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response =
        await authApi.login(payload);

      await authStorage.setToken(
        response.data.token
      );

      setUser(response.data.user);

      return response.data.user;
    },
    []
  );

  const loginWithGoogleIdToken =
    useCallback(async (idToken: string) => {
      const response =
        await authApi.googleLogin({
          idToken,
        });

      await authStorage.setToken(
        response.data.token
      );

      setUser(response.data.user);

      return response.data.user;
    }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      /*
       * Local logout should still succeed even if
       * the backend cannot currently be reached.
       */
      console.warn(
        "Backend logout failed:",
        error
      );
    } finally {
      await authStorage.removeToken();
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } finally {
      await authStorage.removeToken();
      setUser(null);
    }
  }, []);

  const setCurrentUser = useCallback(
    (nextUser: AuthUser | null) => {
      setUser(nextUser);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      isAuthenticated: Boolean(user),
      isInitializing,

      login,
      loginWithGoogleIdToken,
      logout,
      logoutAll,
      refreshCurrentUser,
      setCurrentUser,
    }),
    [
      user,
      isInitializing,
      login,
      loginWithGoogleIdToken,
      logout,
      logoutAll,
      refreshCurrentUser,
      setCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}