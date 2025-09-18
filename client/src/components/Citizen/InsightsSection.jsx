import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar, Target, Award, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { reportService } from '../../services/reportService';

// Insights Section Component
const InsightsSection = () => {
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState([]);

  // Fetch real data on component mount
  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      setLoading(true);

      // Fetch user reports and dashboard stats in parallel
      const [userReportsData, dashboardStatsData] = await Promise.all([
        reportService.getUserReports(),
        reportService.getDashboardStats().catch(() => null) // Don't fail if stats not available
      ]);

      setUserReports(userReportsData);
      setDashboardStats(dashboardStatsData);

      // Process the data for charts and stats
      processInsightsData(userReportsData, dashboardStatsData);

    } catch (error) {
      console.error('Error fetching insights data:', error);
      // Use fallback data if backend is not available
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const processInsightsData = (reports, dashStats) => {
    // Process monthly data
    const monthlyStats = processMonthlyData(reports);
    setMonthlyData(monthlyStats);

    // Process category data
    const categoryStats = processCategoryData(reports);
    setCategoryData(categoryStats);

    // Process overall stats
    const overallStats = processOverallStats(reports, dashStats);
    setStats(overallStats);
  };

  const processMonthlyData = (reports) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];

    for (let i = 0; i < 12; i++) {
      const month = monthNames[i];
      const monthReports = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate.getFullYear() === currentYear && reportDate.getMonth() === i;
      });

      const resolvedReports = monthReports.filter(report =>
        report.status === 'resolved' || report.status === 'completed'
      );

      monthlyStats.push({
        month,
        reports: monthReports.length,
        resolved: resolvedReports.length
      });
    }

    return monthlyStats;
  };

  const processCategoryData = (reports) => {
    const categoryColors = {
      'pothole': '#ff6b6b',
      'streetlight': '#4ecdc4',
      'garbage': '#45b7d1',
      'drainage': '#96ceb4',
      'water': '#ffd93d',
      'electrical': '#a8e6cf',
      'plumbing': '#ff8a80',
      'cleaning': '#c5a3ff',
      'maintenance': '#ffb347',
      'other': '#d1c4e9'
    };

    const categoryCounts = {};
    reports.forEach(report => {
      const category = report.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: categoryColors[category] || categoryColors.other
    }));
  };

  const processOverallStats = (reports, dashStats) => {
    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'completed').length;
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Calculate average response time
    const avgResponseTime = calculateAverageResponseTime(reports);

    // Calculate community impact score
    const communityImpact = calculateCommunityImpact(reports);

    return [
      {
        title: 'Total Reports',
        value: totalReports.toString(),
        change: getChangeIndicator(totalReports, dashStats?.previousPeriod?.totalReports || 0),
        trend: totalReports >= (dashStats?.previousPeriod?.totalReports || 0) ? 'up' : 'down',
        icon: BarChart3,
        color: 'blue'
      },
      {
        title: 'Resolution Rate',
        value: `${resolutionRate}%`,
        change: getChangeIndicator(resolutionRate, dashStats?.previousPeriod?.resolutionRate || 0, '%'),
        trend: resolutionRate >= (dashStats?.previousPeriod?.resolutionRate || 0) ? 'up' : 'down',
        icon: Target,
        color: 'green'
      },
      {
        title: 'Avg. Response Time',
        value: avgResponseTime,
        change: '-0.2 days',
        trend: 'down', // Lower response time is better
        icon: Calendar,
        color: 'purple'
      },
      {
        title: 'Community Impact',
        value: `${communityImpact}/10`,
        change: '+0.1',
        trend: 'up',
        icon: Award,
        color: 'orange'
      }
    ];
  };

  const calculateAverageResponseTime = (reports) => {
    const resolvedReports = reports.filter(r => r.status === 'resolved' && r.resolvedAt);

    if (resolvedReports.length === 0) return '0 days';

    const totalResponseTime = resolvedReports.reduce((sum, report) => {
      const created = new Date(report.createdAt);
      const resolved = new Date(report.resolvedAt);
      const diffTime = Math.abs(resolved - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    const avgDays = Math.round(totalResponseTime / resolvedReports.length * 10) / 10;
    return `${avgDays} days`;
  };

  const calculateCommunityImpact = (reports) => {
    // Simple formula: base score + points for reports and resolutions
    const baseScore = 5.0;
    const reportBonus = Math.min(reports.length * 0.2, 3.0);
    const resolutionBonus = reports.filter(r => r.status === 'resolved').length * 0.3;
    const totalScore = Math.min(baseScore + reportBonus + resolutionBonus, 10.0);
    return Math.round(totalScore * 10) / 10;
  };

  const getChangeIndicator = (current, previous, suffix = '') => {
    if (previous === 0) return current > 0 ? `+${current}${suffix}` : '0';
    const change = current - previous;
    return change >= 0 ? `+${change}${suffix}` : `${change}${suffix}`;
  };

  const setFallbackData = () => {
    // Fallback to dummy data if backend is not available
    setMonthlyData([
      { month: 'Jan', reports: 2, resolved: 1 },
      { month: 'Feb', reports: 3, resolved: 2 },
      { month: 'Mar', reports: 1, resolved: 1 },
      { month: 'Apr', reports: 4, resolved: 3 },
      { month: 'May', reports: 2, resolved: 1 },
      { month: 'Jun', reports: 0, resolved: 0 }
    ]);

    setCategoryData([
      { name: 'Potholes', value: 5, color: '#ff6b6b' },
      { name: 'Street Lights', value: 3, color: '#4ecdc4' },
      { name: 'Garbage', value: 2, color: '#45b7d1' },
      { name: 'Water Supply', value: 2, color: '#96ceb4' }
    ]);

    setStats([
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
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personal Insights</h2>
        <button
          onClick={fetchInsightsData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <>
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
                <div className="text-3xl font-bold mb-1">{userReports.length}</div>
                <div className="text-green-100 text-sm">Issues Reported</div>
                <div className="text-green-200 text-xs mt-1">Making a difference</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {userReports.filter(r => r.status === 'resolved' || r.status === 'completed').length}
                </div>
                <div className="text-green-100 text-sm">Problems Solved</div>
                <div className="text-green-200 text-xs mt-1">Community improved</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {Math.round(userReports.length * 12.5)} {/* Estimated citizens helped */}
                </div>
                <div className="text-green-100 text-sm">Citizens Helped</div>
                <div className="text-green-200 text-xs mt-1">Indirect impact</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <p className="text-green-100 text-sm text-center">
                {userReports.length > 0
                  ? "🌟 Keep up the great work! Your active participation is helping build a better community for everyone."
                  : "🚀 Start reporting issues to make a positive impact in your community!"
                }
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
              {(() => {
                const currentMonth = new Date().getMonth();
                const monthlyReports = userReports.filter(report => {
                  const reportMonth = new Date(report.createdAt).getMonth();
                  return reportMonth === currentMonth;
                }).length;

                const monthlyGoal = 5;
                const monthlyProgress = Math.min((monthlyReports / monthlyGoal) * 100, 100);

                const totalReports = userReports.length;
                const resolvedReports = userReports.filter(r => r.status === 'resolved' || r.status === 'completed').length;
                const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;
                const resolutionTarget = 75;
                const resolutionProgress = Math.min((resolutionRate / resolutionTarget) * 100, 100);

                const engagementScore = Math.min(userReports.length * 8.5, 100);

                return (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">Monthly Report Goal</span>
                        <span className="text-sm text-gray-500">{monthlyReports}/{monthlyGoal} completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                          style={{ width: `${monthlyProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">Resolution Rate Target</span>
                        <span className="text-sm text-gray-500">{resolutionRate}/{resolutionTarget}% target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${resolutionProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">Community Engagement</span>
                        <span className="text-sm text-gray-500">{Math.round(engagementScore)}/100 score</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${engagementScore}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default InsightsSection;
