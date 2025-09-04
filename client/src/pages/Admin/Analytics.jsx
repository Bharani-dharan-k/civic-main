import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const Analytics = () => {
  // Mock data for charts
  const issuesTrend = [
    { name: 'Jan', issues: 45, resolved: 38 },
    { name: 'Feb', issues: 52, resolved: 41 },
    { name: 'Mar', issues: 48, resolved: 45 },
    { name: 'Apr', issues: 61, resolved: 52 },
    { name: 'May', issues: 55, resolved: 48 },
    { name: 'Jun', issues: 67, resolved: 59 },
  ];

  const categoryData = [
    { name: 'Public Works', value: 35, color: '#3B82F6' },
    { name: 'Sanitation', value: 25, color: '#10B981' },
    { name: 'Street Lighting', value: 20, color: '#F59E0B' },
    { name: 'Water Supply', value: 15, color: '#06B6D4' },
    { name: 'Transportation', value: 5, color: '#8B5CF6' },
  ];

  const departmentPerformance = [
    { name: 'Public Works', efficiency: 85, responseTime: '2.1 hrs' },
    { name: 'Sanitation', efficiency: 92, responseTime: '1.8 hrs' },
    { name: 'Street Lighting', efficiency: 78, responseTime: '3.2 hrs' },
    { name: 'Water Supply', efficiency: 88, responseTime: '2.5 hrs' },
    { name: 'Transportation', efficiency: 75, responseTime: '4.1 hrs' },
  ];

  const recentStats = [
    {
      title: 'Issues This Month',
      value: '67',
      change: '+12%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Resolution Rate',
      value: '88%',
      change: '+5%',
      changeType: 'increase',
      icon: BarChart3,
      color: 'green'
    },
    {
      title: 'Avg Response Time',
      value: '2.4 hrs',
      change: '-15%',
      changeType: 'decrease',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Citizen Satisfaction',
      value: '4.2/5',
      change: '+0.3',
      changeType: 'increase',
      icon: PieChart,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Analyze civic issue trends and department performance</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                stat.changeType === 'increase' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Issues Trend</h2>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          
          {/* Simple Bar Chart Visualization */}
          <div className="space-y-4">
            {issuesTrend.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{item.name}</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.issues / 70) * 100}%` }}
                    ></div>
                    <div
                      className="bg-green-500 h-full rounded-full absolute top-0 transition-all duration-1000"
                      style={{ width: `${(item.resolved / 70) * 100}%`, opacity: 0.7 }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 w-16">{item.issues}/{item.resolved}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Reported</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Resolved</span>
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Issues by Category</h2>
          </div>
          
          {/* Simple Pie Chart Visualization */}
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${item.value}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Department Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Efficiency</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {departmentPerformance.map((dept, index) => (
                <motion.tr
                  key={dept.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 font-medium text-gray-900">{dept.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{dept.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{dept.responseTime}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.efficiency >= 85 ? 'bg-green-100 text-green-700' :
                      dept.efficiency >= 75 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {dept.efficiency >= 85 ? 'Excellent' :
                       dept.efficiency >= 75 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Location Heatmap Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Issues Heatmap</h2>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4" />
            <span>View Full Map</span>
          </button>
        </div>
        
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Interactive Map Integration</p>
            <p className="text-sm text-gray-500">Shows issue density across different areas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
