import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsChart = ({ data }) => {
    // Recharts expects the key for the x-axis to be consistent, so we rename '_id' to 'name'
    const chartData = data?.map(item => ({ name: item._id, Reports: item.count })) || [];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Reports" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AnalyticsChart;