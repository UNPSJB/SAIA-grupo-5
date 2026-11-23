import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';

interface ProtectedRouteProps {
    allowedRoles?: Array<string>;
    requireAdmin?: boolean;
    requireAdminOrSupervisor?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, requireAdmin, requireAdminOrSupervisor }: ProtectedRouteProps) => {
    const { currentUser } = useAuth();

    if (requireAdmin && !currentUser?.administrar) {
        return <Navigate to="/no-autorizado" replace />;
    }

    if (requireAdminOrSupervisor && !currentUser?.administrar && !currentUser?.supervisor) {
        return <Navigate to="/no-autorizado" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = currentUser?.role_name;
        if (userRole && !allowedRoles.includes(userRole) && !currentUser?.administrar) {
            return <Navigate to="/no-autorizado" replace />;
        }
    }

    return <Outlet />;
};
