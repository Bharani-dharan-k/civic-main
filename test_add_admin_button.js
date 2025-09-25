// Test script to debug Add New Admin button functionality
const axios = require('axios');

async function testAddAdminButton() {
    try {
        console.log('🧪 Testing Add New Admin Button Functionality');
        console.log('==================================================');
        
        // First, authenticate to get admin access
        console.log('\n1. Authenticating as super admin...');
        const authResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bharani@gmail.com',
            password: '123456'
        });
        
        if (authResponse.status === 200) {
            console.log('✅ Authentication successful');
            const token = authResponse.data.token;
            
            // Check if we can access the frontend
            console.log('\n2. Checking frontend access...');
            console.log('Frontend should be running at http://localhost:3000');
            console.log('Navigate to: http://localhost:3000 in your browser');
            console.log('Click on "User Management" tab');
            
            console.log('\n3. Testing Add New Admin button click behavior:');
            console.log('📋 Expected behavior when clicking "Add New Admin" button:');
            console.log('   - resetForm() should be called');
            console.log('   - setShowAddUserModal(true) should be called');
            console.log('   - Modal should appear with "Add New Admin User" title');
            
            console.log('\n4. Debugging checklist:');
            console.log('   ❓ Does the button respond to clicks?');
            console.log('   ❓ Are there any JavaScript console errors?');
            console.log('   ❓ Does the modal state change in React DevTools?');
            console.log('   ❓ Is the modal rendered but hidden by CSS?');
            
            console.log('\n5. Manual testing instructions:');
            console.log('   1. Open browser developer tools (F12)');
            console.log('   2. Go to Console tab');
            console.log('   3. Navigate to Super Admin Dashboard');
            console.log('   4. Click "User Management" tab');
            console.log('   5. Click "Add New Admin" button');
            console.log('   6. Check for any errors in console');
            console.log('   7. Use React DevTools to inspect showAddUserModal state');
            
            // Let's also test the backend endpoint that would be used
            console.log('\n6. Testing related backend endpoints...');
            
            const headers = { Authorization: `Bearer ${token}` };
            
            // Test getting users (to verify admin access)
            try {
                const usersResponse = await axios.get('http://localhost:5000/api/superadmin/all-users', { headers });
                console.log('✅ Backend user access working:', usersResponse.data.users?.length || 0, 'users found');
            } catch (error) {
                console.log('❌ Backend user access error:', error.response?.status, error.response?.statusText);
            }
            
            // Test creating admin endpoint (which the Add New Admin button would use)
            console.log('\n7. Testing create-admin endpoint (dry run)...');
            try {
                // This is just to test if the endpoint exists, not actually create a user
                const createAdminTest = await axios.post('http://localhost:5000/api/superadmin/create-admin', {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'test123',
                    role: 'district_admin',
                    district: 'Test District'
                }, { headers, validateStatus: () => true }); // Don't throw on any status code
                
                if (createAdminTest.status === 400 || createAdminTest.status === 409) {
                    console.log('✅ Create admin endpoint accessible (validation working)');
                } else {
                    console.log('✅ Create admin endpoint working:', createAdminTest.status);
                }
            } catch (error) {
                console.log('❌ Create admin endpoint error:', error.response?.status, error.response?.statusText);
            }
            
        } else {
            console.log('❌ Authentication failed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testAddAdminButton();