const axios = require('axios');

async function testCompleteStaffManagement() {
    try {
        console.log('🧪 Testing Complete Staff Management...');
        
        // Login as Bhupesh
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Test GET staff
        console.log('\n👥 1. Testing GET staff...');
        const staffResponse = await axios.get('http://localhost:5000/api/municipal/staff', { headers });
        console.log('Current staff count:', staffResponse.data.data.length);
        
        // 2. Test ADD staff
        console.log('\n➕ 2. Testing ADD staff...');
        const timestamp = Date.now();
        const newStaff = {
            name: 'Test Staff Manager',
            email: `testmanager${timestamp}@municipality.com`,
            phone: '9876543210',
            role: 'department_head',
            department: 'Water Supply'
        };
        
        const addResponse = await axios.post('http://localhost:5000/api/municipal/staff', newStaff, { headers });
        console.log('Add Response:', addResponse.data);
        const newStaffId = addResponse.data.data._id;
        
        // 3. Test UPDATE staff
        console.log('\n✏️ 3. Testing UPDATE staff...');
        const updateData = {
            name: 'Updated Test Manager',
            department: 'Electricity',
            phone: '9876543211'
        };
        
        const updateResponse = await axios.put(`http://localhost:5000/api/municipal/staff/${newStaffId}`, updateData, { headers });
        console.log('Update Response:', updateResponse.data);
        
        // 4. Test GET staff again to verify update
        console.log('\n🔍 4. Verifying update...');
        const staffResponse2 = await axios.get('http://localhost:5000/api/municipal/staff', { headers });
        const updatedStaff = staffResponse2.data.data.find(s => s._id === newStaffId);
        console.log('Updated staff:', {
            name: updatedStaff.name,
            department: updatedStaff.department,
            phone: updatedStaff.phone
        });
        
        // 5. Test DELETE staff
        console.log('\n🗑️ 5. Testing DELETE staff...');
        const deleteResponse = await axios.delete(`http://localhost:5000/api/municipal/staff/${newStaffId}`, { headers });
        console.log('Delete Response:', deleteResponse.data);
        
        // 6. Test GET staff again to verify deletion
        console.log('\n🔍 6. Verifying deletion...');
        const staffResponse3 = await axios.get('http://localhost:5000/api/municipal/staff', { headers });
        const deletedStaff = staffResponse3.data.data.find(s => s._id === newStaffId);
        if (deletedStaff) {
            console.log('Staff marked as inactive:', deletedStaff.isActive);
        } else {
            console.log('Staff not found in active list (soft deleted)');
        }
        
        console.log('\n✅ All staff management tests completed successfully!');
        console.log('Final staff count:', staffResponse3.data.data.length);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testCompleteStaffManagement();