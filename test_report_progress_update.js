/**
 * Test updating report progress through municipal admin API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testReportProgressUpdate() {
    console.log('🔍 Testing Report Progress Update...');
    
    try {
        // Login as Bhupesh (municipal admin)
        console.log('\n1️⃣ Logging in as Bhupesh...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Get assigned tasks to find a report ID
        console.log('\n2️⃣ Getting assigned tasks...');
        const tasksResponse = await axios.get(`${BASE_URL}/municipal/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!tasksResponse.data.success) {
            throw new Error('Failed to get tasks: ' + tasksResponse.data.message);
        }
        
        const tasks = tasksResponse.data.data;
        console.log(`📋 Found ${tasks.length} tasks/reports`);
        
        // Find a report to update
        const report = tasks.find(task => task.type === 'report' && task._id.startsWith('report_'));
        
        if (!report) {
            console.log('⚠️  No reports found to test with');
            return;
        }
        
        console.log(`📝 Testing with report: ${report.title || report.description}`);
        console.log(`📝 Report ID: ${report._id}`);
        console.log(`📝 Current status: ${report.status}`);
        
        // Update the report progress
        console.log('\n3️⃣ Updating report progress...');
        const updateResponse = await axios.put(`${BASE_URL}/municipal/tasks/${report._id}/progress`, {
            status: 'in_progress',
            notes: 'Municipal admin is working on this report'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (updateResponse.data.success) {
            console.log('✅ Report progress updated successfully!');
            console.log('📄 Updated report:', updateResponse.data.data.title || updateResponse.data.data.description);
            console.log('📊 New status:', updateResponse.data.data.status);
            console.log('📝 Type:', updateResponse.data.data.type);
        } else {
            console.log('❌ Failed to update report progress:', updateResponse.data.message);
        }
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testReportProgressUpdate();