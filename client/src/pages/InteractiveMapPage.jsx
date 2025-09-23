import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  Search,
  RefreshCw,
  Layers,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Target,
  Info,
  Eye,
  Calendar,
  Navigation,
  Globe
} from 'lucide-react';
import L from 'leaflet';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icons for different statuses
const createCustomIcon = (status, category) => {
  const colors = {
    submitted: '#f59e0b',
    acknowledged: '#3b82f6',
    assigned: '#8b5cf6',
    in_progress: '#f97316',
    resolved: '#10b981',
    rejected: '#ef4444',
    closed: '#6b7280'
  };

  const color = colors[status] || '#6b7280';
  
  // Special styling for completed (resolved) reports
  const isCompleted = status === 'resolved';
  const borderStyle = isCompleted ? '4px solid #059669' : '3px solid white';
  const shadowStyle = isCompleted ? '0 4px 8px rgba(16, 185, 129, 0.4)' : '0 2px 4px rgba(0,0,0,0.3)';
  const iconSymbol = isCompleted ? '✓' : category.charAt(0).toUpperCase();
  
  return new L.DivIcon({
    html: `
      <div style="
        width: ${isCompleted ? '28px' : '24px'}; 
        height: ${isCompleted ? '28px' : '24px'}; 
        border-radius: 50%; 
        background-color: ${color}; 
        border: ${borderStyle}; 
        box-shadow: ${shadowStyle};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isCompleted ? '14px' : '12px'};
        color: white;
        font-weight: bold;
        position: relative;
      ">
        ${iconSymbol}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [isCompleted ? 28 : 24, isCompleted ? 28 : 24],
    iconAnchor: [isCompleted ? 14 : 12, isCompleted ? 14 : 12],
  });
};

const InteractiveMapPage = ({ onBack }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    issueType: 'all',
    dateRange: 'all',
    district: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default to Bangalore

  // Issue type options
  const issueTypes = [
    'all',
    'pothole',
    'streetlight',
    'garbage',
    'drainage',
    'maintenance',
    'electrical',
    'plumbing',
    'cleaning',
    'other'
  ];

  const statusTypes = [
    'all',
    'submitted',
    'acknowledged',
    'assigned',
    'in_progress',
    'resolved',
    'rejected',
    'closed'
  ];

  // Jharkhand districts for filtering
  const jharkhandDistricts = [
    'all',
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum',
    'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara',
    'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu',
    'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ];

  // District coordinates for map centering
  const districtCoordinates = {
    'Ranchi': [23.3441, 85.3096],
    'Dhanbad': [23.7957, 86.4304],
    'Bokaro': [23.7871, 85.9568],
    'Jamshedpur': [22.8046, 86.2029], // East Singhbhum
    'Hazaribagh': [23.9926, 85.3547],
    'Giridih': [24.1854, 86.3000],
    'Deoghar': [24.4824, 86.7022],
    'Dumka': [24.2676, 87.2494],
    'Godda': [24.8502, 87.2142],
    'Sahibganj': [25.2511, 87.6422],
    'Pakur': [24.6340, 87.8492],
    'Palamu': [24.0413, 84.0746],
    'Garhwa': [24.1579, 83.8076],
    'Latehar': [23.7440, 84.4998],
    'Chatra': [24.2069, 84.8728],
    'Koderma': [24.4683, 85.5978],
    'Jamtara': [23.9622, 86.8023],
    'Gumla': [23.0433, 84.5422],
    'Simdega': [22.6173, 84.5126],
    'Lohardaga': [23.4324, 84.6806],
    'Khunti': [23.0715, 85.2786],
    'West Singhbhum': [22.5562, 85.0449],
    'Seraikela Kharsawan': [22.6929, 86.1506],
    'Ramgarh': [23.6302, 85.5226]
  };

  useEffect(() => {
    loadReports();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters, searchTerm]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      
      // Filter reports that have valid coordinates
      const validReports = response.filter(report => 
        report.location && 
        report.location.coordinates && 
        report.location.coordinates.length === 2 &&
        !isNaN(report.location.coordinates[0]) &&
        !isNaN(report.location.coordinates[1])
      );
      
      setReports(validReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Filter by issue type
    if (filters.issueType !== 'all') {
      filtered = filtered.filter(report => report.category === filters.issueType);
    }

    // Filter by district
    if (filters.district !== 'all') {
      filtered = filtered.filter(report => 
        report.district && report.district.toLowerCase() === filters.district.toLowerCase()
      );
    }

    // Filter by search term (including district search)
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.district && report.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.urbanLocalBody && report.urbanLocalBody.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(report => 
        new Date(report.createdAt) >= filterDate
      );
    }

    setFilteredReports(filtered);
  };

  const handleDistrictChange = (district) => {
    setFilters(prev => ({ ...prev, district }));
    
    // Center map on selected district
    if (district !== 'all' && districtCoordinates[district]) {
      setMapCenter(districtCoordinates[district]);
    } else if (district === 'all') {
      // Center on Jharkhand state center (roughly Ranchi)
      setMapCenter([23.3441, 85.3096]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">Interactive Map</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 text-sm px-3 py-1 rounded-full">
                <Layers className="w-4 h-4 mr-1" />
                {filteredReports.length} reports shown
              </div>
              
              {/* Completed Reports Counter */}
              <div className="flex items-center bg-green-100 text-sm px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-green-800">
                  {filteredReports.filter(r => r.status === 'resolved').length} completed
                </span>
              </div>
              
              <button
                onClick={loadReports}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Filters Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </h2>
            
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by description, address..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusTypes.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                value={filters.issueType}
                onChange={(e) => setFilters({...filters, issueType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {issueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {jharkhandDistricts.map(district => (
                  <option key={district} value={district}>
                    {district === 'all' ? 'All Districts' : district}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            {/* Quick Filter for Completed Reports */}
            <div className="mb-4">
              <button
                onClick={() => {
                  if (filters.status === 'resolved') {
                    setFilters(prev => ({ ...prev, status: 'all' }));
                  } else {
                    setFilters(prev => ({ ...prev, status: 'resolved' }));
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'resolved'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {filters.status === 'resolved' ? 'Hide' : 'Show Only'} Completed Reports
                  </span>
                </div>
              </button>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ status: 'all', issueType: 'all', dateRange: 'all', district: 'all' });
                setSearchTerm('');
                setMapCenter([23.3441, 85.3096]); // Reset to Jharkhand center
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All Filters
            </button>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Map Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Submitted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Acknowledged</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Assigned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {filteredReports.map((report) => (
              <Marker
                key={report._id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0]
                ]}
                icon={createCustomIcon(report.status, report.category)}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-3">
                    {/* Header with status indicator */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize flex items-center">
                          {report.category.replace('-', ' ')}
                          {report.status === 'resolved' && (
                            <CheckCircle className="w-4 h-4 ml-1 text-green-600" />
                          )}
                        </h3>
                        <h4 className="font-medium text-gray-800 capitalize text-sm">
                          {report.title}
                        </h4>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Special indicator for completed reports */}
                    {report.status === 'resolved' && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-sm font-medium text-green-800">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          ✅ Report Completed Successfully!
                        </div>
                        {report.resolvedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            Resolved on: {formatDate(report.resolvedAt)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {report.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-gray-500">
                      {/* Location Information */}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          <span className="font-medium">Location:</span>
                          <span className="ml-1">{report.address}</span>
                        </div>
                        
                        {/* District and Urban Local Body */}
                        {report.district && (
                          <div className="flex items-center">
                            <Globe className="w-3 h-3 mr-1 text-indigo-500" />
                            <span className="font-medium">District:</span>
                            <span className="ml-1 font-semibold text-indigo-700">{report.district}</span>
                            {report.urbanLocalBody && (
                              <span className="ml-1 text-gray-400">• {report.urbanLocalBody}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Time Information */}
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-orange-500" />
                        <span className="font-medium">Reported:</span>
                        <span className="ml-1">{formatDate(report.createdAt)}</span>
                      </div>

                      {/* Reporter Information */}
                      {report.reportedBy?.name && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1 text-purple-500" />
                          <span className="font-medium">Reported by:</span>
                          <span className="ml-1">{report.reportedBy.name}</span>
                        </div>
                      )}

                      {/* Priority Information */}
                      {report.priority && (
                        <div className="flex items-center">
                          <Target className="w-3 h-3 mr-1 text-red-500" />
                          <span className="font-medium">Priority:</span>
                          <span className={`ml-1 font-medium ${
                            report.priority.toLowerCase() === 'high' || report.priority.toLowerCase() === 'critical' 
                              ? 'text-red-600' 
                              : report.priority.toLowerCase() === 'medium' 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                          }`}>
                            {report.priority}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Report Image */}
                    {report.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Report Video */}
                    {report.videoUrl && (
                      <div className="mt-3">
                        <video
                          src={report.videoUrl}
                          controls
                          className="w-full h-24 object-cover rounded border"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Resolution Image for completed reports */}
                    {report.status === 'resolved' && report.resolutionImageUrl && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-green-700 mb-1">After Resolution:</div>
                        <img
                          src={report.resolutionImageUrl}
                          alt="Resolution"
                          className="w-full h-24 object-cover rounded border border-green-200"
                        />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more reports.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapPage;
