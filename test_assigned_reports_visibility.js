/**
 * Test script to verify assigned reports are visible in municipal admin dashboard
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const DISTRICT_ADMIN = {
    email: 'dilshan@gmail.com',
    password: 'password123'
};

const MUNICIPAL_ADMIN = {
    email: 'bhupesh@gmail.com',
    password: 'password123'
};

class AssignedReportsVisibilityTester {
    constructor() {
        this.districtToken = null;
        this.municipalToken = null;
    }

    async run() {
        console.log('\n🔍 Testing Assigned Reports Visibility in Municipal Dashboard');
        console.log('='.repeat(70));

        try {
            // Step 1: Login as district admin
            await this.loginDistrictAdmin();
            
            // Step 2: Login as municipal admin
            await this.loginMunicipalAdmin();
            
            // Step 3: Check current assigned reports in municipal dashboard
            await this.checkMunicipalAssignedTasks();
            
            // Step 4: Check task statistics
            await this.checkMunicipalTaskStats();
            
            // Step 5: Get a report to assign (if needed)
            await this.checkAvailableReports();
            
            console.log('\n✅ Test completed successfully!');
            
        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }

    async loginDistrictAdmin() {
        console.log('\n1️⃣ Logging in as District Admin...');
        
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, DISTRICT_ADMIN);
            
            if (response.data.success) {
                this.districtToken = response.data.data.token;
                console.log('✅ District admin login successful');
                console.log('👤 User:', response.data.data.user.name);
                console.log('🏢 Role:', response.data.data.user.role);
            } else {
                throw new Error('District admin login failed');
            }
        } catch (error) {
            console.log('Error details:', error.response?.data);
            throw new Error(`District admin login error: ${error.response?.data?.message || error.message}`);
        }
    }

    async loginMunicipalAdmin() {
        console.log('\n2️⃣ Logging in as Municipal Admin...');
        
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, MUNICIPAL_ADMIN);
            
            if (response.data.success) {
                this.municipalToken = response.data.data.token;
                console.log('✅ Municipal admin login successful');
                console.log('👤 User:', response.data.data.user.name);
                console.log('🏢 Role:', response.data.data.user.role);
                console.log('🏛️ Ward:', response.data.data.user.ward);
            } else {
                throw new Error('Municipal admin login failed');
            }
        } catch (error) {
            throw new Error(`Municipal admin login error: ${error.response?.data?.message || error.message}`);
        }
    }

    async checkMunicipalAssignedTasks() {
        console.log('\n3️⃣ Checking Municipal Admin Assigned Tasks...');
        
        try {
            const response = await axios.get(`${BASE_URL}/municipal/tasks`, {
                headers: { Authorization: `Bearer ${this.municipalToken}` }
            });
            
            if (response.data.success) {
                const tasks = response.data.data;
                console.log(`📋 Total assigned tasks/reports: ${tasks.length}`);
                
                if (tasks.length > 0) {
                    console.log('\n📄 Assigned Items:');
                    tasks.forEach((task, index) => {
                        console.log(`\n${index + 1}. ${task.title || task.description}`);
                        console.log(`   Type: ${task.type || 'task'}`);
                        console.log(`   Status: ${task.status}`);
                        console.log(`   Priority: ${task.priority || 'N/A'}`);
                        if (task.assignedBy) {
                            console.log(`   Assigned by: ${task.assignedBy.name}`);
                        }
                        if (task.createdAt) {
                            console.log(`   Created: ${new Date(task.createdAt).toLocaleDateString()}`);
                        }
                    });
                } else {
                    console.log('⚠️  No assigned tasks/reports found');
                }
            } else {
                throw new Error('Failed to get assigned tasks');
            }
        } catch (error) {
            console.error('❌ Error getting assigned tasks:', error.response?.data?.message || error.message);
        }
    }

    async checkMunicipalTaskStats() {
        console.log('\n4️⃣ Checking Municipal Admin Task Statistics...');
        
        try {
            const response = await axios.get(`${BASE_URL}/municipal/tasks/stats`, {
                headers: { Authorization: `Bearer ${this.municipalToken}` }
            });
            
            if (response.data.success) {
                const stats = response.data.data;
                console.log('\n📊 Task Statistics:');
                console.log(`   Total Tasks: ${stats.totalTasks}`);
                console.log(`   Completed: ${stats.completedTasks}`);
                console.log(`   In Progress: ${stats.inProgressTasks}`);
                console.log(`   Assigned: ${stats.assignedTasks}`);
                console.log(`   Overdue: ${stats.overdueTasks}`);
                console.log(`   Completion Rate: ${stats.completionRate}%`);
                
                if (stats.taskBreakdown) {
                    console.log('\n🔄 Task Breakdown:');
                    console.log(`   Traditional Tasks: ${stats.taskBreakdown.traditionalTasks}`);
                    console.log(`   Assigned Reports: ${stats.taskBreakdown.assignedReports}`);
                }
            } else {
                throw new Error('Failed to get task statistics');
            }
        } catch (error) {
            console.error('❌ Error getting task statistics:', error.response?.data?.message || error.message);
        }
    }

    async checkAvailableReports() {
        console.log('\n5️⃣ Checking Available Reports for Assignment...');
        
        try {
            const response = await axios.get(`${BASE_URL}/district/reports`, {
                headers: { Authorization: `Bearer ${this.districtToken}` }
            });
            
            if (response.data.success) {
                const reports = response.data.data;
                console.log(`📋 Total reports available: ${reports.length}`);
                
                // Check for reports assigned to Bhupesh
                const assignedToBhupesh = reports.filter(report => 
                    report.assignedTo && 
                    (report.assignedTo.includes('bhupesh') || report.assignedTo.includes('6750'))
                );
                
                console.log(`🎯 Reports assigned to Bhupesh: ${assignedToBhupesh.length}`);
                
                if (assignedToBhupesh.length > 0) {
                    console.log('\n📄 Reports Assigned to Bhupesh:');
                    assignedToBhupesh.forEach((report, index) => {
                        console.log(`\n${index + 1}. ${report.title || report.description}`);
                        console.log(`   Status: ${report.status}`);
                        console.log(`   Priority: ${report.priority}`);
                        console.log(`   Assigned to: ${report.assignedTo}`);
                        console.log(`   Created: ${new Date(report.createdAt).toLocaleDateString()}`);
                    });
                } else {
                    console.log('⚠️  No reports currently assigned to Bhupesh');
                    console.log('💡 You may need to assign a report using the district admin dashboard');
                }
            } else {
                throw new Error('Failed to get reports');
            }
        } catch (error) {
            console.error('❌ Error getting reports:', error.response?.data?.message || error.message);
        }
    }
}

// Run the test
if (require.main === module) {
    const tester = new AssignedReportsVisibilityTester();
    tester.run();
}

module.exports = AssignedReportsVisibilityTester;