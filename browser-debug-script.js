// BROWSER CONSOLE DEBUG SCRIPT
// Copy and paste this into browser console on the municipal dashboard page

console.log('🔍 Municipal Dashboard Debug - Checking Authentication & API');

// Check current authentication state
console.log('=== AUTHENTICATION STATUS ===');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
    try {
        // Decode JWT payload to check user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
    } catch(e) {
        console.log('Could not decode token:', e.message);
    }
} else {
    console.error('❌ NO TOKEN FOUND! Please login at /login with Admin tab.');
}

if (user) {
    const userData = JSON.parse(user);
    console.log('User data:', userData);
} else {
    console.error('❌ NO USER DATA FOUND!');
}

// Test API calls directly
async function testAPI() {
    if (!token) {
        console.error('Cannot test API without token');
        return;
    }

    console.log('\n=== TESTING API CALLS ===');
    
    const endpoints = [
        { name: 'Municipal Stats', url: '/municipal/stats' },
        { name: 'Assigned Tasks', url: '/municipal/tasks' },
        { name: 'Municipal Reports', url: '/municipal/reports' },
        { name: 'Staff Data', url: '/municipal/staff' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔄 Testing ${endpoint.name}...`);
            const response = await fetch(`http://localhost:5000/api${endpoint.url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`Status: ${response.status}`);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ ${endpoint.name} Success:`, data);
            } else {
                console.error(`❌ ${endpoint.name} Failed:`, data);
            }
        } catch (error) {
            console.error(`❌ ${endpoint.name} Error:`, error);
        }
    }
}

// Run the test
testAPI();

console.log('\n💡 If you see authentication errors above, please:');
console.log('1. Go to /login');
console.log('2. Select Admin tab');
console.log('3. Use: bhupesh@gmail.com / 123456 / Municipality Admin role');
console.log('4. After login, come back to this page');