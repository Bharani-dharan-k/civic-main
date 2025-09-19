import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TestDashboardAPI = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        const testAPIs = async () => {
            console.log('🔍 Testing Dashboard APIs...');
            console.log('User:', user);
            console.log('Authenticated:', isAuthenticated);
            
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');

            if (!token) {
                setResults({ error: 'No authentication token found' });
                setLoading(false);
                return;
            }

            const testResults = {};

            // Test dashboard endpoint
            try {
                console.log('Testing dashboard endpoint...');
                const response = await fetch(`${API_BASE_URL}/department-head/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Dashboard response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Dashboard data:', data);
                    testResults.dashboard = { success: true, data };
                } else {
                    const errorText = await response.text();
                    console.error('Dashboard error:', errorText);
                    testResults.dashboard = { error: `${response.status}: ${errorText}` };
                }
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                testResults.dashboard = { error: error.message };
            }

            // Test tasks endpoint
            try {
                console.log('Testing tasks endpoint...');
                const response = await fetch(`${API_BASE_URL}/department-head/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Tasks response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Tasks data:', data);
                    testResults.tasks = { success: true, data };
                } else {
                    const errorText = await response.text();
                    console.error('Tasks error:', errorText);
                    testResults.tasks = { error: `${response.status}: ${errorText}` };
                }
            } catch (error) {
                console.error('Tasks fetch error:', error);
                testResults.tasks = { error: error.message };
            }

            setResults(testResults);
            setLoading(false);
        };

        if (isAuthenticated || localStorage.getItem('token')) {
            testAPIs();
        } else {
            console.log('Not authenticated, skipping API tests');
            setResults({ error: 'Not authenticated' });
            setLoading(false);
        }
    }, [user, isAuthenticated]);

    if (loading) {
        return (
            <div style={{ padding: '20px', fontFamily: 'monospace' }}>
                <h2>Testing Dashboard APIs...</h2>
            </div>
        );
    }

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            width: '400px', 
            background: 'white', 
            border: '2px solid #ccc', 
            padding: '15px', 
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <h3>🔍 API Debug Panel</h3>
            
            <div><strong>User:</strong> {user?.name || 'Not logged in'}</div>
            <div><strong>Role:</strong> {user?.role || 'N/A'}</div>
            <div><strong>Department:</strong> {user?.department || 'N/A'}</div>
            <div><strong>Auth Status:</strong> {isAuthenticated ? '✅' : '❌'}</div>
            <div><strong>Token:</strong> {localStorage.getItem('token') ? '✅' : '❌'}</div>
            
            <hr />
            
            {Object.entries(results).map(([endpoint, result]) => (
                <div key={endpoint} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
                    <h4>{endpoint.toUpperCase()}</h4>
                    {result.success ? (
                        <div>
                            <div style={{ color: 'green' }}>✅ Success</div>
                            <div><strong>Data:</strong></div>
                            <pre style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div style={{ color: 'red' }}>❌ {result.error}</div>
                    )}
                </div>
            ))}
            
            <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '10px', padding: '5px 10px' }}
            >
                Refresh
            </button>
        </div>
    );
};

export default TestDashboardAPI;