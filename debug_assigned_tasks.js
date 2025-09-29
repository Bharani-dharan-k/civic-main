const axios = require('axios');

async function debugAssignedTasksIssue() {
    try {
        console.log('🔍 Debugging Assigned Tasks Override Issue...');

        // Step 1: Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test Municipal Reports API
        console.log('\n📋 Testing Municipal Reports API...');
        const reportsResponse = await axios.get('http://localhost:5000/api/municipal/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Municipal Reports:');
        console.log('  Count:', reportsResponse.data.data?.length || 0);

        // Step 3: Test Assigned Tasks API (this is likely overriding)
        console.log('\n📋 Testing Assigned Tasks API...');
        try {
            const tasksResponse = await axios.get('http://localhost:5000/api/municipal/assigned-tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Assigned Tasks:');
            console.log('  Success:', tasksResponse.data.success);
            console.log('  Count:', tasksResponse.data.data?.length || 0);
            
            if (tasksResponse.data.data?.length > 0) {
                console.log('  Tasks found - this will OVERRIDE municipal reports!');
                tasksResponse.data.data.forEach((task, index) => {
                    console.log(`  ${index + 1}. Task: ${task.title || 'N/A'}`);
                    console.log(`     Related Report: ${task.relatedReport?.title || 'N/A'}`);
                });
            } else {
                console.log('  No tasks found - municipal reports will be used');
            }
        } catch (error) {
            console.log('Assigned Tasks API Error:', error.response?.status);
            console.log('  This means municipal reports will be used');
        }

        // Step 4: Check what's the correct approach
        console.log('\n💡 Solution:');
        console.log('  The frontend should use municipal reports (6 reports) NOT assigned tasks');
        console.log('  Assigned tasks are overriding the reports display');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugAssignedTasksIssue();