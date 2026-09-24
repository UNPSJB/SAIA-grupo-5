import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../hooks";

const AuthLayout = () => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando datos del usuario...</span>
                </Spinner>
                <p className="mt-3 text-muted">Cargando datos del usuario...</p>
            </div>
        );
    }

    if (!isAuthenticated || currentUser === null) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    return <Outlet />;
};

export default AuthLayout;
