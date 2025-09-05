import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import InteractiveMap from '../../components/Admin/InteractiveMap';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('6months');
  const [exportFormat, setExportFormat] = useState('json');

  // Icon mapping for stats
  const iconMap = {
    TrendingUp,
    BarChart3,
    Calendar,
    PieChart
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics:', data.message);
        alert('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Network error occurred while loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/analytics/export?format=${exportFormat}&timeRange=${timeFilter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        // Create blob and download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from Content-Disposition header or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename;
        
        if (contentDisposition) {
          filename = contentDisposition.split('filename=')[1]?.replace(/"/g, '');
        } else {
          const extension = exportFormat === 'pdf' ? 'pdf' : exportFormat === 'csv' ? 'csv' : 'json';
          filename = `sevatrack_analytics_${timeFilter}_${new Date().toISOString().split('T')[0]}.${extension}`;
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('Report exported successfully!');
      } else {
        throw new Error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    // In a real implementation, this would reload data with the new filter
    loadAnalyticsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load analytics data</p>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <select
            value={timeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.recentStats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon] || TrendingUp;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
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
          );
        })}
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
            <div className="text-sm text-gray-500">
              Based on real data
            </div>
          </div>
          
          {/* Simple Bar Chart Visualization */}
          <div className="space-y-4">
            {analyticsData.issuesTrend.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{item.name}</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((item.issues / Math.max(...analyticsData.issuesTrend.map(i => i.issues))) * 100, 100)}%` }}
                    ></div>
                    <div
                      className="bg-green-500 h-full rounded-full absolute top-0 transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((item.resolved / Math.max(...analyticsData.issuesTrend.map(i => i.issues))) * 100, 100)}%`, 
                        opacity: 0.7 
                      }}
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
            <div className="text-sm text-gray-500">
              Total: {analyticsData.totalReports}
            </div>
          </div>
          
          {/* Simple Pie Chart Visualization */}
          <div className="space-y-4">
            {analyticsData.categoryData.map((item, index) => (
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
          <div className="text-sm text-gray-500">
            Live Performance Metrics
          </div>
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
              {analyticsData.departmentPerformance.map((dept, index) => (
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

      {/* Interactive Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <InteractiveMap 
          analyticsData={analyticsData} 
          onMarkerClick={(issueData) => {
            console.log('Issue clicked:', issueData);
            // You can implement a modal or detailed view here
          }} 
        />
      </motion.div>
    </div>
  );
};

export default Analytics;
