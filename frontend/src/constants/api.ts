const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const USER_API_URL: string = `${API_BASE_URL}/personal`;
const LOGIN_API_URL: string = `${API_BASE_URL}/auth/token`;
const LOGOUT_API_URL: string = `${API_BASE_URL}/auth/token`;
const REFRESH_TOKEN_URL: string = `${API_BASE_URL}/auth/token`;
const VALIDATE_USER_URL: string = `${API_BASE_URL}/auth/validate-user`;

export {
    API_BASE_URL,
    USER_API_URL,
    LOGIN_API_URL,
    LOGOUT_API_URL,
    REFRESH_TOKEN_URL,
    VALIDATE_USER_URL,
}
