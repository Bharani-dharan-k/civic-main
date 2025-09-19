import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requiredRoles }) => {
	const { isAuthenticated, user, loading } = useAuth();

	console.log('🛡️ ProtectedRoute check:', { 
		isAuthenticated, 
		user, 
		loading, 
		requiredRoles 
	});

	if (loading) {
		console.log('⏳ Still loading auth state...');
		// Show a loading spinner instead of null to prevent flash of unauthorized content
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: '100vh',
				fontSize: '18px'
			}}>
				Loading...
			</div>
		);
	}

	if (!isAuthenticated) {
		console.log('❌ Not authenticated, redirecting to login');
		return <Navigate to="/login" replace />;
	}

	if (requiredRoles && requiredRoles.length > 0) {
		if (!user) {
			console.log('❌ User is null, redirecting to unauthorized');
			return <Navigate to="/unauthorized" replace />;
		}
		
		if (!requiredRoles.includes(user.role)) {
			console.log('❌ Role mismatch:', { 
				userRole: user.role, 
				requiredRoles 
			});
			return <Navigate to="/unauthorized" replace />;
		}
		
		console.log('✅ Role check passed:', {
			userRole: user.role,
			requiredRoles
		});
	}

	console.log('✅ ProtectedRoute access granted');
	return children;
};

export default ProtectedRoute;
