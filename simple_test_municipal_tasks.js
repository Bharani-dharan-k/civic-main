/**
 * Simple test to check if municipal admin can see assigned tasks/reports
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testMunicipalTasks() {
    console.log('🔍 Testing Municipal Admin Tasks...');
    
    try {
        // Login as Bhupesh (municipal admin)
        console.log('\n1️⃣ Logging in as Bhupesh (Municipal Admin)...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('👤 User:', loginResponse.data.user.name);
        console.log('🏢 Role:', loginResponse.data.user.role);
        
        // Get assigned tasks
        console.log('\n2️⃣ Getting assigned tasks...');
        const tasksResponse = await axios.get(`${BASE_URL}/municipal/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (tasksResponse.data.success) {
            const tasks = tasksResponse.data.data;
            console.log(`📋 Total assigned tasks/reports: ${tasks.length}`);
            
            if (tasks.length > 0) {
                console.log('\n📄 Tasks/Reports:');
                tasks.forEach((task, index) => {
                    console.log(`\n${index + 1}. ${task.title || task.description || 'Untitled'}`);
                    console.log(`   Type: ${task.type || 'Unknown'}`);
                    console.log(`   Status: ${task.status || 'Unknown'}`);
                    console.log(`   Priority: ${task.priority || 'Not set'}`);
                    if (task.assignedBy && task.assignedBy.name) {
                        console.log(`   Assigned by: ${task.assignedBy.name}`);
                    }
                });
            } else {
                console.log('⚠️  No assigned tasks/reports found');
            }
        } else {
            console.error('❌ Failed to get tasks:', tasksResponse.data.message);
        }
        
        // Get task statistics
        console.log('\n3️⃣ Getting task statistics...');
        const statsResponse = await axios.get(`${BASE_URL}/municipal/tasks/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsResponse.data.success) {
            const stats = statsResponse.data.data;
            console.log('\n📊 Task Statistics:');
            console.log(`   Total Tasks: ${stats.totalTasks || 0}`);
            console.log(`   Completed: ${stats.completedTasks || 0}`);
            console.log(`   In Progress: ${stats.inProgressTasks || 0}`);
            console.log(`   Assigned: ${stats.assignedTasks || 0}`);
            console.log(`   Overdue: ${stats.overdueTasks || 0}`);
            console.log(`   Completion Rate: ${stats.completionRate || 0}%`);
            
            if (stats.taskBreakdown) {
                console.log('\n🔄 Task Breakdown:');
                console.log(`   Traditional Tasks: ${stats.taskBreakdown.traditionalTasks || 0}`);
                console.log(`   Assigned Reports: ${stats.taskBreakdown.assignedReports || 0}`);
            }
        } else {
            console.error('❌ Failed to get task statistics:', statsResponse.data.message);
        }
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testMunicipalTasks();