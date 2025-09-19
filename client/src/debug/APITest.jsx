import React, { useEffect, useState } from 'react';

const APITest = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:5000/api';

    const testAPI = async (endpoint, name) => {
        try {
            const token = localStorage.getItem('token');
            console.log(`Testing ${name}:`, { endpoint, token: token ? token.substring(0, 20) + '...' : 'No token' });
            
            const response = await fetch(`${API_BASE_URL}/department-head${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`${name} Response:`, response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`${name} Error:`, errorText);
                return { error: `${response.status}: ${errorText}` };
            }
            
            const data = await response.json();
            console.log(`${name} Success:`, data);
            return { success: true, data };
        } catch (error) {
            console.error(`${name} Fetch Error:`, error);
            return { error: error.message };
        }
    };

    useEffect(() => {
        const runTests = async () => {
            setLoading(true);
            const tests = [
                ['/dashboard', 'Dashboard'],
                ['/tasks', 'Tasks'],
                ['/staff', 'Staff'],
                ['/resources', 'Resources'],
                ['/projects', 'Projects'],
                ['/budget', 'Budget'],
                ['/complaints', 'Complaints']
            ];

            const testResults = {};
            for (const [endpoint, name] of tests) {
                testResults[name] = await testAPI(endpoint, name);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
            }
            
            setResults(testResults);
            setLoading(false);
        };

        runTests();
    }, []);

    if (loading) {
        return <div>Running API tests...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>API Test Results</h2>
            <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
            <br />
            {Object.entries(results).map(([name, result]) => (
                <div key={name} style={{ 
                    margin: '10px 0', 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    backgroundColor: result.success ? '#e8f5e8' : '#f5e8e8'
                }}>
                    <h3>{name}</h3>
                    {result.success ? (
                        <div>
                            <div>✅ Success</div>
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                    ) : (
                        <div>❌ Error: {result.error}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default APITest;