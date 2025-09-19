const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test department head functionality
async function testDepartmentHeadFlow() {
    try {
        console.log('🧪 Testing Department Head Dashboard Flow...\n');

        // Step 1: Login as Department Head
        console.log('1. Logging in as Department Head...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
            email: 'dharun@gmail.com',
            password: '123456',
            role: 'department_head'
        });

        if (loginResponse.data.success) {
            console.log('✅ Login successful');
            console.log('Token received:', loginResponse.data.token.substring(0, 50) + '...');
            
            const token = loginResponse.data.token;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Step 2: Test Dashboard Overview
            console.log('\n2. Fetching Dashboard Overview...');
            try {
                const dashboardResponse = await axios.get(`${API_BASE_URL}/department-head/dashboard`, { headers });
                console.log('✅ Dashboard data fetched successfully');
                console.log('Dashboard overview:', JSON.stringify(dashboardResponse.data, null, 2));
            } catch (error) {
                console.log('❌ Dashboard fetch failed:', error.response?.data || error.message);
            }

            // Step 3: Test Tasks
            console.log('\n3. Fetching Tasks...');
            try {
                const tasksResponse = await axios.get(`${API_BASE_URL}/department-head/tasks`, { headers });
                console.log('✅ Tasks fetched successfully');
                console.log(`Found ${tasksResponse.data.length} tasks`);
            } catch (error) {
                console.log('❌ Tasks fetch failed:', error.response?.data || error.message);
            }

            // Step 4: Test Staff
            console.log('\n4. Fetching Staff...');
            try {
                const staffResponse = await axios.get(`${API_BASE_URL}/department-head/staff`, { headers });
                console.log('✅ Staff fetched successfully');
                console.log(`Found ${staffResponse.data.length} staff members`);
            } catch (error) {
                console.log('❌ Staff fetch failed:', error.response?.data || error.message);
            }

            // Step 5: Test Resources
            console.log('\n5. Fetching Resources...');
            try {
                const resourcesResponse = await axios.get(`${API_BASE_URL}/department-head/resources`, { headers });
                console.log('✅ Resources fetched successfully');
                console.log(`Found ${resourcesResponse.data.length} resources`);
            } catch (error) {
                console.log('❌ Resources fetch failed:', error.response?.data || error.message);
            }

            // Step 6: Test Budget
            console.log('\n6. Fetching Budget Info...');
            try {
                const budgetResponse = await axios.get(`${API_BASE_URL}/department-head/budget`, { headers });
                console.log('✅ Budget fetched successfully');
                console.log('Budget info:', JSON.stringify(budgetResponse.data, null, 2));
            } catch (error) {
                console.log('❌ Budget fetch failed:', error.response?.data || error.message);
            }

            // Step 7: Test Projects
            console.log('\n7. Fetching Projects...');
            try {
                const projectsResponse = await axios.get(`${API_BASE_URL}/department-head/projects`, { headers });
                console.log('✅ Projects fetched successfully');
                console.log(`Found ${projectsResponse.data.length} projects`);
            } catch (error) {
                console.log('❌ Projects fetch failed:', error.response?.data || error.message);
            }

            // Step 8: Test Complaints
            console.log('\n8. Fetching Complaints...');
            try {
                const complaintsResponse = await axios.get(`${API_BASE_URL}/department-head/complaints`, { headers });
                console.log('✅ Complaints fetched successfully');
                console.log(`Found ${complaintsResponse.data.length} complaints`);
            } catch (error) {
                console.log('❌ Complaints fetch failed:', error.response?.data || error.message);
            }

            // Step 9: Test Creating a Task
            console.log('\n9. Creating a new task...');
            try {
                const newTask = {
                    title: 'Test Task from API',
                    description: 'This is a test task created via API',
                    priority: 'medium',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    assignedTo: 'EMP001'
                };

                const createTaskResponse = await axios.post(`${API_BASE_URL}/department-head/tasks`, newTask, { headers });
                console.log('✅ Task created successfully');
                console.log('Created task:', JSON.stringify(createTaskResponse.data, null, 2));
            } catch (error) {
                console.log('❌ Task creation failed:', error.response?.data || error.message);
            }

            // Step 10: Test Creating Staff
            console.log('\n10. Creating a new staff member...');
            try {
                const newStaff = {
                    name: 'Test Employee API',
                    employeeId: `TEST${Date.now()}`,
                    position: 'Test Position',
                    phone: '9876543210',
                    email: `test${Date.now()}@test.com`,
                    address: 'Test Address'
                };

                const createStaffResponse = await axios.post(`${API_BASE_URL}/department-head/staff`, newStaff, { headers });
                console.log('✅ Staff member created successfully');
                console.log('Created staff:', JSON.stringify(createStaffResponse.data, null, 2));
            } catch (error) {
                console.log('❌ Staff creation failed:', error.response?.data || error.message);
            }

            console.log('\n🎉 Department Head Dashboard Flow Test Complete!');

        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }

    } catch (error) {
        console.log('❌ Test failed with error:');
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

// Run the test
testDepartmentHeadFlow();