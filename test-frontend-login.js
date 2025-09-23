// Test script to run in browser console
// Copy and paste this into the browser console at http://localhost:3000

console.log('🧪 Testing Municipal Admin Login and API access...');

// First, clear any existing tokens
localStorage.clear();
console.log('🧹 Cleared localStorage');

// Test the login API directly
const loginAsMunicipalAdmin = async () => {
    try {
        console.log('🔑 Attempting login as Bhupesh...');
        
        const response = await fetch('http://localhost:5000/api/auth/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'bhupesh@gmail.com',
                password: '123456'
            })
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.success) {
            // Store the token the same way the frontend does
            localStorage.setItem('token', data.token);
            console.log('✅ Token stored in localStorage');
            
            // Now test municipal API calls
            console.log('🔍 Testing municipal API calls...');
            
            // Test assigned tasks
            const tasksResponse = await fetch('http://localhost:5000/api/municipal/tasks', {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const tasksData = await tasksResponse.json();
            console.log('Tasks API response:', tasksData);
            
            // Test municipal stats
            const statsResponse = await fetch('http://localhost:5000/api/municipal/stats', {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const statsData = await statsResponse.json();
            console.log('Stats API response:', statsData);
            
            console.log('✅ All API tests completed!');
            console.log('🎯 Now try navigating to /municipal-dashboard');
            
        } else {
            console.error('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error);
    }
};

// Run the test
loginAsMunicipalAdmin();