// Debug script for Municipal Dashboard - run this in browser console
// Open browser console (F12) and paste this script while on the municipal dashboard page

console.log('🔍 Municipal Dashboard Debug Script Started');

// Check current authentication state
console.log('=== AUTHENTICATION CHECK ===');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
console.log('Token exists:', !!token);
console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
console.log('User data:', user ? JSON.parse(user) : 'No user data');

// Check all possible token keys
const tokenKeys = ['token', 'adminToken', 'citizenToken', 'workerToken'];
tokenKeys.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
        console.log(`Found token in ${key}:`, val.substring(0, 30) + '...');
    }
});

if (!token) {
    console.error('❌ No token found! User needs to login first.');
    console.log('💡 Please login through /login with Admin tab and Municipality Admin role');
    // Stop here if no token
} else {
    console.log('✅ Token found, testing API calls...');
    
    // Test API endpoints
    const testEndpoints = async () => {
        const baseURL = 'http://localhost:5000/api';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        const endpoints = [
            { name: 'Municipal Stats', url: `${baseURL}/municipal/stats` },
            { name: 'Assigned Tasks', url: `${baseURL}/municipal/tasks` },
            { name: 'Task Stats', url: `${baseURL}/municipal/tasks/stats` },
            { name: 'Municipal Reports', url: `${baseURL}/municipal/reports` },
            { name: 'Staff Data', url: `${baseURL}/municipal/staff` }
        ];
        
        console.log('\n=== API ENDPOINT TESTS ===');
        
        for (const endpoint of endpoints) {
            try {
                console.log(`\n🔄 Testing ${endpoint.name}...`);
                const response = await fetch(endpoint.url, { headers });
                const data = await response.json();
                
                console.log(`Status: ${response.status}`);
                console.log(`Success: ${data.success}`);
                
                if (data.success) {
                    console.log(`✅ ${endpoint.name} working`);
                    if (data.data) {
                        if (Array.isArray(data.data)) {
                            console.log(`   Returned ${data.data.length} items`);
                        } else {
                            console.log(`   Data:`, data.data);
                        }
                    }
                } else {
                    console.error(`❌ ${endpoint.name} failed:`, data.message);
                }
            } catch (error) {
                console.error(`❌ ${endpoint.name} error:`, error.message);
            }
        }
        
        console.log('\n=== FRONTEND API INTEGRATION CHECK ===');
        
        // Check if the frontend service functions exist
        console.log('Checking frontend API service functions...');
        
        // Try to access the window object for any exposed functions
        if (window.React) {
            console.log('✅ React is loaded');
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('1. Check browser Network tab for failed API calls');
        console.log('2. Look for CORS errors in console');
        console.log('3. Verify the authentication context is properly set up');
        console.log('4. Check if the municipal service functions are being called');
    };
    
    testEndpoints();
}

// Additional debug info
console.log('\n=== BROWSER ENVIRONMENT ===');
console.log('Current URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('Local Storage keys:', Object.keys(localStorage));

console.log('\n🔍 Debug script completed. Check the results above.');
console.log('📋 If APIs are working but dashboard shows no data, check the frontend component logic.');