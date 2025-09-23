const axios = require('axios');

async function testFrontendFix() {
    try {
        console.log('🔐 Testing frontend dashboard fix...');
        
        // Login as Bhupesh
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Test the same API calls that the frontend makes
        console.log('\n📊 Testing dashboard data loading...');
        
        const [
            reportsResponse,
            tasksResponse,
            statsResponse
        ] = await Promise.all([
            axios.get('http://localhost:5000/api/municipal/reports', {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => ({ data: { success: false, error: err.message } })),
            
            axios.get('http://localhost:5000/api/municipal/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => ({ data: { success: false, error: err.message } })),
            
            axios.get('http://localhost:5000/api/municipal/stats', {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => ({ data: { success: false, error: err.message } }))
        ]);

        console.log('\n📋 Results:');
        console.log('Municipal Reports:', {
            success: reportsResponse.data.success,
            count: reportsResponse.data.data?.length || 0
        });
        
        console.log('Assigned Tasks:', {
            success: tasksResponse.data.success,
            count: tasksResponse.data.data?.length || 0
        });
        
        console.log('Municipal Stats:', {
            success: statsResponse.data.success,
            totalComplaints: statsResponse.data.data?.totalComplaints || 0
        });

        // Simulate what the frontend will do now
        console.log('\n🔧 Simulating frontend logic:');
        if (tasksResponse.data.success) {
            const tasks = tasksResponse.data.data || [];
            console.log('✅ Setting assignedTasks:', tasks.length, 'items');
            
            // Transform tasks to complaints (what the fix does)
            const complaints = tasks.map(task => ({
                ...task.relatedReport,
                assignedTask: task,
                priority: task.priority,
                status: task.status,
                department: task.department
            }));
            console.log('✅ Setting citizenComplaints from tasks:', complaints.length, 'items');
            
            console.log('\n📊 Sample complaint data:');
            if (complaints.length > 0) {
                console.log('- Title:', complaints[0].title);
                console.log('- Priority:', complaints[0].priority);
                console.log('- Status:', complaints[0].status);
                console.log('- Department:', complaints[0].department);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testFrontendFix();