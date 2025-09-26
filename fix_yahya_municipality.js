const axios = require('axios');

const fixYahyaMunicipality = async () => {
    try {
        console.log('🔐 Logging in as Bhupesh (SuperAdmin)...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'bhupesh@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Now I need to update Yahya's municipality field
        // Let me try to find an admin update endpoint or use direct database access
        console.log('\n🔧 This needs database-level fix...');
        console.log('To fix this issue, I need to:');
        console.log('1. Update Yahya\'s municipality field to "Chas Municipality"');
        console.log('2. Update the staff members we created to have "Chas Municipality" instead of "Bokaro Municipality"');
        
        // Actually, let me try to create the staff directly with the correct municipality by using Yahya's session
        console.log('\n🔄 Alternative: Login as Yahya and create staff through his session...');
        
        const yahyaLogin = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'yahya@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Yahya login successful');
        const yahyaToken = yahyaLogin.data.token;
        
        // Try to create staff using Yahya's token - this should automatically set the right municipality
        const staffMembers = [
            {
                name: 'Chas Health Officer',
                email: 'health.officer@chas.gov.in',
                phone: '9876543220',
                password: 'staff123',
                role: 'field_staff',
                department: 'Health Services'
            },
            {
                name: 'Chas Sanitation Head',
                email: 'sanitation.head@chas.gov.in', 
                phone: '9876543221',
                password: 'staff123',
                role: 'department_head',
                department: 'Sanitation'
            }
        ];
        
        console.log('\n👥 Creating staff using Yahya\'s session...');
        
        for (const staff of staffMembers) {
            try {
                const response = await axios.post('http://localhost:5000/api/municipal/staff', 
                    staff,
                    {
                        headers: {
                            'Authorization': `Bearer ${yahyaToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log(`✅ Created: ${staff.name} - ${staff.role} (${staff.department})`);
                console.log('Response:', response.data);
            } catch (error) {
                console.error(`❌ Failed to create ${staff.name}:`, error.response?.data?.message || error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

fixYahyaMunicipality();