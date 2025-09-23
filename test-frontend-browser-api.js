// Test script to run in browser console on municipal dashboard page
// This will test if the token is stored correctly and if API calls work from browser

console.log('🧪 Frontend API Test Script');

// Check authentication
const token = localStorage.getItem('token');
console.log('Token found:', !!token);
if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
} else {
    console.error('❌ No token found! Please login first.');
}

// Test direct API call to municipal stats
async function testMunicipalAPI() {
    if (!token) {
        console.error('Cannot test API without token');
        return;
    }
    
    try {
        console.log('🔄 Testing municipal stats API...');
        const response = await fetch('http://localhost:5000/api/municipal/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Success:', data);
            return data;
        } else {
            const errorData = await response.text();
            console.error('❌ API Error:', response.status, errorData);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Test assigned tasks API
async function testAssignedTasks() {
    if (!token) return;
    
    try {
        console.log('🔄 Testing assigned tasks API...');
        const response = await fetch('http://localhost:5000/api/municipal/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Tasks API status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Tasks API Success:', data);
            if (data.success && data.data.length > 0) {
                console.log(`Found ${data.data.length} assigned tasks:`);
                data.data.forEach((task, i) => {
                    console.log(`  ${i+1}. ${task.title} (${task.status})`);
                });
            }
            return data;
        } else {
            const errorData = await response.text();
            console.error('❌ Tasks API Error:', response.status, errorData);
        }
    } catch (error) {
        console.error('❌ Tasks Network Error:', error);
    }
}

// Run tests
if (token) {
    testMunicipalAPI();
    testAssignedTasks();
} else {
    console.log('💡 Please login first at /login using Admin tab with Municipality Admin role');
}