import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TradingMapChart = ({ data, title = "Report Trends Analysis" }) => {
    // Generate sample trading-style data for reports over time
    const generateTradingData = (baseData) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return months.map((month, index) => ({
            month,
            resolved: Math.floor(Math.random() * 50) + 20 + (baseData?.[0]?.count || 0) * 0.3,
            pending: Math.floor(Math.random() * 30) + 10 + (baseData?.[1]?.count || 0) * 0.2,
            newReports: Math.floor(Math.random() * 40) + 15 + (baseData?.[2]?.count || 0) * 0.25,
            satisfaction: Math.floor(Math.random() * 20) + 70, // 70-90% satisfaction
        }));
    };

    const chartData = generateTradingData(data);

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
            
            {/* Trading-style line chart */}
            <div className="mb-6" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#666"
                            fontSize={12}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="resolved" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            name="Resolved Reports"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="pending" 
                            stroke="#f59e0b" 
                            strokeWidth={3}
                            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                            name="Pending Reports"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="newReports" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            name="New Reports"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Area chart for satisfaction trends */}
            <div style={{ height: '200px' }}>
                <h4 className="text-md font-medium mb-2 text-gray-700">Citizen Satisfaction Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#666"
                            fontSize={12}
                            domain={[60, 100]}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                border: '1px solid #ccc',
                                borderRadius: '8px'
                            }}
                            formatter={(value) => [`${value}%`, 'Satisfaction']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="satisfaction" 
                            stroke="#8b5cf6" 
                            fill="url(#colorSatisfaction)"
                            strokeWidth={2}
                        />
                        <defs>
                            <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {chartData.reduce((acc, item) => acc + item.resolved, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Resolved</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {chartData.reduce((acc, item) => acc + item.pending, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {chartData.reduce((acc, item) => acc + item.newReports, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total New</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {Math.round(chartData.reduce((acc, item) => acc + item.satisfaction, 0) / chartData.length)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Satisfaction</div>
                </div>
            </div>
        </div>
    );
};

export default TradingMapChart;