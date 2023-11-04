import React from 'react';
import { useNavigate } from 'react-router-dom';

type RouteProps = {
    children: React.ReactNode;
};

const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/internetbanking');
    }
  }, [navigate, isAuthenticated]);

  return !isAuthenticated ? <>{children}</> : null;
}

export default PublicRoute;