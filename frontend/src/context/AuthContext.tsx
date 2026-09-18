import { AxiosError } from 'axios';
import React, { createContext, useCallback, useState, useEffect, useLayoutEffect } from "react";
import type { AuthContextType, LoginData } from "../types/AuthTypes";
import type { User } from "../types/UserTypes";
import { REFRESH_TOKEN_URL, LOGIN_API_URL, VALIDATE_USER_URL, USER_API_URL, LOGOUT_API_URL } from "../constants/api";
import { api } from "../libs/axios";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const fetchCurrentUser = useCallback(async (userId: number | string, tempToken: string | null = null) => {
        const headers = tempToken ? { Authorization: `Bearer ${tempToken}` } : {};
        const response = await api.get(`${USER_API_URL}/${userId}`, { headers, withCredentials: true });
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        setError(null);
    }, []);

    useEffect(() => {
        const validateUser = async () => {
            try {
                setIsLoading(true);
                const res = await api.get(VALIDATE_USER_URL, { withCredentials: true });
                setToken(res.data.access_token);
                await fetchCurrentUser(res.data.user_id, res.data.access_token);
            } catch {
                setToken(null);
                setIsAuthenticated(false);
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        validateUser();
    }, [fetchCurrentUser]);

    useLayoutEffect(() => {
        const authInterceptor = api.interceptors.request.use(
            (config) => {
                const isAuthEndpoint = [LOGIN_API_URL, REFRESH_TOKEN_URL].some(
                    (url) => config.url?.endsWith(url)
                );

                if (!isAuthEndpoint && token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                config.withCredentials = true;
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(authInterceptor);
        };
    }, [token]);

    useLayoutEffect(() => {
        const refreshInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    error.response &&
                    (error.response.status === 401 || error.response.status === 403) &&
                    originalRequest &&
                    !originalRequest.url?.endsWith(REFRESH_TOKEN_URL) &&
                    !originalRequest._retry
                ) {
                    originalRequest._retry = true;
                    try {
                        const response = await api.put(REFRESH_TOKEN_URL, {}, { withCredentials: true });
                        const newToken = response.data.access_token;
                        setToken(newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    } catch (err) {
                        const refreshError = err as AxiosError<{ detail?: string }>;
                        setError(refreshError.response?.data?.detail || null);
                        setToken(null);
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(refreshInterceptor);
        };
    }, []);

    const login = useCallback(async (loginData: LoginData): Promise<boolean> => {
        if (!loginData) return false;

        setIsLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("username", loginData.username);
            form.append("password", loginData.password);

            const response = await api.post(LOGIN_API_URL, form, { withCredentials: true });
            const accessToken = response.data.access_token;
            setToken(accessToken);
            await fetchCurrentUser(response.data.user_id, accessToken);
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || "Ocurrió un problema al iniciar sesión";
            setError(errorMessage);
            setCurrentUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchCurrentUser]);

    const logout = async (): Promise<void> => {
        try {
            await api.delete(LOGOUT_API_URL, { withCredentials: true });
        } catch {
            // Ignoramos error en logout
        } finally {
            setToken(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated,
                isLoading,
                setIsLoading,
                error,
                setError,
                login,
                logout,
                api,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
