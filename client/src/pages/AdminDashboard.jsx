import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Tabs, Tab, Box, Alert, CircularProgress } from '@mui/material';
import StatCard from '../components/Admin/StatCard';
import ReportList from '../components/Admin/ReportList';
import ReportMap from '../components/Admin/ReportMap';
import AnalyticsChart from '../components/Admin/AnalyticsChart';
import TradingMapChart from '../components/Admin/TradingMapChart';
import HeatMapAnalytics from '../components/Admin/HeatMapAnalytics';
import { getDashboardStats, getAdminReports, getAnalytics } from '../api/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [statsRes, reportsRes, analyticsRes] = await Promise.all([
                    getDashboardStats(),
                    getAdminReports({ page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' }),
                    getAnalytics()
                ]);
                
                setStats(statsRes.data);
                setReports(reportsRes.data.reports || []);
                setAnalytics(analyticsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setError("Failed to load dashboard data. Please check if you're logged in as an admin.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );

    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Stat Cards */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Total Reports" 
                    value={stats?.totalReports || 0} 
                    subtitle="All citizen reports"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Pending Reports" 
                    value={stats?.pendingReports || 0} 
                    color="warning.main"
                    subtitle="Awaiting resolution"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Resolved" 
                    value={stats?.resolvedReports || 0} 
                    color="success.main"
                    subtitle="Successfully completed"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Active Citizens" 
                    value={stats?.activeUsers || 0} 
                    color="primary.main"
                    subtitle="Registered users"
                />
            </Grid>

            {/* Additional Stats Row */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="In Progress" 
                    value={stats?.inProgressReports || 0} 
                    color="info.main"
                    subtitle="Currently being worked on"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Acknowledged" 
                    value={stats?.acknowledgedReports || 0} 
                    color="secondary.main"
                    subtitle="Acknowledged by admin"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Avg Resolution" 
                    value={`${stats?.averageResolutionDays || 0} days`} 
                    color="text.secondary"
                    subtitle="Average time to resolve"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                    title="Total Citizens" 
                    value={stats?.totalCitizens || 0} 
                    color="primary.main"
                    subtitle="All registered citizens"
                />
            </Grid>

            {/* Main Analytics Section */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Report Categories Distribution
                    </Typography>
                    <AnalyticsChart data={stats?.reportsByCategory} />
                </Paper>
            </Grid>

            {/* Reports List and Status Overview */}
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Reports
                    </Typography>
                    <ReportList reports={reports} />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Status Distribution
                    </Typography>
                    <AnalyticsChart 
                        data={stats?.statusDistribution} 
                        type="pie"
                        title="Report Status Breakdown"
                    />
                </Paper>
            </Grid>

            {/* Monthly Trends */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Monthly Report Trends
                    </Typography>
                    <TradingMapChart data={stats?.monthlyTrends} />
                </Paper>
            </Grid>

            {/* Daily Analytics */}
            {analytics && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Daily Report Trends (Last 30 Days)
                        </Typography>
                        <TradingMapChart 
                            data={analytics.dailyTrends} 
                            type="line"
                            title="Daily Report Submissions"
                        />
                    </Paper>
                </Grid>
            )}

            {/* Heat Map Analytics */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Report Location Heat Map
                    </Typography>
                    <HeatMapAnalytics data={analytics?.reportsByLocation || []} />
                </Paper>
            </Grid>

            {/* Interactive Map */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Reports on Map
                    </Typography>
                    <ReportMap reports={reports} />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AdminDashboard;
