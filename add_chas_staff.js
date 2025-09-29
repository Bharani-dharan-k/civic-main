const axios = require('axios');

const addChasStaff = async () => {
    try {
        // First login as Bhupesh (SuperAdmin) to get token
        console.log('🔐 Logging in as SuperAdmin...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Create staff members for Chas Municipality
        const staffMembers = [
            {
                name: 'Amit Kumar Singh',
                email: 'amit.singh@chas.gov.in',
                phone: '9876543210',
                password: 'staff123',
                role: 'field_staff',
                department: 'Health Services',
                municipality: 'Chas Municipality'
            },
            {
                name: 'Priya Sharma',
                email: 'priya.sharma@chas.gov.in', 
                phone: '9876543211',
                password: 'staff123',
                role: 'department_head',
                department: 'Sanitation',
                municipality: 'Chas Municipality'
            },
            {
                name: 'Rajesh Kumar',
                email: 'rajesh.kumar@chas.gov.in',
                phone: '9876543212',
                password: 'staff123',
                role: 'field_staff',
                department: 'Roads & Transport',
                municipality: 'Chas Municipality'
            }
        ];
        
        console.log('\n👥 Creating staff members for Chas Municipality...');
        
        for (const staff of staffMembers) {
            try {
                const response = await axios.post('http://localhost:5000/api/municipal/staff', 
                    staff,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log(`✅ Created: ${staff.name} - ${staff.role} (${staff.department})`);
            } catch (error) {
                console.error(`❌ Failed to create ${staff.name}:`, error.response?.data?.message || error.message);
            }
        }
        
        console.log('\n🎉 Chas Municipality staff creation completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

addChasStaff();