import type { AxiosInstance } from 'axios';
import type { User } from "./UserTypes";

export interface LoginData {
    username: string;
    password: string;
}

export interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    setIsLoading: (value: boolean) => void;
    setError: (value: string | null) => void;
    login: (loginData: LoginData) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshCurrentUser: () => Promise<void>;
    api: AxiosInstance;
}

export interface ValidateUserData {
    access_token: string | null;
}
