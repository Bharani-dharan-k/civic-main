import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    LinearProgress,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Route,
    DirectionsWalk,
    DirectionsCar,
    LocationOn,
    Schedule,
    Star,
    TrendingUp,
    Psychology,
    AutoFixHigh,
    Navigation,
    Timer,
    Battery20,
    Battery50,
    Battery80,
    BatteryFull,
    Whatshot,
    LocalGasStation
} from '@mui/icons-material';

const SmartTaskRouter = ({ tasks, currentLocation, user }) => {
    const [routeOptimization, setRouteOptimization] = useState(true);
    const [optimizedRoute, setOptimizedRoute] = useState([]);
    const [routeDialog, setRouteDialog] = useState(false);
    const [travelMode, setTravelMode] = useState('driving'); // walking, driving, cycling
    const [skillMatching, setSkillMatching] = useState(true);
    const [workloadBalance, setWorkloadBalance] = useState(75);
    const [weatherConsideration, setWeatherConsideration] = useState(true);
    const [trafficAware, setTrafficAware] = useState(true);
    const [estimatedCompletion, setEstimatedCompletion] = useState('');
    const [routeEfficiency, setRouteEfficiency] = useState(0);
    const [energyLevel, setEnergyLevel] = useState(85);

    // Mock user skills and preferences
    const userSkills = ['electrical', 'plumbing', 'maintenance', 'cleaning'];
    const userPreferences = {
        maxTasksPerDay: 8,
        preferredWorkingHours: { start: 8, end: 17 },
        breakFrequency: 120, // minutes
        skillLevel: 'intermediate'
    };

    useEffect(() => {
        if (routeOptimization && tasks.length > 0) {
            generateOptimizedRoute();
        }
    }, [tasks, routeOptimization, travelMode, skillMatching]);

    const generateOptimizedRoute = () => {
        let availableTasks = tasks.filter(task => 
            task.status === 'assigned' || task.status === 'in_progress'
        );

        // Skill-based filtering
        if (skillMatching) {
            availableTasks = availableTasks.filter(task => 
                userSkills.some(skill => 
                    task.category?.toLowerCase().includes(skill) ||
                    task.description?.toLowerCase().includes(skill)
                )
            );
        }

        // Priority weighting
        availableTasks = availableTasks.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        });

        // Distance optimization (simplified)
        if (currentLocation) {
            availableTasks = availableTasks.sort((a, b) => {
                const distanceA = calculateDistance(currentLocation, a.location);
                const distanceB = calculateDistance(currentLocation, b.location);
                return distanceA - distanceB;
            });
        }

        // Weather consideration
        if (weatherConsideration) {
            availableTasks = considerWeather(availableTasks);
        }

        // Workload balancing
        const maxTasks = Math.ceil(userPreferences.maxTasksPerDay * (workloadBalance / 100));
        availableTasks = availableTasks.slice(0, maxTasks);

        setOptimizedRoute(availableTasks);
        calculateRouteMetrics(availableTasks);
    };

    const calculateDistance = (loc1, loc2) => {
        if (!loc1 || !loc2) return 0;
        const R = 6371; // Earth's radius in km
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const considerWeather = (tasks) => {
        // Simulate weather consideration
        const weatherConditions = {
            temperature: 25,
            humidity: 60,
            precipitation: 0,
            windSpeed: 5
        };

        return tasks.map(task => ({
            ...task,
            weatherImpact: calculateWeatherImpact(task, weatherConditions),
            estimatedDuration: task.estimatedTime ? 
                adjustForWeather(task.estimatedTime, weatherConditions) : 
                task.estimatedTime
        }));
    };

    const calculateWeatherImpact = (task, weather) => {
        let impact = 'low';
        if (task.category === 'outdoor' && weather.precipitation > 50) {
            impact = 'high';
        } else if (weather.temperature > 35 || weather.temperature < 5) {
            impact = 'medium';
        }
        return impact;
    };

    const adjustForWeather = (duration, weather) => {
        const baseHours = parseFloat(duration.replace(/[^\d.]/g, ''));
        let multiplier = 1;
        
        if (weather.precipitation > 30) multiplier += 0.3;
        if (weather.temperature > 35) multiplier += 0.2;
        if (weather.windSpeed > 20) multiplier += 0.1;
        
        return `${(baseHours * multiplier).toFixed(1)} hours`;
    };

    const calculateRouteMetrics = (route) => {
        if (route.length === 0) return;

        let totalDistance = 0;
        let totalTime = 0;
        let currentLoc = currentLocation;

        route.forEach((task, index) => {
            if (currentLoc && task.location) {
                totalDistance += calculateDistance(currentLoc, task.location);
            }
            
            const taskDuration = parseFloat(task.estimatedTime?.replace(/[^\d.]/g, '') || '1');
            totalTime += taskDuration;
            
            currentLoc = task.location;
        });

        // Travel time estimation
        const avgSpeed = travelMode === 'walking' ? 5 : travelMode === 'cycling' ? 15 : 40; // km/h
        const travelTime = totalDistance / avgSpeed;
        totalTime += travelTime;

        // Efficiency calculation
        const efficiency = Math.min(100, Math.max(0, 100 - (totalDistance * 2) - (travelTime * 5)));
        setRouteEfficiency(efficiency);

        // Estimated completion time
        const completionTime = new Date();
        completionTime.setHours(completionTime.getHours() + totalTime);
        setEstimatedCompletion(completionTime.toLocaleTimeString());
    };

    const getTaskSkillMatch = (task) => {
        const matchingSkills = userSkills.filter(skill => 
            task.category?.toLowerCase().includes(skill) ||
            task.description?.toLowerCase().includes(skill)
        );
        return (matchingSkills.length / userSkills.length) * 100;
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <Whatshot color="error" />;
            case 'medium': return <TrendingUp color="warning" />;
            case 'low': return <Star color="success" />;
            default: return <Star color="default" />;
        }
    };

    const getTravelModeIcon = () => {
        switch (travelMode) {
            case 'walking': return <DirectionsWalk />;
            case 'cycling': return <DirectionsCar />; // Using car icon for simplicity
            case 'driving': return <DirectionsCar />;
            default: return <DirectionsCar />;
        }
    };

    const getEnergyIcon = () => {
        if (energyLevel > 80) return <BatteryFull color="success" />;
        if (energyLevel > 60) return <Battery80 color="primary" />;
        if (energyLevel > 40) return <Battery50 color="warning" />;
        return <Battery20 color="error" />;
    };

    const handleStartOptimizedRoute = () => {
        // Simulate starting the optimized route
        alert('Starting optimized route! Follow the suggested order for maximum efficiency.');
        setRouteDialog(false);
    };

    return (
        <Box>
            {/* Smart Routing Control Card */}
            <Card sx={{ mb: 2, bgcolor: 'gradient.main' }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            <AutoFixHigh sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Smart Task Routing
                        </Typography>
                        <Chip 
                            icon={getEnergyIcon()} 
                            label={`Energy: ${energyLevel}%`} 
                            color={energyLevel > 60 ? "success" : "warning"}
                            size="small"
                        />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={routeOptimization}
                                    onChange={(e) => setRouteOptimization(e.target.checked)}
                                />
                            }
                            label="Auto Optimization"
                        />
                        
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Travel Mode</InputLabel>
                            <Select
                                value={travelMode}
                                onChange={(e) => setTravelMode(e.target.value)}
                                startAdornment={getTravelModeIcon()}
                            >
                                <MenuItem value="walking">Walking</MenuItem>
                                <MenuItem value="cycling">Cycling</MenuItem>
                                <MenuItem value="driving">Driving</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Route Metrics */}
                    {optimizedRoute.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Route Efficiency: {routeEfficiency.toFixed(0)}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={routeEfficiency} 
                                color={routeEfficiency > 70 ? "success" : routeEfficiency > 50 ? "warning" : "error"}
                                sx={{ mb: 1 }}
                            />
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="textSecondary">
                                    <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                                    ETC: {estimatedCompletion}
                                </Typography>
                                
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Route />}
                                    onClick={() => setRouteDialog(true)}
                                >
                                    View Route ({optimizedRoute.length})
                                </Button>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* AI Recommendations */}
            {optimizedRoute.length > 0 && (
                <Alert 
                    severity="info" 
                    icon={<Psychology />}
                    sx={{ mb: 2 }}
                >
                    <Typography variant="subtitle2">AI Recommendation</Typography>
                    Based on your skills, location, and current workload, I suggest starting with the {optimizedRoute[0]?.category} task in {optimizedRoute[0]?.address.split(',')[0]}. This route optimizes for travel time and your expertise.
                </Alert>
            )}

            {/* Route Optimization Dialog */}
            <Dialog
                open={routeDialog}
                onClose={() => setRouteDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Route />
                        <Typography variant="h6">Optimized Task Route</Typography>
                        <Chip 
                            label={`${routeEfficiency.toFixed(0)}% Efficient`}
                            color={routeEfficiency > 70 ? "success" : "warning"}
                            size="small"
                        />
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    {/* Route Settings */}
                    <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom>
                            Optimization Settings
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={skillMatching}
                                        onChange={(e) => setSkillMatching(e.target.checked)}
                                    />
                                }
                                label="Skill Matching"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={weatherConsideration}
                                        onChange={(e) => setWeatherConsideration(e.target.checked)}
                                    />
                                }
                                label="Weather Aware"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={trafficAware}
                                        onChange={(e) => setTrafficAware(e.target.checked)}
                                    />
                                }
                                label="Traffic Aware"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="body2" gutterBottom>
                                Workload Balance: {workloadBalance}%
                            </Typography>
                            <Slider
                                value={workloadBalance}
                                onChange={(e, value) => setWorkloadBalance(value)}
                                min={50}
                                max={100}
                                marks={[
                                    { value: 50, label: 'Light' },
                                    { value: 75, label: 'Balanced' },
                                    { value: 100, label: 'Maximum' }
                                ]}
                            />
                        </Box>
                    </Box>

                    {/* Optimized Task List */}
                    <Typography variant="subtitle2" gutterBottom>
                        Suggested Task Order
                    </Typography>
                    
                    <List>
                        {optimizedRoute.map((task, index) => {
                            const skillMatch = getTaskSkillMatch(task);
                            return (
                                <ListItem 
                                    key={task.id}
                                    sx={{ 
                                        border: 1, 
                                        borderColor: 'divider', 
                                        borderRadius: 1, 
                                        mb: 1,
                                        bgcolor: index === 0 ? 'action.selected' : 'background.paper'
                                    }}
                                >
                                    <ListItemIcon>
                                        <Badge
                                            badgeContent={index + 1}
                                            color="primary"
                                        >
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                {getPriorityIcon(task.priority)}
                                            </Avatar>
                                        </Badge>
                                    </ListItemIcon>
                                    
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle2">
                                                    {task.title}
                                                </Typography>
                                                <Chip 
                                                    label={task.priority} 
                                                    size="small" 
                                                    color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                                                />
                                                {skillMatch > 70 && (
                                                    <Chip 
                                                        label={`${skillMatch.toFixed(0)}% Match`} 
                                                        size="small" 
                                                        color="info"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                                    {task.address}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Est. Time: {task.estimatedDuration || task.estimatedTime}
                                                </Typography>
                                                {task.weatherImpact && task.weatherImpact !== 'low' && (
                                                    <Chip 
                                                        label={`Weather Impact: ${task.weatherImpact}`}
                                                        size="small"
                                                        color={task.weatherImpact === 'high' ? 'warning' : 'info'}
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                    
                                    <Box>
                                        <Tooltip title="Navigate">
                                            <IconButton
                                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${task.location?.lat},${task.location?.lng}`)}
                                            >
                                                <Navigation />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setRouteDialog(false)}>
                        Close
                    </Button>
                    <Button onClick={generateOptimizedRoute} variant="outlined">
                        Re-optimize
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleStartOptimizedRoute}
                        startIcon={<Route />}
                    >
                        Start Route
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SmartTaskRouter;