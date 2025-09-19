import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Simple auth context for login/logout and current user details
const AuthContext = createContext({
	user: null,
	isAuthenticated: false,
	loading: true,
	login: async (_creds) => ({}),
	logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const API_BASE = 'http://localhost:5000/api';

	const getToken = () => localStorage.getItem('token');
	const setToken = (t) => localStorage.setItem('token', t);
	const clearToken = () => localStorage.removeItem('token');

	const fetchMe = async () => {
		const token = getToken();
		if (!token) {
			console.log('❌ No token found, user will remain null');
			setUser(null);
			return;
		}
		
		console.log('🔍 Attempting to fetch user data with token:', token.substring(0, 20) + '...');
		
		try {
			const res = await axios.get(`${API_BASE}/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			
			console.log('✅ User data fetched successfully:', res.data);
			
			if (res.data.success && res.data.user) {
				setUser(res.data.user);
				console.log('✅ User set in context:', res.data.user);
			} else {
				console.log('⚠️ API responded but no user data');
				clearToken();
				setUser(null);
			}
		} catch (err) {
			console.error('❌ Error fetching user data:', err);
			console.log('Response data:', err.response?.data);
			// Token invalid or expired
			clearToken();
			setUser(null);
		}
	};

	useEffect(() => {
		// On mount, try to hydrate user from token
		console.log('🚀 AuthContext initializing...');
		(async () => {
			await fetchMe();
			setLoading(false);
			console.log('🏁 AuthContext initialization complete');
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = async (email, password, userType = 'admin', role = null) => {
		setLoading(true);
		try {
			let endpoint;
			if (userType === 'worker') {
				endpoint = 'auth/worker/login';
			} else if (userType === 'admin') {
				endpoint = 'auth/admin/login';
			} else {
				endpoint = 'auth/login'; // citizen login
			}
			
			console.log('🔑 Login attempt:', { email, userType, role, endpoint });
			
			// Prepare login data
			const loginData = { email, password };
			if (role && userType === 'admin') {
				loginData.role = role;
			}
			
			const res = await axios.post(`${API_BASE}/${endpoint}`, loginData);
			
			if (res.data.success) {
				const { token, user } = res.data;
				if (!token) throw new Error('No token returned');
				
				console.log('🔐 Login successful, storing token and user:', { token: token.substring(0, 20) + '...', user });
				
				setToken(token);
				setUser(user);
				return { success: true, user, token };
			} else {
				const errorMessage = res.data.message || 'Login failed';
				return { success: false, message: errorMessage };
			}
		} catch (error) {
			console.error('Login error:', error);
			const errorMessage = error.response?.data?.message || error.message || 'Login failed';
			return { success: false, message: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		clearToken();
		setUser(null);
	};

	const value = {
		user,
		isAuthenticated: !!user,
		loading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
