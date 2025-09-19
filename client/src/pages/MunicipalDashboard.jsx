import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tab,
    Tabs,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    AppBar,
    Toolbar,
    IconButton,
    Badge,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Alert,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    TrendingUp,
    Assignment,
    CheckCircle,
    Schedule,
    LocationCity,
    Person,
    Analytics,
    TableChart,
    Dashboard,
    ExitToApp,
    Business,
    Group,
    Assessment,
    People,
    Build,
    AccountBalance,
    Engineering,
    Warning,
    Notifications,
    Water,
    ElectricalServices,
    LocalShipping,
    Park,
    Security,
    AttachMoney,
    Receipt,
    Construction,
    Campaign,
    ExpandMore,
    Add,
    Edit,
    Visibility,
    Phone,
    Email,
    LocationOn,
    CalendarToday,
    TrendingDown
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
    getMunicipalStats,
    getCitizenComplaints,
    getMunicipalReports,
    assignWorker,
    getStaffData,
    addStaffMember,
    assignTask,
    getInfrastructureStatus,
    getFinanceData,
    getProjectsData,
    getEmergencyAlerts,
    getDepartments,
    getNotifications,
    getServiceRequests
} from '../api/api';

const MunicipalDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [selectedWard, setSelectedWard] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [urgentAlerts, setUrgentAlerts] = useState([]);
    
    // State for different sections
    const [citizenComplaints, setCitizenComplaints] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [infrastructureStatus, setInfrastructureStatus] = useState({});
    const [financeData, setFinanceData] = useState({});
    const [projects, setProjects] = useState([]);
    const [emergencyAlerts, setEmergencyAlerts] = useState([]);

    // Dialogs
    const [newComplaintDialog, setNewComplaintDialog] = useState(false);
    const [taskAssignDialog, setTaskAssignDialog] = useState({ open: false, staff: null });
    const [addStaffDialog, setAddStaffDialog] = useState(false);
    const [emergencyDialog, setEmergencyDialog] = useState(false);
    const [announcementDialog, setAnnouncementDialog] = useState(false);

    // Task assignment form data
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        deadline: ''
    });

    // Pending reports and assignment type
    const [pendingReports, setPendingReports] = useState([]);
    const [assignmentType, setAssignmentType] = useState('existing'); // 'existing' or 'new'
    const [selectedReport, setSelectedReport] = useState('');

    // Staff addition form data
    const [staffForm, setStaffForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'field_staff',
        department: '',
        ward: ''
    });

    useEffect(() => {
        loadDashboardData();
        loadUrgentAlerts();
    }, [selectedWard]);

    const loadDashboardData = async () => {
        try {
            // Load all data in parallel for better performance
            const [
                complaintsResponse,
                staffResponse,
                infrastructureResponse,
                financeResponse,
                projectsResponse,
                alertsResponse,
                serviceResponse
            ] = await Promise.all([
                getCitizenComplaints({ 
                    // Remove strict filtering to get all reports first
                    // status: 'submitted,acknowledged,assigned,in_progress',
                    // category: 'water,roads,streetlights,waste,sewage,drainage,parks,public_transport'
                }),
                getStaffData(),
                getInfrastructureStatus(),
                getFinanceData(),
                getProjectsData(),
                getEmergencyAlerts(),
                getServiceRequests().catch(err => {
                    console.log('⚠️ Service requests API error:', err.message);
                    return { data: { success: false, data: [] } };
                })
            ]);

            console.log('🔍 API Responses:', {
                complaints: complaintsResponse.data,
                staff: staffResponse.data,
                infrastructure: infrastructureResponse.data,
                service: serviceResponse.data
            });

            // Set citizen complaints from reports
            if (complaintsResponse.data.success) {
                const reports = complaintsResponse.data.reports || complaintsResponse.data.data || [];
                console.log('📊 Raw reports:', reports);
                
                // Define municipal categories (matching the actual schema enum values)
                const municipalCategories = [
                    'pothole', 'streetlight', 'garbage', 'drainage', 'maintenance', 
                    'electrical', 'plumbing', 'cleaning', 'other'
                ];
                
                // Filter and format complaints for municipal only
                const filteredReports = reports.filter(report => {
                    const category = report.category?.toLowerCase();
                    const isMatch = municipalCategories.includes(category);
                    console.log(`📋 Report category '${category}' matches municipal: ${isMatch}`);
                    return isMatch;
                });
                
                console.log('🎯 Filtered reports:', filteredReports.length);
                
                const formattedComplaints = filteredReports.map(report => ({
                    id: report._id,
                    title: report.title,
                    type: report.category,
                    ward: report.ward || 'Unknown',
                    priority: report.priority?.toLowerCase() || 'medium',
                    status: report.status,
                    citizen: report.reportedBy?.name || 'Anonymous',
                    phone: report.reportedBy?.phone || '',
                    createdAt: report.createdAt,
                    description: report.description
                }));
                
                console.log('✅ Final formatted complaints:', formattedComplaints);
                setCitizenComplaints(formattedComplaints);
            } else {
                console.error('❌ Complaints API failed:', complaintsResponse.data);
                setCitizenComplaints([]);
            }

            // Set staff data
            if (staffResponse.data.success) {
                const staff = staffResponse.data.data || [];
                const formattedStaff = staff.map(member => ({
                    id: member._id,
                    name: member.name,
                    role: member.role.replace('_', ' ').toUpperCase(),
                    ward: member.ward || 'All Wards',
                    status: member.isActive ? 'active' : 'inactive',
                    attendance: member.attendance || 0,
                    tasks_completed: member.tasks_completed || 0,
                    phone: member.phone || ''
                }));
                setStaffData(formattedStaff);
            }

            // Set infrastructure status
            if (infrastructureResponse.data.success) {
                setInfrastructureStatus(infrastructureResponse.data.data);
            }

            // Set finance data
            if (financeResponse.data.success) {
                setFinanceData(financeResponse.data.data);
            }

            // Set projects data
            if (projectsResponse.data.success) {
                setProjects(projectsResponse.data.data);
            }

            // Set emergency alerts
            if (alertsResponse.data.success) {
                setEmergencyAlerts(alertsResponse.data.data);
            }

            // Set service requests
            if (serviceResponse.data.success) {
                setServiceRequests(serviceResponse.data.data || []);
                console.log('✅ Service requests loaded:', serviceResponse.data.data);
            } else {
                setServiceRequests([]);
                console.log('ℹ️ No service requests available');
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to empty arrays if API fails
            setCitizenComplaints([]);
            setStaffData([]);
            setInfrastructureStatus({});
            setFinanceData({});
            setProjects([]);
            setEmergencyAlerts([]);
        }
    };

    const loadUrgentAlerts = async () => {
        try {
            const [statsResponse, alertsResponse] = await Promise.all([
                getMunicipalStats(),
                getEmergencyAlerts()
            ]);

            const alerts = [];
            
            if (statsResponse.data.success && statsResponse.data.stats) {
                const stats = statsResponse.data.stats;
                
                // Create alerts based on real data
                if (stats.pendingReports && stats.pendingReports > 10) {
                    alerts.push({
                        id: 1,
                        message: `${stats.pendingReports} reports pending resolution`,
                        type: 'complaints'
                    });
                }
                
                if (stats.inProgressReports && stats.inProgressReports > 5) {
                    alerts.push({
                        id: 2,
                        message: `${stats.inProgressReports} reports in progress`,
                        type: 'work'
                    });
                }
            }

            if (alertsResponse.data.success && alertsResponse.data.data && alertsResponse.data.data.length > 0) {
                const emergencyCount = alertsResponse.data.data.filter(alert => 
                    alert.severity === 'high' || alert.severity === 'critical'
                ).length;
                
                if (emergencyCount > 0) {
                    alerts.push({
                        id: 3,
                        message: `${emergencyCount} emergency alerts require attention`,
                        type: 'emergency'
                    });
                }
            }

            setUrgentAlerts(alerts);
        } catch (error) {
            console.error('Error loading urgent alerts:', error);
            setUrgentAlerts([]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fetch pending reports for task assignment
    const fetchPendingReports = async () => {
        try {
            console.log('📋 Fetching pending reports...');
            const response = await getMunicipalReports({ 
                status: 'submitted,acknowledged',
                limit: 50 
            });
            
            if (response.data.success) {
                setPendingReports(response.data.data || []);
                console.log('✅ Pending reports loaded:', response.data.data?.length || 0);
            } else {
                console.error('❌ Failed to load pending reports:', response.data.message);
                setPendingReports([]);
            }
        } catch (error) {
            console.error('❌ Error fetching pending reports:', error);
            setPendingReports([]);
        }
    };

    // Open task assignment dialog and fetch reports
    const openTaskAssignDialog = (staff) => {
        setTaskAssignDialog({ open: true, staff });
        fetchPendingReports();
    };

    const handleAssignTask = async () => {
        try {
            if (assignmentType === 'existing') {
                // Assigning existing report
                if (!selectedReport) {
                    alert('Please select a report to assign');
                    return;
                }

                console.log('🎯 Assigning existing report to:', taskAssignDialog.staff?.name);
                console.log('📋 Report ID:', selectedReport);

                const response = await assignWorker(selectedReport, taskAssignDialog.staff?.id || taskAssignDialog.staff?._id);
                
                if (response.data.success) {
                    const reportData = pendingReports.find(r => r._id === selectedReport);
                    console.log('✅ Report assigned successfully');
                    alert(`Report "${reportData?.title || 'Selected report'}" has been assigned to ${taskAssignDialog.staff?.name} successfully!`);
                    
                    // Refresh pending reports
                    fetchPendingReports();
                } else {
                    alert('Failed to assign report: ' + (response.data.message || 'Unknown error'));
                }
            } else {
                // Creating new task
                if (!taskForm.title || !taskForm.description) {
                    alert(t('Please fill in all required fields'));
                    return;
                }

                console.log('🎯 Assigning new task to:', taskAssignDialog.staff?.name);
                console.log('📝 Task details:', taskForm);

                const taskData = {
                    staffId: taskAssignDialog.staff?.id || taskAssignDialog.staff?._id,
                    title: taskForm.title,
                    description: taskForm.description,
                    priority: taskForm.priority,
                    deadline: taskForm.deadline
                };

                const response = await assignTask(taskData);
                
                if (response.data.success) {
                    console.log('✅ Task assigned successfully:', response.data.data);
                    alert(`Task "${taskForm.title}" has been assigned to ${taskAssignDialog.staff?.name} successfully!`);
                } else {
                    alert('Failed to assign task: ' + (response.data.message || 'Unknown error'));
                }
            }

            // Reset form and close dialog
            setTaskForm({
                title: '',
                description: '',
                priority: 'medium',
                deadline: ''
            });
            setSelectedReport('');
            setTaskAssignDialog({ open: false, staff: null });

        } catch (error) {
            console.error('❌ Error assigning task:', error);
            const errorMessage = error.response?.data?.message || 'Failed to assign task';
            alert(errorMessage);
        }
    };

    const handleAddStaff = async () => {
        try {
            if (!staffForm.name || !staffForm.email || !staffForm.department) {
                alert(t('Please fill in all required fields'));
                return;
            }

            console.log('👤 Adding new staff member:', staffForm);

            const response = await addStaffMember(staffForm);
            
            if (response.data.success) {
                console.log('✅ Staff member added successfully:', response.data.data);
                alert(`Staff member "${staffForm.name}" has been added successfully.\nDefault password: ${response.data.data.defaultPassword}`);
                
                // Reload staff data
                loadDashboardData();
                
                // Reset form and close dialog
                setStaffForm({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'field_staff',
                    department: '',
                    ward: ''
                });
                setAddStaffDialog(false);
            } else {
                alert('Failed to add staff member: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error adding staff member:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add staff member';
            alert(errorMessage);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved':
            case 'completed':
            case 'approved': return 'success';
            case 'in_progress':
            case 'active': return 'info';
            case 'pending':
            case 'pending_approval': return 'warning';
            case 'rejected':
            case 'on_leave': return 'error';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    // Theme colors - India Flag Inspired
    const theme = {
        primary: '#FF9933', // Saffron
        secondary: '#138808', // Green
        accent: '#000080', // Navy Blue (Chakra color)
        success: '#138808', // Green
        warning: '#FF9933', // Saffron
        danger: '#DC3545',
        background: '#FFFFFF', // White
        text: '#000080', // Navy Blue
        saffron: '#FF9933',
        white: '#FFFFFF',
        green: '#138808',
        navyBlue: '#000080'
    };

    // Translation object
    const translations = {
        en: {
            title: "Municipal Administration Dashboard",
            welcome: "Welcome",
            citizenComplaints: "Citizen Complaints",
            serviceRequests: "Service Requests",
            activeStaff: "Active Staff",
            revenueCollected: "Revenue Collected",
            activeProjects: "Active Projects",
            overview: "Overview",
            citizensServices: "Citizens & Services",
            infrastructure: "Infrastructure",
            staffManagement: "Staff Management",
            financeRevenue: "Finance & Revenue",
            projects: "Projects",
            emergency: "Emergency",
            reportsAnalytics: "Reports & Analytics",
            communication: "Communication",
            infrastructureStatus: "Infrastructure Status",
            waterSupply: "Water Supply Coverage",
            streetLights: "Street Lights",
            roads: "Roads in Good Condition",
            recentComplaints: "Recent Complaints",
            revenueCollection: "Revenue Collection",
            assignTaskTo: "Assign Task to",
            taskTitle: "Task Title",
            taskDescription: "Task Description",
            deadline: "Deadline",
            priority: "Priority",
            high: "High",
            medium: "Medium",
            low: "Low",
            cancel: "Cancel",
            assignTask: "Assign Task",
            addNewStaffMember: "Add New Staff Member",
            fullName: "Full Name",
            email: "Email",
            phoneNumber: "Phone Number",
            role: "Role",
            department: "Department",
            ward: "Ward",
            fieldStaff: "Field Staff",
            fieldHead: "Field Head",
            departmentHead: "Department Head",
            addStaffMember: "Add Staff Member"
        },
        hi: {
            title: "नगर निगम प्रशासन डैशबोर्ड",
            welcome: "स्वागत",
            citizenComplaints: "नागरिक शिकायतें",
            serviceRequests: "सेवा अनुरोध",
            activeStaff: "सक्रिय कर्मचारी",
            revenueCollected: "राजस्व संग्रह",
            activeProjects: "सक्रिय परियोजनाएं",
            overview: "अवलोकन",
            citizensServices: "नागरिक सेवा",
            infrastructure: "अवसंरचना",
            staffManagement: "कर्मचारी प्रबंधन",
            financeRevenue: "वित्त और राजस्व",
            projects: "परियोजनाएं",
            emergency: "आपातकाल",
            reportsAnalytics: "रिपोर्ट और विश्लेषण",
            communication: "संचार",
            infrastructureStatus: "अवसंरचना स्थिति",
            waterSupply: "जल आपूर्ति कवरेज",
            streetLights: "स्ट्रीट लाइट्स",
            roads: "अच्छी स्थिति में सड़कें",
            recentComplaints: "हाल की शिकायतें",
            revenueCollection: "राजस्व संग्रह",
            assignTaskTo: "कार्य सौंपें",
            taskTitle: "कार्य शीर्षक",
            taskDescription: "कार्य विवरण",
            deadline: "समय सीमा",
            priority: "प्राथमिकता",
            high: "उच्च",
            medium: "मध्यम",
            low: "निम्न",
            cancel: "रद्द करें",
            assignTask: "कार्य सौंपें",
            addNewStaffMember: "नया कर्मचारी जोड़ें",
            fullName: "पूरा नाम",
            email: "ईमेल",
            phoneNumber: "फोन नंबर",
            role: "पद",
            department: "विभाग",
            ward: "वार्ड",
            fieldStaff: "फील्ड कर्मचारी",
            fieldHead: "फील्ड प्रमुख",
            departmentHead: "विभाग प्रमुख",
            addStaffMember: "कर्मचारी जोड़ें"
        },
        ta: {
            title: "நகராட்சி நிர்வாக டாஷ்போர்டு",
            welcome: "வரவேற்கிறோம்",
            citizenComplaints: "குடிமக்கள் புகார்கள்",
            serviceRequests: "சேவை கோரிக்கைகள்",
            activeStaff: "செயலில் பணியாளர்கள்",
            revenueCollected: "வருவாய் சேகரிப்பு",
            activeProjects: "செயலில் திட்டங்கள்",
            overview: "மேலோட்டம்",
            citizensServices: "குடிமக்கள் மற்றும் சேவைகள்",
            infrastructure: "உள்கட்டமைப்பு",
            staffManagement: "பணியாளர் மேலாண்மை",
            financeRevenue: "நிதி மற்றும் வருவாய்",
            projects: "திட்டங்கள்",
            emergency: "அவசரநிலை",
            reportsAnalytics: "அறிக்கைகள் மற்றும் பகுப்பாய்வு",
            communication: "தொடர்பு",
            infrastructureStatus: "உள்கட்டமைப்பு நிலை",
            waterSupply: "நீர் விநியோக கவரேஜ்",
            streetLights: "தெரு விளக்குகள்",
            roads: "நல்ல நிலையில் உள்ள சாலைகள்",
            recentComplaints: "சமீபத்திய புகார்கள்",
            revenueCollection: "வருவாய் சேகரிப்பு",
            assignTaskTo: "பணி ஒப்படைக்க",
            taskTitle: "பணி தலைப்பு",
            taskDescription: "பணி விளக்கம்",
            deadline: "கடைசி தேதி",
            priority: "முன்னுரிமை",
            high: "உயர்",
            medium: "நடுத்தர",
            low: "குறைந்த",
            cancel: "ரத்து செய்",
            assignTask: "பணி ஒப்படை",
            addNewStaffMember: "புதிய பணியாளர் சேர்க்க",
            fullName: "முழு பெயர்",
            email: "மின்னஞ்சல்",
            phoneNumber: "தொலைபேசி எண்",
            role: "பதவி",
            department: "துறை",
            ward: "வார்டு",
            fieldStaff: "கள பணியாளர்",
            fieldHead: "கள தலைவர்",
            departmentHead: "துறை தலைவர்",
            addStaffMember: "பணியாளர் சேர்க்க"
        }
    };

    // Translation helper function
    const t = (key) => translations[selectedLanguage][key] || translations.en[key];

    return (
        <Box sx={{ flexGrow: 1, bgcolor: theme.background, minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static" sx={{ 
                backgroundColor: theme.navyBlue,
                mb: 2,
                boxShadow: '0 4px 12px rgba(0,0,128,0.3)'
            }}>
                <Toolbar>
                    <Business sx={{ mr: 2, color: 'white', fontSize: 30 }} />
                    <Typography variant="h6" component="div" sx={{ 
                        flexGrow: 1, 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '1.3rem'
                    }}>
                        {t('title')}
                    </Typography>
                    
                    {/* Language Selector */}
                    <FormControl size="small" sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel sx={{ 
                            color: 'white',
                            fontWeight: 'bold'
                        }}>Language</InputLabel>
                        <Select
                            value={selectedLanguage}
                            label="Language"
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            sx={{ 
                                color: 'white', 
                                fontWeight: 'bold',
                                '& .MuiOutlinedInput-notchedOutline': { 
                                    borderColor: 'white',
                                    borderWidth: '1px'
                                },
                                '& .MuiSvgIcon-root': { color: 'white' },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.saffron
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.saffron
                                }
                            }}
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="hi">हिन्दी</MenuItem>
                            <MenuItem value="ta">தமிழ்</MenuItem>
                        </Select>
                    </FormControl>
                    
                    {/* Urgent Alerts */}
                    <Badge badgeContent={urgentAlerts.length} color="error" sx={{ mr: 2 }}>
                        <Notifications sx={{ color: 'white' }} />
                    </Badge>
                    
                    <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
                        <InputLabel sx={{ 
                            color: 'white',
                            fontWeight: 'bold'
                        }}>Ward</InputLabel>
                        <Select
                            value={selectedWard}
                            label="Ward"
                            onChange={(e) => setSelectedWard(e.target.value)}
                            sx={{ 
                                color: 'white', 
                                fontWeight: 'bold',
                                '& .MuiOutlinedInput-notchedOutline': { 
                                    borderColor: 'white',
                                    borderWidth: '1px'
                                },
                                '& .MuiSvgIcon-root': { color: 'white' },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.saffron
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.saffron
                                }
                            }}
                        >
                            <MenuItem value="all">All Wards</MenuItem>
                            <MenuItem value="ward1">Ward 1</MenuItem>
                            <MenuItem value="ward2">Ward 2</MenuItem>
                            <MenuItem value="ward3">Ward 3</MenuItem>
                            <MenuItem value="ward4">Ward 4</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Typography variant="body2" sx={{ 
                        mr: 2, 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                    }}>
                        {t('welcome')}, {user?.name || 'Municipal Admin'}
                    </Typography>
                    <IconButton sx={{ 
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: theme.saffron
                        }
                    }} onClick={handleLogout}>
                        <ExitToApp />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Urgent Alerts Bar */}
            {urgentAlerts.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                            <strong>Urgent Attention Required:</strong> {urgentAlerts.length} items need immediate action
                        </Typography>
                    </Alert>
                </Box>
            )}

            <Box sx={{ p: 3 }}>
                {/* Quick Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ 
                            height: '100%', 
                            background: `linear-gradient(135deg, ${theme.saffron} 0%, #FF7A00 100%)`,
                            boxShadow: '0 8px 16px rgba(255,153,51,0.3)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <People sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                                <Typography color="white" variant="h6" fontWeight="bold">
                                    {citizenComplaints.length}
                                </Typography>
                                <Typography color="white" variant="body2">
                                    {t('citizenComplaints')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ 
                            height: '100%', 
                            background: `linear-gradient(135deg, ${theme.green} 0%, #0A6B0D 100%)`,
                            boxShadow: '0 8px 16px rgba(19,136,8,0.3)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Build sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                                <Typography color="white" variant="h6" fontWeight="bold">
                                    {serviceRequests.length}
                                </Typography>
                                <Typography color="white" variant="body2">
                                    {t('serviceRequests')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ 
                            height: '100%', 
                            background: `linear-gradient(135deg, ${theme.navyBlue} 0%, #000066 100%)`,
                            boxShadow: '0 8px 16px rgba(0,0,128,0.3)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Group sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                                <Typography color="white" variant="h6" fontWeight="bold">
                                    {staffData.filter(s => s.status === 'active').length}
                                </Typography>
                                <Typography color="white" variant="body2">
                                    {t('activeStaff')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ 
                            height: '100%', 
                            background: `linear-gradient(135deg, ${theme.saffron} 30%, ${theme.green} 100%)`,
                            boxShadow: '0 8px 16px rgba(255,153,51,0.3)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <AttachMoney sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                                <Typography color="white" variant="h6" fontWeight="bold">
                                    ₹{((financeData.propertyTax?.collected || 0) / 10000000).toFixed(1)}Cr
                                </Typography>
                                <Typography color="white" variant="body2">
                                    {t('revenueCollected')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ 
                            height: '100%', 
                            background: `linear-gradient(135deg, ${theme.green} 30%, ${theme.saffron} 100%)`,
                            boxShadow: '0 8px 16px rgba(19,136,8,0.3)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Engineering sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                                <Typography color="white" variant="h6" fontWeight="bold">
                                    {projects.filter(p => p.status === 'in_progress').length}
                                </Typography>
                                <Typography color="white" variant="body2">
                                    {t('activeProjects')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Main Navigation Tabs */}
                <Paper sx={{ 
                    width: '100%', 
                    mb: 3,
                    background: `linear-gradient(to right, ${theme.saffron}, ${theme.white}, ${theme.green})`,
                    border: `2px solid ${theme.navyBlue}`,
                    borderRadius: 2
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                color: theme.navyBlue,
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: theme.navyBlue,
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    borderRadius: 1
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.navyBlue,
                                height: 3
                            }
                        }}
                    >
                        <Tab icon={<Dashboard />} label={t('overview')} />
                        <Tab icon={<People />} label={t('citizensServices')} />
                        <Tab icon={<Build />} label={t('infrastructure')} />
                        <Tab icon={<Group />} label={t('staffManagement')} />
                        <Tab icon={<AttachMoney />} label={t('financeRevenue')} />
                        <Tab icon={<Engineering />} label={t('projects')} />
                        <Tab icon={<Security />} label={t('emergency')} />
                        <Tab icon={<Analytics />} label={t('reportsAnalytics')} />
                        <Tab icon={<Campaign />} label={t('communication')} />
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                
                {/* Overview Tab */}
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        {/* Infrastructure Status Overview */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ 
                                border: `2px solid ${theme.navyBlue}`,
                                borderRadius: 2,
                                boxShadow: `0 4px 8px rgba(0,0,128,0.1)`
                            }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: theme.navyBlue, fontWeight: 'bold' }}>
                                        <Build sx={{ mr: 1, verticalAlign: 'middle', color: theme.saffron }} />
                                        {t('infrastructureStatus')}
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>{t('waterSupply')}</Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={infrastructureStatus.waterSupply?.operational || 0} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                backgroundColor: theme.white,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: theme.green
                                                }
                                            }}
                                        />
                                        <Typography variant="caption">{infrastructureStatus.waterSupply?.operational || 0}% Operational</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>{t('streetLights')}</Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={infrastructureStatus.streetLights?.coverage || 0} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                backgroundColor: theme.white,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: theme.saffron
                                                }
                                            }}
                                        />
                                        <Typography variant="caption">{infrastructureStatus.streetLights?.coverage || 0}% Coverage</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>{t('roads')}</Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={infrastructureStatus.roads?.good_condition || 0} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                backgroundColor: theme.white,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: theme.navyBlue
                                                }
                                            }}
                                        />
                                        <Typography variant="caption">{infrastructureStatus.roads?.good_condition || 0}% Good Condition</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Recent Citizen Complaints */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ 
                                border: `2px solid ${theme.navyBlue}`,
                                borderRadius: 2,
                                boxShadow: `0 4px 8px rgba(0,0,128,0.1)`
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: theme.navyBlue, fontWeight: 'bold' }}>
                                            <People sx={{ mr: 1, verticalAlign: 'middle', color: theme.green }} />
                                            {t('recentComplaints')}
                                        </Typography>
                                        <Button 
                                            size="small" 
                                            onClick={() => setNewComplaintDialog(true)}
                                            sx={{
                                                backgroundColor: theme.saffron,
                                                color: 'white',
                                                '&:hover': { backgroundColor: '#FF7A00' }
                                            }}
                                        >
                                            <Add sx={{ mr: 1 }} /> नई | New
                                        </Button>
                                    </Box>
                                    
                                    <List>
                                        {citizenComplaints.slice(0, 4).map(complaint => (
                                            <ListItem key={complaint.id} divider>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ 
                                                        bgcolor: complaint.type === 'water' ? theme.navyBlue : 
                                                                complaint.type === 'roads' ? theme.saffron : theme.green
                                                    }}>
                                                        {complaint.type === 'water' ? <Water /> : 
                                                         complaint.type === 'roads' ? <Construction /> : <LocalShipping />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={complaint.title}
                                                    secondary={`${complaint.citizen} • ${complaint.ward}`}
                                                />
                                                <Chip
                                                    label={complaint.priority}
                                                    color={getPriorityColor(complaint.priority)}
                                                    size="small"
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Finance Overview */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        {t('revenueCollection')}
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Property Tax</Typography>
                                            <Typography variant="body2" color="primary">
                                                {financeData.propertyTax?.collection_rate || 0}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={financeData.propertyTax?.collection_rate || 0} 
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                    
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Water Bills</Typography>
                                            <Typography variant="body2" color="success.main">
                                                {financeData.waterBills?.collection_rate || 0}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={financeData.waterBills?.collection_rate || 0} 
                                            sx={{ height: 6, borderRadius: 3 }}
                                            color="success"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Active Projects */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Engineering sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Active Projects
                                    </Typography>
                                    
                                    {projects.filter(p => p.status === 'in_progress').map(project => (
                                        <Box key={project.id} sx={{ mb: 2 }}>
                                            <Typography variant="body2" gutterBottom>{project.name}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={project.progress || 0} 
                                                    sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                                />
                                                <Typography variant="caption">{project.progress || 0}%</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Emergency Alerts */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Emergency Alerts
                                    </Typography>
                                    
                                    {emergencyAlerts.map(alert => (
                                        <Alert 
                                            key={alert.id} 
                                            severity={alert.severity} 
                                            sx={{ mb: 1 }}
                                            action={
                                                <Button size="small">View</Button>
                                            }
                                        >
                                            <Typography variant="body2" fontWeight="bold">
                                                {alert.title}
                                            </Typography>
                                            <Typography variant="caption">
                                                {alert.description}
                                            </Typography>
                                        </Alert>
                                    ))}
                                    
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        startIcon={<Add />}
                                        onClick={() => setEmergencyDialog(true)}
                                        sx={{ mt: 1 }}
                                    >
                                        Create Alert
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Citizens & Services Tab */}
                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        {/* Citizen Complaints Management */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Citizen Complaints & Grievances
                                        </Typography>
                                        <Button variant="contained" startIcon={<Add />} onClick={() => setNewComplaintDialog(true)}>
                                            Add Complaint
                                        </Button>
                                    </Box>
                                    
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Title</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Citizen</TableCell>
                                                    <TableCell>Ward</TableCell>
                                                    <TableCell>Priority</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {citizenComplaints.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                            <Typography variant="body1" color="textSecondary">
                                                                No municipal complaints found. 
                                                                {/* Add a button to create test data */}
                                                                <Button 
                                                                    variant="outlined" 
                                                                    onClick={() => setNewComplaintDialog(true)}
                                                                    sx={{ ml: 2 }}
                                                                >
                                                                    Add First Complaint
                                                                </Button>
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    citizenComplaints.map(complaint => (
                                                        <TableRow key={complaint.id}>
                                                            <TableCell>{complaint.title}</TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={complaint.type} 
                                                                    size="small"
                                                                    icon={
                                                                        complaint.type === 'streetlight' ? <ElectricalServices /> :
                                                                        complaint.type === 'pothole' ? <Construction /> :
                                                                        complaint.type === 'garbage' ? <LocalShipping /> :
                                                                        complaint.type === 'drainage' ? <Water /> :
                                                                        complaint.type === 'electrical' ? <ElectricalServices /> :
                                                                        complaint.type === 'plumbing' ? <Build /> :
                                                                        complaint.type === 'cleaning' ? <LocalShipping /> :
                                                                        <Engineering />
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box>
                                                                    <Typography variant="body2">{complaint.citizen}</Typography>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                                                                        {complaint.phone}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{complaint.ward}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={complaint.priority}
                                                                    color={getPriorityColor(complaint.priority)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={complaint.status.replace('_', ' ')}
                                                                    color={getStatusColor(complaint.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Button size="small" startIcon={<Visibility />}>View</Button>
                                                                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Service Requests & Citizen Satisfaction */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Service Requests
                                    </Typography>
                                    
                                    {serviceRequests.map(request => (
                                        <Box key={request.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">{request.title}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {request.applicant} • {request.ward}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                <Chip
                                                    label={request.status.replace('_', ' ')}
                                                    color={getStatusColor(request.status)}
                                                    size="small"
                                                />
                                                {request.fee > 0 && (
                                                    <Typography variant="caption" color="primary">
                                                        ₹{request.fee}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Citizen Satisfaction */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Citizen Satisfaction
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Overall Rating</Typography>
                                            <Typography variant="body2" color="success.main">4.2/5</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={84} color="success" sx={{ height: 8, borderRadius: 4 }} />
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Response Time</Typography>
                                            <Typography variant="body2" color="warning.main">3.8/5</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={76} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                                    </Box>
                                    
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Service Quality</Typography>
                                            <Typography variant="body2" color="success.main">4.5/5</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={90} color="success" sx={{ height: 8, borderRadius: 4 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Infrastructure & Utility Monitoring Tab */}
                {tabValue === 2 && (
                    <Grid container spacing={3}>
                        {/* Water Supply Management */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Water sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Water Supply Management
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                                                <Typography variant="h4" color="primary">{infrastructureStatus.waterSupply?.dailySupply || 0}</Typography>
                                                <Typography variant="caption">Liters/Day (000s)</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                                                <Typography variant="h4" color="success.main">{infrastructureStatus.waterSupply?.avgPressure || 0}</Typography>
                                                <Typography variant="caption">Avg Pressure (PSI)</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="body2" gutterBottom>Supply Status by Area</Typography>
                                    <Box sx={{ mb: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Operational</Typography>
                                            <Typography variant="caption">{infrastructureStatus.waterSupply?.operational}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={infrastructureStatus.waterSupply?.operational || 0} color="success" />
                                    </Box>
                                    
                                    <Box sx={{ mb: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Under Maintenance</Typography>
                                            <Typography variant="caption">{infrastructureStatus.waterSupply?.maintenance}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={infrastructureStatus.waterSupply?.maintenance || 0} color="warning" />
                                    </Box>
                                    
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Outage</Typography>
                                            <Typography variant="caption">{infrastructureStatus.waterSupply?.outage}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={infrastructureStatus.waterSupply?.outage || 0} color="error" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Waste Management */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Waste Management
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid size={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                                                <Typography variant="h5" color="success.main">{infrastructureStatus.wasteManagement?.routes_covered || 0}</Typography>
                                                <Typography variant="caption">Routes Covered</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                                                <Typography variant="h5" color="warning.main">{infrastructureStatus.wasteManagement?.routes_pending || 0}</Typography>
                                                <Typography variant="caption">Pending</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
                                                <Typography variant="h5" color="info.main">{infrastructureStatus.wasteManagement?.recycling_rate || 0}%</Typography>
                                                <Typography variant="caption">Recycling</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="body2" gutterBottom>Collection Schedule</Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemText primary="Ward 1-2" secondary="Monday, Wednesday, Friday" />
                                            <Chip label="On Track" color="success" size="small" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Ward 3-4" secondary="Tuesday, Thursday, Saturday" />
                                            <Chip label="Delayed" color="warning" size="small" />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Street Lights & Roads */}
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <ElectricalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Street Lights & Road Infrastructure
                                    </Typography>
                                    
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" gutterBottom>Street Lighting Status</Typography>
                                            <Grid container spacing={1}>
                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="success.main">{infrastructureStatus.streetLights?.working || 0}</Typography>
                                                        <Typography variant="caption">Working</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="error.main">{infrastructureStatus.streetLights?.faulty || 0}</Typography>
                                                        <Typography variant="caption">Faulty</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="warning.main">{infrastructureStatus.streetLights?.maintenance || 0}</Typography>
                                                        <Typography variant="caption">Maintenance</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" gutterBottom>Road Conditions ({infrastructureStatus.roads?.total_km || 0} km total)</Typography>
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption">Good Condition: {infrastructureStatus.roads?.good_condition}%</Typography>
                                                <LinearProgress variant="determinate" value={infrastructureStatus.roads?.good_condition || 0} color="success" />
                                            </Box>
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption">Needs Repair: {infrastructureStatus.roads?.needs_repair}%</Typography>
                                                <LinearProgress variant="determinate" value={infrastructureStatus.roads?.needs_repair || 0} color="warning" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption">Under Construction: {infrastructureStatus.roads?.under_construction}%</Typography>
                                                <LinearProgress variant="determinate" value={infrastructureStatus.roads?.under_construction || 0} color="info" />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Staff & Department Management Tab */}
                {tabValue === 3 && (
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Municipal Staff Management
                                        </Typography>
                                        <Button variant="contained" startIcon={<Add />} onClick={() => setAddStaffDialog(true)}>
                                            Add Staff Member
                                        </Button>
                                    </Box>
                                    
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Staff Member</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Coverage Area</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Attendance</TableCell>
                                                    <TableCell>Tasks Completed</TableCell>
                                                    <TableCell>Contact</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {staffData.map(staff => (
                                                    <TableRow key={staff.id}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar sx={{ mr: 2, bgcolor: theme.primary }}>
                                                                    <Person />
                                                                </Avatar>
                                                                <Typography variant="body2">{staff.name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{staff.role}</TableCell>
                                                        <TableCell>{staff.ward}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={staff.status.replace('_', ' ')}
                                                                color={getStatusColor(staff.status)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <LinearProgress 
                                                                    variant="determinate" 
                                                                    value={staff.attendance || 0} 
                                                                    sx={{ width: 60, height: 6 }}
                                                                />
                                                                <Typography variant="caption">{staff.attendance || 0}%</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={staff.tasks_completed} color="info" size="small" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption">
                                                                <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                                                                {staff.phone}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                size="small" 
                                                                onClick={() => openTaskAssignDialog(staff)}
                                                            >
                                                                Assign Task
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Finance & Revenue Tab */}
                {tabValue === 4 && (
                    <Grid container spacing={3}>
                        {/* Revenue Overview */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Monthly Revenue Trend
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={financeData.monthlyRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `₹${(value/100000).toFixed(1)}L`} />
                                            <Area type="monotone" dataKey="property" stackId="1" stroke="#8884d8" fill="#8884d8" name="Property Tax" />
                                            <Area type="monotone" dataKey="water" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Water Bills" />
                                            <Area type="monotone" dataKey="other" stackId="1" stroke="#ffc658" fill="#ffc658" name="Other" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Collection Status */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Collection Status
                                    </Typography>
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" gutterBottom>Property Tax Collection</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption">₹{(financeData.propertyTax?.collected / 10000000).toFixed(1)}Cr / ₹{(financeData.propertyTax?.target / 10000000).toFixed(1)}Cr</Typography>
                                            <Typography variant="caption" color="primary">{financeData.propertyTax?.collection_rate}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={financeData.propertyTax?.collection_rate || 0} 
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" gutterBottom>Water Bills Collection</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption">₹{(financeData.waterBills?.collected / 1000000).toFixed(1)}L / ₹{(financeData.waterBills?.target / 1000000).toFixed(1)}L</Typography>
                                            <Typography variant="caption" color="success.main">{financeData.waterBills?.collection_rate}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={financeData.waterBills?.collection_rate || 0} 
                                            sx={{ height: 8, borderRadius: 4 }}
                                            color="success"
                                        />
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="body2" gutterBottom>Monthly Expenses</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption">Salaries</Typography>
                                        <Typography variant="caption">₹{(financeData.expenses?.salaries / 1000000).toFixed(1)}L</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption">Maintenance</Typography>
                                        <Typography variant="caption">₹{(financeData.expenses?.maintenance / 1000000).toFixed(1)}L</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption">Development</Typography>
                                        <Typography variant="caption">₹{(financeData.expenses?.development / 1000000).toFixed(1)}L</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption">Utilities</Typography>
                                        <Typography variant="caption">₹{(financeData.expenses?.utilities / 1000000).toFixed(1)}L</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Projects & Development Tab */}
                {tabValue === 5 && (
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            <Engineering sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Municipal Projects & Development
                                        </Typography>
                                        <Button variant="contained" startIcon={<Add />}>
                                            New Project
                                        </Button>
                                    </Box>
                                    
                                    {projects.map(project => (
                                        <Accordion key={project.id}>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle1">{project.name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {project.ward} • {project.contractor}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ minWidth: 100 }}>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={project.progress || 0} 
                                                            sx={{ mb: 0.5 }}
                                                        />
                                                        <Typography variant="caption">{project.progress || 0}% Complete</Typography>
                                                    </Box>
                                                    <Chip
                                                        label={project.status.replace('_', ' ')}
                                                        color={getStatusColor(project.status)}
                                                        size="small"
                                                    />
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Typography variant="body2" gutterBottom><strong>Budget Details</strong></Typography>
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="caption">Total Budget: ₹{(project.budget / 100000).toFixed(1)}L</Typography>
                                                        </Box>
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="caption">Amount Spent: ₹{(project.spent / 100000).toFixed(1)}L</Typography>
                                                        </Box>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="caption">Remaining: ₹{((project.budget - project.spent) / 100000).toFixed(1)}L</Typography>
                                                        </Box>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={((project.spent || 0) / (project.budget || 1)) * 100} 
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Typography variant="body2" gutterBottom><strong>Project Timeline</strong></Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                                                            <Typography variant="caption">Deadline: {project.deadline}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                                                            <Typography variant="caption">Location: {project.ward}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Business sx={{ fontSize: 16, mr: 1 }} />
                                                            <Typography variant="caption">Contractor: {project.contractor}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                
                                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                    <Button size="small" startIcon={<Visibility />}>View Details</Button>
                                                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                                                    {project.status === 'in_progress' && (
                                                        <Button size="small" startIcon={<Assessment />}>Performance Report</Button>
                                                    )}
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Emergency & Public Safety Tab */}
                {tabValue === 6 && (
                    <Grid container spacing={3}>
                        {/* Emergency Alerts */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Emergency Management System
                                        </Typography>
                                        <Button variant="contained" color="error" startIcon={<Warning />} onClick={() => setEmergencyDialog(true)}>
                                            Create Alert
                                        </Button>
                                    </Box>
                                    
                                    {emergencyAlerts.map(alert => (
                                        <Card key={alert.id} sx={{ mb: 2, border: alert.severity === 'high' ? '2px solid #f44336' : '1px solid #ddd' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                    <Typography variant="subtitle1" color={alert.severity === 'high' ? 'error' : 'textPrimary'}>
                                                        {alert.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Chip
                                                            label={alert.severity}
                                                            color={alert.severity === 'high' ? 'error' : 'warning'}
                                                            size="small"
                                                        />
                                                        <Chip
                                                            label={alert.status}
                                                            color={alert.status === 'active' ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Box>
                                                
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    {alert.description}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                    <Typography variant="caption">
                                                        <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                                                        {alert.ward} • Created: {new Date(alert.createdAt).toLocaleString()}
                                                    </Typography>
                                                    <Box>
                                                        <Button size="small">Update</Button>
                                                        <Button size="small" color="error">Resolve</Button>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Emergency Contacts & Actions */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Emergency Contacts
                                    </Typography>
                                    
                                    <List dense>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'error.main' }}>
                                                    <Security />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary="Police Control Room" 
                                                secondary="+91-100 | +91-9876543200"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                                    <Build />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary="Fire Department" 
                                                secondary="+91-101 | +91-9876543201"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                                    <Water />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary="Water Emergency" 
                                                secondary="+91-9876543202"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                                    <LocationCity />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary="District Admin" 
                                                secondary="+91-9876543203"
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Quick Actions
                                    </Typography>
                                    
                                    <Button fullWidth variant="outlined" color="error" sx={{ mb: 1 }}>
                                        <Warning sx={{ mr: 1 }} />
                                        Disaster Alert
                                    </Button>
                                    <Button fullWidth variant="outlined" color="warning" sx={{ mb: 1 }}>
                                        <Build sx={{ mr: 1 }} />
                                        Service Disruption
                                    </Button>
                                    <Button fullWidth variant="outlined" color="info">
                                        <Notifications sx={{ mr: 1 }} />
                                        Public Announcement
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Reports & Analytics Tab */}
                {tabValue === 7 && (
                    <Grid container spacing={3}>
                        {/* Ward Performance */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Ward-wise Performance Report
                                    </Typography>
                                    
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ward</TableCell>
                                                    <TableCell>Complaints</TableCell>
                                                    <TableCell>Resolved</TableCell>
                                                    <TableCell>Response Time</TableCell>
                                                    <TableCell>Rating</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Ward 1</TableCell>
                                                    <TableCell>45</TableCell>
                                                    <TableCell>42</TableCell>
                                                    <TableCell>2.3 hrs</TableCell>
                                                    <TableCell><Chip label="4.2" color="success" size="small" /></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Ward 2</TableCell>
                                                    <TableCell>52</TableCell>
                                                    <TableCell>48</TableCell>
                                                    <TableCell>3.1 hrs</TableCell>
                                                    <TableCell><Chip label="3.8" color="warning" size="small" /></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Ward 3</TableCell>
                                                    <TableCell>38</TableCell>
                                                    <TableCell>36</TableCell>
                                                    <TableCell>1.9 hrs</TableCell>
                                                    <TableCell><Chip label="4.5" color="success" size="small" /></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Ward 4</TableCell>
                                                    <TableCell>41</TableCell>
                                                    <TableCell>35</TableCell>
                                                    <TableCell>4.2 hrs</TableCell>
                                                    <TableCell><Chip label="3.2" color="error" size="small" /></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Service Delivery KPIs */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Service Delivery KPIs
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={[
                                            { service: 'Water', target: 95, actual: 88 },
                                            { service: 'Sanitation', target: 90, actual: 92 },
                                            { service: 'Roads', target: 85, actual: 78 },
                                            { service: 'Electricity', target: 98, actual: 96 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="service" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="target" fill="#e0e0e0" name="Target %" />
                                            <Bar dataKey="actual" fill="#4caf50" name="Actual %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Monthly Review */}
                        <Grid size={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Monthly Municipal Services Review
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={financeData.monthlyRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="property" stroke="#8884d8" strokeWidth={2} name="Service Requests" />
                                            <Line type="monotone" dataKey="water" stroke="#82ca9d" strokeWidth={2} name="Completed Tasks" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Communication & Transparency Tab */}
                {tabValue === 8 && (
                    <Grid container spacing={3}>
                        {/* Notifications & Announcements */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            <Campaign sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Public Communications
                                        </Typography>
                                        <Button variant="contained" startIcon={<Add />} onClick={() => setAnnouncementDialog(true)}>
                                            New Announcement
                                        </Button>
                                    </Box>
                                    
                                    <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="primary">
                                                Water Supply Maintenance Notice
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                Scheduled maintenance work on main water supply line. Water supply will be disrupted in Ward 2 from 6 AM to 2 PM tomorrow.
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip label="Active" color="success" size="small" />
                                                <Chip label="Ward 2" size="small" />
                                                <Chip label="Water" size="small" />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card sx={{ mb: 2, bgcolor: 'warning.50' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="warning.main">
                                                Road Closure - Main Street
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                Emergency pipe repair work in progress. Main Street will be partially closed from 2 PM to 6 PM today. Alternative routes available via Park Road.
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip label="Urgent" color="warning" size="small" />
                                                <Chip label="Ward 1" size="small" />
                                                <Chip label="Roads" size="small" />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card sx={{ mb: 2, bgcolor: 'success.50' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="success.main">
                                                Property Tax Deadline Reminder
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                Last date for property tax payment without penalty is January 31st, 2025. Pay online or visit municipal office during working hours.
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip label="Info" color="info" size="small" />
                                                <Chip label="All Wards" size="small" />
                                                <Chip label="Tax" size="small" />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Quick Communication Tools */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Quick Communication
                                    </Typography>
                                    
                                    <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                        <Notifications sx={{ mr: 1 }} />
                                        Send SMS Alert
                                    </Button>
                                    <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                        <Email sx={{ mr: 1 }} />
                                        Email Newsletter
                                    </Button>
                                    <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                        <Campaign sx={{ mr: 1 }} />
                                        WhatsApp Broadcast
                                    </Button>
                                    <Button fullWidth variant="outlined">
                                        <LocationCity sx={{ mr: 1 }} />
                                        Connect District Admin
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Transparency Portal
                                    </Typography>
                                    
                                    <List dense>
                                        <ListItem>
                                            <ListItemText primary="Budget Documents" secondary="2024-25 Municipal Budget" />
                                            <Button size="small">Publish</Button>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Tender Notices" secondary="3 Active Tenders" />
                                            <Button size="small">View</Button>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Project Updates" secondary="5 Ongoing Projects" />
                                            <Button size="small">Update</Button>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Meeting Minutes" secondary="Last Council Meeting" />
                                            <Button size="small">Upload</Button>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>

            {/* Dialogs */}
            
            {/* New Complaint Dialog */}
            <Dialog open={newComplaintDialog} onClose={() => setNewComplaintDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Citizen Complaint</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={12}>
                            <TextField fullWidth label="Complaint Title" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select label="Type">
                                    <MenuItem value="water">Water Supply</MenuItem>
                                    <MenuItem value="sanitation">Sanitation</MenuItem>
                                    <MenuItem value="roads">Roads</MenuItem>
                                    <MenuItem value="electricity">Electricity</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select label="Priority">
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Citizen Name" />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Phone Number" />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={3} label="Description" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewComplaintDialog(false)}>Cancel</Button>
                    <Button variant="contained">Add Complaint</Button>
                </DialogActions>
            </Dialog>

            {/* Task Assignment Dialog */}
            <Dialog open={taskAssignDialog.open} onClose={() => setTaskAssignDialog({ open: false, staff: null })} maxWidth="md" fullWidth>
                <DialogTitle>{t('Assign Task to')} {taskAssignDialog.staff?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Assignment Type Selection */}
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <InputLabel>Assignment Type</InputLabel>
                                <Select 
                                    label="Assignment Type"
                                    value={assignmentType}
                                    onChange={(e) => setAssignmentType(e.target.value)}
                                >
                                    <MenuItem value="existing">Assign Existing Report</MenuItem>
                                    <MenuItem value="new">Create New Task</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Existing Reports Selection */}
                        {assignmentType === 'existing' && (
                            <>
                                <Grid size={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Select Pending Report</InputLabel>
                                        <Select 
                                            label="Select Pending Report"
                                            value={selectedReport}
                                            onChange={(e) => setSelectedReport(e.target.value)}
                                        >
                                            {pendingReports.length > 0 ? (
                                                pendingReports.map((report) => (
                                                    <MenuItem key={report._id} value={report._id}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {report.title}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {report.category} • {report.address} • Status: {report.status}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No pending reports available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Show selected report details */}
                                {selectedReport && (
                                    <Grid size={12}>
                                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            {(() => {
                                                const report = pendingReports.find(r => r._id === selectedReport);
                                                return report ? (
                                                    <>
                                                        <Typography variant="h6">{report.title}</Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Category:</strong> {report.category}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Address:</strong> {report.address}
                                                        </Typography>
                                                        {report.ward && (
                                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                                <strong>Ward:</strong> {report.ward}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Description:</strong> {report.description}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Priority:</strong> {report.priority}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Submitted:</strong> {new Date(report.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </>
                                                ) : null;
                                            })()}
                                        </Box>
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* New Task Creation */}
                        {assignmentType === 'new' && (
                            <>
                                <Grid size={12}>
                                    <TextField 
                                        fullWidth 
                                        label={t('Task Title')}
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                                        required
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField 
                                        fullWidth 
                                        multiline 
                                        rows={3} 
                                        label={t('Task Description')}
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('Priority')}</InputLabel>
                                        <Select 
                                            label={t('Priority')}
                                            value={taskForm.priority}
                                            onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                                        >
                                            <MenuItem value="high">{t('High')}</MenuItem>
                                            <MenuItem value="medium">{t('Medium')}</MenuItem>
                                            <MenuItem value="low">{t('Low')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField 
                                        fullWidth 
                                        label={t('Deadline')} 
                                        type="date" 
                                        InputLabelProps={{ shrink: true }}
                                        value={taskForm.deadline}
                                        onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setTaskAssignDialog({ open: false, staff: null });
                        setTaskForm({ title: '', description: '', priority: 'medium', deadline: '' });
                        setSelectedReport('');
                        setAssignmentType('existing');
                    }}>
                        {t('Cancel')}
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAssignTask}
                        disabled={assignmentType === 'existing' ? !selectedReport : (!taskForm.title || !taskForm.description)}
                    >
                        {assignmentType === 'existing' ? 'Assign Report' : t('Assign Task')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Staff Dialog */}
            <Dialog open={addStaffDialog} onClose={() => setAddStaffDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('addNewStaffMember')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label={t('full_name')}
                                value={staffForm.name}
                                onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label={t('email')}
                                type="email"
                                value={staffForm.email}
                                onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label={t('phone')}
                                value={staffForm.phone}
                                onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                                placeholder="Phone Number"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>{t('role')}</InputLabel>
                                <Select 
                                    label={t('role')}
                                    value={staffForm.role}
                                    onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
                                >
                                    <MenuItem value="field_staff">{t('fieldStaff')}</MenuItem>
                                    <MenuItem value="field_head">{t('fieldHead')}</MenuItem>
                                    <MenuItem value="department_head">{t('departmentHead')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select 
                                    label="Department"
                                    value={staffForm.department}
                                    onChange={(e) => setStaffForm({...staffForm, department: e.target.value})}
                                >
                                    <MenuItem value="Public Works">Public Works</MenuItem>
                                    <MenuItem value="Water Department">Water Department</MenuItem>
                                    <MenuItem value="Sanitation">Sanitation</MenuItem>
                                    <MenuItem value="Road Maintenance">Road Maintenance</MenuItem>
                                    <MenuItem value="Electricity">Electricity</MenuItem>
                                    <MenuItem value="Health & Safety">Health & Safety</MenuItem>
                                    <MenuItem value="Parks & Recreation">Parks & Recreation</MenuItem>
                                    <MenuItem value="Traffic Management">Traffic Management</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label="Ward"
                                value={staffForm.ward}
                                onChange={(e) => setStaffForm({...staffForm, ward: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAddStaffDialog(false);
                        setStaffForm({ name: '', email: '', phone: '', role: 'field_staff', department: '', ward: '' });
                    }}>
                        {t('cancel')}
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddStaff}
                        disabled={!staffForm.name || !staffForm.email || !staffForm.department}
                    >
                        {t('addStaffMember')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Emergency Alert Dialog */}
            <Dialog open={emergencyDialog} onClose={() => setEmergencyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Create Emergency Alert
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={12}>
                            <TextField fullWidth label="Alert Title" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Alert Type</InputLabel>
                                <Select label="Alert Type">
                                    <MenuItem value="water_outage">Water Outage</MenuItem>
                                    <MenuItem value="road_closure">Road Closure</MenuItem>
                                    <MenuItem value="disaster">Natural Disaster</MenuItem>
                                    <MenuItem value="health">Health Emergency</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select label="Severity">
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={3} label="Alert Description" />
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                control={<Switch />}
                                label="Send SMS to all citizens"
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                control={<Switch />}
                                label="Notify District Admin"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmergencyDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error">Create Alert</Button>
                </DialogActions>
            </Dialog>

            {/* Announcement Dialog */}
            <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create Public Announcement</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField fullWidth label="Announcement Title" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select label="Category">
                                    <MenuItem value="water">Water</MenuItem>
                                    <MenuItem value="roads">Roads</MenuItem>
                                    <MenuItem value="tax">Tax</MenuItem>
                                    <MenuItem value="festival">Festival</MenuItem>
                                    <MenuItem value="general">General</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={4} label="Announcement Content" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Target Audience</InputLabel>
                                <Select label="Target Audience">
                                    <MenuItem value="all">All Wards</MenuItem>
                                    <MenuItem value="ward1">Ward 1</MenuItem>
                                    <MenuItem value="ward2">Ward 2</MenuItem>
                                    <MenuItem value="ward3">Ward 3</MenuItem>
                                    <MenuItem value="ward4">Ward 4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Valid Until" type="date" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Publish on website"
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                control={<Switch />}
                                label="Send SMS notification"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
                    <Button variant="contained">Publish Announcement</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MunicipalDashboard;
