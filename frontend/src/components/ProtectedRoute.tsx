import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type RouteProps = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate, isAuthenticated]);

    return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;