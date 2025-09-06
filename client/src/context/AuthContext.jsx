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
			setUser(null);
			return;
		}
		try {
			const res = await axios.get(`${API_BASE}/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUser(res.data);
		} catch (err) {
			// Token invalid or expired
			clearToken();
			setUser(null);
		}
	};

	useEffect(() => {
		// On mount, try to hydrate user from token
		(async () => {
			await fetchMe();
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = async ({ email, password, userType = 'admin' }) => {
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
			
			console.log('🔑 Login attempt:', { email, userType, endpoint });
			const res = await axios.post(`${API_BASE}/${endpoint}`, { email, password });
			const { token } = res.data;
			if (!token) throw new Error('No token returned');
			setToken(token);
			await fetchMe();
			return { user: user || null };
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
