import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Search,
  Eye,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  ArrowUpDown
} from 'lucide-react';

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignDialog, setAssignDialog] = useState({ open: false, report: null });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Available workers for assignment (only logged-in workers)
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    loadReports();
    loadActiveWorkers();
  }, [filter, sortBy, sortOrder]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/reports`;
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        let sortedReports = [...data.reports];
        
        // Sort reports
        sortedReports.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          if (sortBy === 'createdAt' || sortBy === 'assignedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        setReports(sortedReports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveWorkers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/workers/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkers(data.workers);
        console.log('Loaded active workers:', data.workers);
      } else {
        console.error('Failed to load active workers:', data.message);
        // Fallback to empty array
        setWorkers([]);
      }
    } catch (error) {
      console.error('Error loading active workers:', error);
      // Fallback to empty array
      setWorkers([]);
    }
  };

  const handleAssignWorker = async (reportId, workerEmployeeId, priority = 'Medium', estimatedTime = 3, notes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Admin token available:', !!token);
      console.log('Assignment request data:', { reportId, workerEmployeeId, priority, estimatedTime, notes });
      
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workerEmployeeId,
          priority,
          estimatedTime,
          notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        loadReports(); // Refresh the reports list
        setAssignDialog({ open: false, report: null });
        alert(`Report assigned to worker successfully!`);
      } else {
        alert(`Failed to assign report: ${data.message}`);
      }
    } catch (error) {
      console.error('Error assigning report:', error);
      alert('Network error occurred while assigning report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'acknowledged': return <Eye className="w-4 h-4" />;
      case 'assigned': return <UserCheck className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkerByEmployeeId = (employeeId) => {
    return workers.find(w => w.employeeId === employeeId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
          <p className="text-gray-600">Manage and assign citizen reports to field workers</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Reports</div>
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Latest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">High Priority First</option>
              <option value="status-asc">Status A-Z</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-80 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reports found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(report.priority)}`}></div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {report.reportedBy?.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {report.address}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="capitalize">{report.category}</span>
                      </div>
                      {report.assignedTo && (
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          {getWorkerByEmployeeId(report.assignedTo)?.name || report.assignedTo}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {report.status !== 'resolved' && report.status !== 'rejected' && (
                      <button
                        onClick={() => setAssignDialog({ open: true, report })}
                        className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors flex items-center"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        {report.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      <span className="ml-1 capitalize">{selectedReport.status.replace('_', ' ')}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Priority: <span className="font-medium capitalize">{selectedReport.priority}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reporter Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedReport.reportedBy?.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedReport.reportedBy?.email || 'Not provided'}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedReport.reportedBy?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location & Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedReport.address}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(selectedReport.createdAt)}
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="capitalize">{selectedReport.category}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedReport.imageUrl && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Evidence Photo</h3>
                  <img 
                    src={selectedReport.imageUrl} 
                    alt="Report evidence" 
                    className="rounded-lg max-w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {selectedReport.assignedTo && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assigned Worker</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium">{getWorkerByEmployeeId(selectedReport.assignedTo)?.name || selectedReport.assignedTo}</div>
                    <div className="text-sm text-gray-600">{getWorkerByEmployeeId(selectedReport.assignedTo)?.specialization || 'General'}</div>
                    <div className="text-sm text-gray-500 mt-1">Assigned: {formatDate(selectedReport.assignedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Assignment Dialog */}
      {assignDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Assign to Worker</h2>
              <p className="text-gray-600 mt-1">{assignDialog.report?.title}</p>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAssignWorker(
                  assignDialog.report._id,
                  formData.get('worker'),
                  formData.get('priority'),
                  parseInt(formData.get('estimatedTime')),
                  formData.get('notes')
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Worker</label>
                {workers.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-center">
                    No workers available. Please check worker management.
                  </div>
                ) : (
                  <select
                    name="worker"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Choose a worker...</option>
                    {workers.map(worker => (
                      <option 
                        key={worker.employeeId} 
                        value={worker.employeeId}
                        disabled={!worker.isActive}
                        style={{
                          color: worker.isActive ? 'inherit' : '#999',
                          fontStyle: worker.isActive ? 'normal' : 'italic'
                        }}
                      >
                        {worker.employeeId} - {worker.name} - {worker.specialization} ({worker.status})
                      </option>
                    ))}
                  </select>
                )}
                {workers.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Active: {workers.filter(w => w.isActive).length} | 
                    Inactive: {workers.filter(w => !w.isActive).length} | 
                    Total: {workers.length}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  defaultValue={assignDialog.report?.priority || 'Medium'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (hours)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  defaultValue="3"
                  min="1"
                  max="48"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional instructions for the worker..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAssignDialog({ open: false, report: null })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={workers.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    workers.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  Assign Worker
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;