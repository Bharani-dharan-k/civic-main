const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function checkUserContext() {
    try {
        console.log('🔍 Checking user context in API calls...\n');

        // Step 1: Login as Dharun
        console.log('1. Logging in as Department Head...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
            email: 'dharun@gmail.com',
            password: '123456',
            role: 'department_head'
        });

        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Parse JWT token to see user data
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
            console.log('Token payload user data:');
            console.log(JSON.stringify(payload.user, null, 2));

            // Step 2: Make a simple API call to test user context
            console.log('\n2. Testing user context in API...');
            
            // Create a task to see what department gets used
            const newTask = {
                title: 'Debug Task - Check Department',
                description: 'This task is to debug the department assignment',
                priority: 'high',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                assignedTo: '68cbaa7805d185e979969262' // Rajesh Kumar's user ID
            };

            const createTaskResponse = await axios.post(`${API_BASE_URL}/department-head/tasks`, newTask, { headers });
            console.log('Created task result:');
            console.log('Department assigned:', createTaskResponse.data.task.department);
            console.log('User ID from task:', createTaskResponse.data.task.assignedBy);

        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

checkUserContext();