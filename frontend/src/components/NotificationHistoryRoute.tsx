import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function NotificationHistoryRoute({ children }: { children: ReactNode }) {
    const location = useLocation();
    const openedFromBell = location.state?.fromBell === true;

    if (!openedFromBell) {
        return <Navigate to="/" replace />;
    }

    return children;
}
