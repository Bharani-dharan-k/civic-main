const axios = require('axios');

// Test the task assignment and retrieval workflow
const testTaskWorkflow = async () => {
    try {
        console.log('🧪 Testing Task Assignment Workflow...\n');
        
        const baseURL = 'http://localhost:5000/api';
        
        // Step 1: Login as Bhupesh (municipal admin)
        console.log('1️⃣ Logging in as Bhupesh...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'bhupesh@gmail.com',
            password: 'password123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Failed to login as Bhupesh');
            console.log('Response:', loginResponse.data);
            return;
        }
        
        const bhupeshToken = loginResponse.data.token;
        console.log('✅ Bhupesh login successful');
        
        // Step 2: Test fetching tasks for Bhupesh
        console.log('\n2️⃣ Fetching assigned tasks for Bhupesh...');
        const tasksResponse = await axios.get(`${baseURL}/municipal/tasks`, {
            headers: { Authorization: `Bearer ${bhupeshToken}` }
        });
        
        console.log('Tasks Response:', tasksResponse.data);
        console.log(`Found ${tasksResponse.data.data?.length || 0} tasks for Bhupesh`);
        
        // Step 3: Login as District Admin to assign a task
        console.log('\n3️⃣ Logging in as District Admin...');
        const districtLoginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'district.admin@gov.in',
            password: 'admin123'
        });
        
        if (!districtLoginResponse.data.success) {
            console.log('❌ Failed to login as District Admin');
            console.log('Response:', districtLoginResponse.data);
            return;
        }
        
        const districtToken = districtLoginResponse.data.token;
        console.log('✅ District Admin login successful');
        
        // Step 4: Get Bhupesh's user ID for task assignment
        console.log('\n4️⃣ Finding Bhupesh user for task assignment...');
        const usersResponse = await axios.get(`${baseURL}/admin/users`, {
            headers: { Authorization: `Bearer ${districtToken}` }
        });
        
        let bhupeshUserId = null;
        if (usersResponse.data.success && usersResponse.data.data) {
            const bhupeshUser = usersResponse.data.data.find(u => u.email === 'bhupesh@gmail.com');
            if (bhupeshUser) {
                bhupeshUserId = bhupeshUser._id;
                console.log('✅ Found Bhupesh user ID:', bhupeshUserId);
            }
        }
        
        if (!bhupeshUserId) {
            console.log('❌ Could not find Bhupesh user ID');
            return;
        }
        
        // Step 5: Assign a new task to Bhupesh
        console.log('\n5️⃣ Assigning new task to Bhupesh...');
        const newTaskData = {
            staffId: bhupeshUserId,
            title: 'Test Task - API Assignment',
            description: 'This is a test task assigned through the API to verify the workflow',
            priority: 'high',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const assignTaskResponse = await axios.post(`${baseURL}/admin/tasks`, newTaskData, {
            headers: { Authorization: `Bearer ${districtToken}` }
        });
        
        console.log('Task Assignment Response:', assignTaskResponse.data);
        
        if (assignTaskResponse.data.success) {
            console.log('✅ Task assigned successfully!');
            
            // Step 6: Check if Bhupesh can now see the task
            console.log('\n6️⃣ Checking if Bhupesh can see the new task...');
            const updatedTasksResponse = await axios.get(`${baseURL}/municipal/tasks`, {
                headers: { Authorization: `Bearer ${bhupeshToken}` }
            });
            
            console.log('Updated Tasks Response:', updatedTasksResponse.data);
            console.log(`Bhupesh now has ${updatedTasksResponse.data.data?.length || 0} tasks`);
            
            if (updatedTasksResponse.data.data && updatedTasksResponse.data.data.length > 0) {
                console.log('\n📋 Tasks for Bhupesh:');
                updatedTasksResponse.data.data.forEach((task, index) => {
                    console.log(`  ${index + 1}. ${task.title} (${task.status})`);
                });
                console.log('\n🎉 Task assignment workflow is working correctly!');
            } else {
                console.log('\n❌ Task assignment workflow has issues - tasks not showing up');
            }
        } else {
            console.log('❌ Failed to assign task');
        }
        
    } catch (error) {
        console.error('❌ Error in test workflow:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
};

// Run the test
testTaskWorkflow();