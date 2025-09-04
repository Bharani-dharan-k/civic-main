import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { LocationOn, Close } from '@mui/icons-material';

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center - Ranchi, Jharkhand (as mentioned in project context)
const center = {
    lat: 23.3441,
    lng: 85.3096,
};

const ReportMap = ({ reports = [], showHeatmap = false }) => {
    const [selectedReport, setSelectedReport] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "demo_key",
        libraries: showHeatmap ? ['visualization'] : []
    });

    const getMarkerIcon = (urgency) => {
        const colors = {
            high: '#f44336',
            medium: '#ff9800',
            low: '#4caf50'
        };
        
        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${colors[urgency] || '#2196f3'}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            `)}`,
            scaledSize: new window.google?.maps?.Size(32, 32) || { width: 32, height: 32 }
        };
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'primary';
        }
    };

    if (!isLoaded) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%" 
                bgcolor="grey.100"
            >
                <Typography>Loading Map...</Typography>
            </Box>
        );
    }

    // Mock implementation for when Google Maps API is not available
    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY === "demo_key" || !process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
        return (
            <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                height="100%" 
                bgcolor="grey.100"
                border="2px dashed"
                borderColor="grey.300"
                borderRadius={1}
                p={3}
            >
                <LocationOn sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    {showHeatmap ? 'Issue Density Heatmap' : 'Reports Map View'}
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                    {reports.length} {showHeatmap ? 'hotspots' : 'reports'} would be displayed here
                </Typography>
                {showHeatmap && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Red areas indicate high issue density
                    </Typography>
                )}
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
                    Add Google Maps API key to enable interactive map
                </Typography>
            </Box>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            options={{
                styles: showHeatmap ? [
                    {
                        featureType: "all",
                        elementType: "geometry.fill",
                        stylers: [{ saturation: -100 }, { lightness: 50 }]
                    }
                ] : undefined
            }}
        >
            {!showHeatmap && reports && reports.map((report, index) => (
                <Marker
                    key={report.id || index}
                    position={{
                        lat: report.location?.lat || report.lat || center.lat + (Math.random() - 0.5) * 0.01,
                        lng: report.location?.lng || report.lng || center.lng + (Math.random() - 0.5) * 0.01
                    }}
                    title={report.title}
                    icon={window.google?.maps ? getMarkerIcon(report.urgency) : undefined}
                    onClick={() => setSelectedReport(report)}
                />
            ))}

            {showHeatmap && reports && reports.map((point, index) => (
                <Marker
                    key={index}
                    position={{
                        lat: point.lat,
                        lng: point.lng
                    }}
                    icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="${Math.min(point.intensity, 10)}" fill="rgba(255,0,0,0.6)" stroke="rgba(255,0,0,0.8)" stroke-width="1"/>
                            </svg>
                        `)}`,
                        scaledSize: new window.google?.maps?.Size(20, 20) || { width: 20, height: 20 }
                    }}
                />
            ))}

            {selectedReport && (
                <InfoWindow
                    position={{
                        lat: selectedReport.location?.lat || selectedReport.lat,
                        lng: selectedReport.location?.lng || selectedReport.lng
                    }}
                    onCloseClick={() => setSelectedReport(null)}
                >
                    <Box sx={{ maxWidth: 250, p: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {selectedReport.title}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => setSelectedReport(null)}
                                sx={{ ml: 1 }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                        
                        <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                            <Chip 
                                label={selectedReport.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                            />
                            <Chip 
                                label={selectedReport.urgency} 
                                size="small" 
                                color={getUrgencyColor(selectedReport.urgency)}
                            />
                            <Chip 
                                label={selectedReport.status?.replace('_', ' ')} 
                                size="small" 
                                variant="outlined"
                            />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {selectedReport.address}
                        </Typography>
                        
                        {selectedReport.description && (
                            <Typography variant="body2">
                                {selectedReport.description}
                            </Typography>
                        )}
                        
                        {selectedReport.reporter && (
                            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                                Reporter: {selectedReport.reporter}
                            </Typography>
                        )}
                    </Box>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default React.memo(ReportMap);