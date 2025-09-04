import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requiredRoles }) => {
	const { isAuthenticated, user, loading } = useAuth();

	if (loading) return null; // You can replace with a spinner if desired

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRoles && requiredRoles.length > 0) {
		if (!user || !requiredRoles.includes(user.role)) {
			return <Navigate to="/unauthorized" replace />;
		}
	}

	return children;
};

export default ProtectedRoute;
