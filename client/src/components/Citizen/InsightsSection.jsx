import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

// Insights Section Component
const InsightsSection = () => {
  const monthlyData = [
    { month: 'Jan', reports: 2, resolved: 1 },
    { month: 'Feb', reports: 3, resolved: 2 },
    { month: 'Mar', reports: 1, resolved: 1 },
    { month: 'Apr', reports: 4, resolved: 3 },
    { month: 'May', reports: 2, resolved: 1 },
    { month: 'Jun', reports: 0, resolved: 0 }
  ];

  const categoryData = [
    { name: 'Potholes', value: 5, color: '#ff6b6b' },
    { name: 'Street Lights', value: 3, color: '#4ecdc4' },
    { name: 'Garbage', value: 2, color: '#45b7d1' },
    { name: 'Water Supply', value: 2, color: '#96ceb4' }
  ];

  const stats = [
    {
      title: 'Total Reports',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Resolution Rate',
      value: '67%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Avg. Response Time',
      value: '2.4 days',
      change: '-0.5',
      trend: 'down',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Community Impact',
      value: '8.2/10',
      change: '+0.3',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Monthly Activity
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="reports" fill="#f97316" radius={[4, 4, 0, 0]} name="Reports" />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Report Categories
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600">{category.name} ({category.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Your Community Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-green-100 text-sm">Issues Reported</div>
            <div className="text-green-200 text-xs mt-1">Making a difference</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">8</div>
            <div className="text-green-100 text-sm">Problems Solved</div>
            <div className="text-green-200 text-xs mt-1">Community improved</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">156</div>
            <div className="text-green-100 text-sm">Citizens Helped</div>
            <div className="text-green-200 text-xs mt-1">Indirect impact</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/10 rounded-xl">
          <p className="text-green-100 text-sm text-center">
            🌟 Keep up the great work! Your active participation is helping build a better community for everyone.
          </p>
        </div>
      </div>

      {/* Personal Goals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-500" />
          Personal Goals
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Monthly Report Goal</span>
              <span className="text-sm text-gray-500">2/5 completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Resolution Rate Target</span>
              <span className="text-sm text-gray-500">67/75% target</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '89%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Community Engagement</span>
              <span className="text-sm text-gray-500">85/100 interactions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightsSection;
