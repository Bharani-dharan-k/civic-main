import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  User,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ManageIssues = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });

  // Mock data
  const issues = [
    {
      id: 'CIV-2025-001',
      title: 'Broken streetlight on MG Road',
      description: 'The streetlight pole near the bus stop has been damaged and is not working for the past 3 days. This is causing safety concerns for pedestrians during nighttime.',
      category: 'Street Lighting',
      location: 'MG Road, Sector 14',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      status: 'Pending',
      priority: 'High',
      reportedBy: 'Rajesh Kumar',
      reportedAt: '2025-01-15T10:30:00Z',
      assignedTo: null,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    },
    {
      id: 'CIV-2025-002',
      title: 'Water leakage in pipeline',
      description: 'Major water leakage observed in the main supply pipeline causing waterlogging and wastage of water resources.',
      category: 'Water Supply',
      location: 'Vikas Nagar, Block A',
      coordinates: { lat: 28.6145, lng: 77.2095 },
      status: 'In Progress',
      priority: 'Critical',
      reportedBy: 'Priya Sharma',
      reportedAt: '2025-01-15T08:15:00Z',
      assignedTo: 'Water Department',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=200&fit=crop'
    },
    {
      id: 'CIV-2025-003',
      title: 'Garbage not collected for 3 days',
      description: 'Garbage collection has been skipped for the past 3 days in our area. The bins are overflowing and causing hygiene issues.',
      category: 'Sanitation',
      location: 'Green Park Extension',
      coordinates: { lat: 28.6120, lng: 77.2080 },
      status: 'Assigned',
      priority: 'Medium',
      reportedBy: 'Amit Singh',
      reportedAt: '2025-01-14T16:45:00Z',
      assignedTo: 'Sanitation Department',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&h=200&fit=crop'
    },
    {
      id: 'CIV-2025-004',
      title: 'Pothole on main highway',
      description: 'Large pothole on the main highway causing traffic issues and potential vehicle damage. Immediate repair needed.',
      category: 'Road Maintenance',
      location: 'NH-48, Mile 12',
      coordinates: { lat: 28.6100, lng: 77.2100 },
      status: 'Resolved',
      priority: 'High',
      reportedBy: 'Deepak Verma',
      reportedAt: '2025-01-13T12:00:00Z',
      assignedTo: 'PWD',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
    },
    {
      id: 'CIV-2025-005',
      title: 'Broken traffic signal',
      description: 'Traffic signal at the intersection is malfunctioning, causing traffic congestion during peak hours.',
      category: 'Traffic Management',
      location: 'Central Square Junction',
      coordinates: { lat: 28.6155, lng: 77.2075 },
      status: 'Pending',
      priority: 'High',
      reportedBy: 'Sunita Devi',
      reportedAt: '2025-01-15T07:20:00Z',
      assignedTo: null,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
    }
  ];

  const categories = ['Street Lighting', 'Water Supply', 'Sanitation', 'Road Maintenance', 'Traffic Management'];
  const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-100 text-red-700';
      case 'Assigned': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         issue.location.toLowerCase().includes(filters.search.toLowerCase()) ||
                         issue.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || issue.status === filters.status;
    const matchesCategory = filters.category === 'all' || issue.category === filters.category;
    const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleStatusUpdate = (issueId, newStatus) => {
    // In a real app, this would make an API call
    console.log(`Updating issue ${issueId} to status: ${newStatus}`);
  };

  const handleAssignDepartment = (issueId, department) => {
    // In a real app, this would make an API call
    console.log(`Assigning issue ${issueId} to: ${department}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Issues</h1>
          <p className="text-gray-600">View and manage all reported civic issues</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Showing {filteredIssues.length} of {issues.length} issues
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Issues Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIssues.map((issue, index) => (
                <motion.tr
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{issue.id}</p>
                          <p className="text-sm text-gray-600">{issue.title}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {issue.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{issue.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                      <span className="text-sm text-gray-600">{issue.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-green-100 text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Issue Details Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Issue Image */}
                {selectedIssue.image && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedIssue.image}
                      alt={selectedIssue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Issue Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Issue ID</label>
                    <p className="text-gray-900">{selectedIssue.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedIssue.priority)}`}></div>
                      <span>{selectedIssue.priority}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                    <p className="text-gray-900">{selectedIssue.category}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                  <p className="text-gray-900 font-semibold">{selectedIssue.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-700 leading-relaxed">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <div className="flex items-center space-x-1 text-gray-900">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedIssue.location}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Reported By</label>
                    <div className="flex items-center space-x-1 text-gray-900">
                      <User className="w-4 h-4" />
                      <span>{selectedIssue.reportedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusUpdate(selectedIssue.id, 'Assigned')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Assign Department</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedIssue.id, 'In Progress')}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Mark In Progress</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedIssue.id, 'Resolved')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageIssues;
