import React from 'react';

const HeatMapAnalytics = ({ data, title = "Issue Density Heat Map" }) => {
    // Generate heatmap data based on wards or areas
    const generateHeatMapData = (baseData) => {
        const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];
        const issues = ['Road', 'Water', 'Electricity', 'Waste', 'Traffic'];
        
        return wards.map(ward => ({
            ward,
            issues: issues.map(issue => ({
                type: issue,
                count: Math.floor(Math.random() * 50) + 5,
                intensity: Math.random()
            }))
        }));
    };

    const heatMapData = generateHeatMapData(data);

    const getIntensityColor = (intensity) => {
        if (intensity > 0.8) return 'bg-red-600';
        if (intensity > 0.6) return 'bg-red-400';
        if (intensity > 0.4) return 'bg-yellow-400';
        if (intensity > 0.2) return 'bg-green-400';
        return 'bg-green-200';
    };

    const getIntensityText = (intensity) => {
        if (intensity > 0.8) return 'Critical';
        if (intensity > 0.6) return 'High';
        if (intensity > 0.4) return 'Medium';
        if (intensity > 0.2) return 'Low';
        return 'Minimal';
    };

    return (
        <div className="w-full bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
            
            {/* Legend */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Intensity Scale</h4>
                <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
                        <span>Minimal</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                        <span>Low</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                        <span>High</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </div>

            {/* Heat Map Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 bg-gray-50 text-left text-sm font-medium">Ward/Area</th>
                            {heatMapData[0]?.issues.map(issue => (
                                <th key={issue.type} className="border border-gray-300 p-2 bg-gray-50 text-center text-sm font-medium">
                                    {issue.type}
                                </th>
                            ))}
                            <th className="border border-gray-300 p-2 bg-gray-50 text-center text-sm font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {heatMapData.map((ward, wardIndex) => (
                            <tr key={wardIndex}>
                                <td className="border border-gray-300 p-2 bg-gray-50 font-medium text-sm">
                                    {ward.ward}
                                </td>
                                {ward.issues.map((issue, issueIndex) => (
                                    <td key={issueIndex} className="border border-gray-300 p-0">
                                        <div 
                                            className={`h-12 w-full ${getIntensityColor(issue.intensity)} flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity`}
                                            title={`${issue.type}: ${issue.count} reports - ${getIntensityText(issue.intensity)} intensity`}
                                        >
                                            {issue.count}
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 p-2 text-center font-semibold bg-blue-50">
                                    {ward.issues.reduce((acc, issue) => acc + issue.count, 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                        {heatMapData.reduce((acc, ward) => 
                            acc + ward.issues.filter(issue => issue.intensity > 0.6).length, 0
                        )}
                    </div>
                    <div className="text-sm text-red-700">High Priority Areas</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                        {heatMapData.reduce((acc, ward) => 
                            acc + ward.issues.filter(issue => issue.intensity > 0.4 && issue.intensity <= 0.6).length, 0
                        )}
                    </div>
                    <div className="text-sm text-yellow-700">Medium Priority</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                        {heatMapData.reduce((acc, ward) => 
                            acc + ward.issues.filter(issue => issue.intensity <= 0.4).length, 0
                        )}
                    </div>
                    <div className="text-sm text-green-700">Low Priority</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                        {heatMapData.reduce((acc, ward) => 
                            acc + ward.issues.reduce((issueAcc, issue) => issueAcc + issue.count, 0), 0
                        )}
                    </div>
                    <div className="text-sm text-blue-700">Total Reports</div>
                </div>
            </div>
        </div>
    );
};

export default HeatMapAnalytics;