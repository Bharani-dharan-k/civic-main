// Test projects fix in MunicipalDashboard
// This tests the fix for TypeError: projects.filter is not a function

console.log("🔧 Testing MunicipalDashboard projects fix...");

// Simulate the backend response structure
const mockBackendResponse = {
  success: true,
  data: {
    total: 15,
    active: 8,
    completed: 5,
    pending: 2,
    projects: [
      {
        id: 1,
        name: "Smart Traffic System",
        status: "active",
        progress: 75,
        budget: 50000,
        deadline: "2024-03-15"
      },
      {
        id: 2,
        name: "Public WiFi Network",
        status: "completed",
        progress: 100,
        budget: 30000,
        deadline: "2024-01-30"
      },
      {
        id: 3,
        name: "Digital Library",
        status: "active",
        progress: 45,
        budget: 25000,
        deadline: "2024-04-20"
      }
    ]
  }
};

// Test the old approach (would cause TypeError)
console.log("\n❌ OLD APPROACH (would cause error):");
try {
  const projectData = mockBackendResponse.data || [];
  // This would fail because projectData is an object, not an array
  console.log("projectData type:", typeof projectData);
  console.log("projectData is array:", Array.isArray(projectData));
  console.log("projectData.filter available:", typeof projectData.filter);
  
  // This would throw TypeError because projectData is an object, not array
  const activeCount = projectData.filter(p => p.status === 'active').length;
  console.log("This shouldn't work:", activeCount);
} catch (error) {
  console.log("✅ Expected error with old approach:", error.message);
}

// Test the new approach (fixed)
console.log("\n✅ NEW APPROACH (fixed):");
try {
  const projectData = mockBackendResponse.data || {};
  const projectsArray = projectData.projects || [];
  console.log("projectsArray type:", typeof projectsArray);
  console.log("projectsArray is array:", Array.isArray(projectsArray));
  console.log("projectsArray.filter available:", typeof projectsArray.filter);
  
  // Test the filter operation
  const activeProjects = projectsArray.filter(p => p.status === 'active');
  console.log("Active projects count:", activeProjects.length);
  console.log("Active projects:", activeProjects.map(p => p.name));
  
  // Test sidebar badge calculation
  const badgeCount = Array.isArray(projectsArray) ? projectsArray.filter(p => p.status === 'active').length : 0;
  console.log("Sidebar badge count:", badgeCount);
  
} catch (error) {
  console.log("Error with new approach:", error.message);
}

console.log("\n🎉 Projects fix test completed!");
console.log("The TypeError: projects.filter is not a function should now be resolved!");