import React, { useState, useEffect } from 'react';
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
  const [editingIssue, setEditingIssue] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch issues from backend
  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Transform backend reports to match the expected format
        const transformedIssues = data.reports.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          category: report.category,
          location: report.address || report.location,
          coordinates: report.coordinates || { lat: 0, lng: 0 },
          status: mapStatus(report.status),
          priority: report.priority || 'Medium',
          reportedBy: report.userId?.name || report.citizenName || 'Unknown Citizen',
          reportedAt: report.createdAt,
          assignedTo: report.assignedWorker ? getWorkerName(report.assignedWorker) : null,
          image: report.imageUrl || null
        }));
        setIssues(transformedIssues);
      } else {
        console.error('Failed to load issues:', data.message);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapStatus = (backendStatus) => {
    switch (backendStatus) {
      case 'submitted': return 'Pending';
      case 'acknowledged': return 'Assigned';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Resolved'; // or create a new status
      default: return 'Pending';
    }
  };

  // Get worker name from worker data
  const getWorkerName = (workerData) => {
    if (typeof workerData === 'string') return workerData;
    if (workerData && workerData.name) return workerData.name;
    if (workerData && workerData.employeeId) return `Worker ${workerData.employeeId}`;
    return 'Assigned Worker';
  };

  // Get categories and priorities from backend data
  const categories = [...new Set(issues.map(issue => issue.category).filter(Boolean))];
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

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const backendStatus = mapFrontendStatusToBackend(newStatus);
      const response = await fetch(`http://localhost:5000/api/admin/reports/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: backendStatus })
      });

      const data = await response.json();
      if (data.success) {
        loadIssues(); // Refresh the data
        alert('Status updated successfully!');
      } else {
        alert(`Failed to update status: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error occurred while updating status');
    }
  };

  const handleAssignDepartment = async (issueId, department) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/${issueId}/assign-department`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ department })
      });

      const data = await response.json();
      if (data.success) {
        loadIssues(); // Refresh the data
        alert('Department assigned successfully!');
      } else {
        alert(`Failed to assign department: ${data.message}`);
      }
    } catch (error) {
      console.error('Error assigning department:', error);
      alert('Network error occurred while assigning department');
    }
  };

  // Map frontend status to backend status
  const mapFrontendStatusToBackend = (frontendStatus) => {
    switch (frontendStatus) {
      case 'Pending': return 'submitted';
      case 'Assigned': return 'assigned';
      case 'In Progress': return 'in_progress';
      case 'Resolved': return 'resolved';
      default: return 'submitted';
    }
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        loadIssues(); // Refresh the data
        alert('Issue deleted successfully!');
      } else {
        alert(`Failed to delete issue: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Network error occurred while deleting issue');
    }
  };

  const handleUpdateIssue = async (updatedIssue) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/${updatedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title: updatedIssue.title,
          description: updatedIssue.description,
          category: updatedIssue.category,
          priority: updatedIssue.priority,
          status: mapFrontendStatusToBackend(updatedIssue.status),
          address: updatedIssue.location
        })
      });

      const data = await response.json();
      if (data.success) {
        loadIssues(); // Refresh the data
        setEditingIssue(null);
        alert('Issue updated successfully!');
      } else {
        alert(`Failed to update issue: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Network error occurred while updating issue');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

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
                        onClick={() => handleEditIssue(issue)}
                        className="p-1 rounded hover:bg-green-100 text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(issue.id)}
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

      {/* Edit Issue Modal */}
      <AnimatePresence>
        {editingIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Issue</h3>
                  <button
                    onClick={() => setEditingIssue(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateIssue(editingIssue);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingIssue.title}
                      onChange={(e) => setEditingIssue({...editingIssue, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingIssue.description}
                      onChange={(e) => setEditingIssue({...editingIssue, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editingIssue.category}
                        onChange={(e) => setEditingIssue({...editingIssue, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={editingIssue.priority}
                        onChange={(e) => setEditingIssue({...editingIssue, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingIssue.status}
                        onChange={(e) => setEditingIssue({...editingIssue, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editingIssue.location}
                        onChange={(e) => setEditingIssue({...editingIssue, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingIssue(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Update Issue
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageIssues;
