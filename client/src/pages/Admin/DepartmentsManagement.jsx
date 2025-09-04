import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  Phone,
  Mail,
  X,
  Save,
  Lightbulb,
  Droplets,
  Wrench,
  Car,
  Recycle
} from 'lucide-react';

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Public Works Department',
      description: 'Responsible for road maintenance, construction, and infrastructure development',
      head: 'Rajesh Kumar',
      contact: '+91 98765 43210',
      email: 'pwd@civic.gov.in',
      activeIssues: 45,
      resolvedIssues: 234,
      icon: Wrench,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Sanitation Department',
      description: 'Manages waste collection, street cleaning, and public hygiene',
      head: 'Priya Sharma',
      contact: '+91 98765 43211',
      email: 'sanitation@civic.gov.in',
      activeIssues: 32,
      resolvedIssues: 198,
      icon: Recycle,
      color: 'green'
    },
    {
      id: 3,
      name: 'Street Lighting Department',
      description: 'Installation and maintenance of street lights and public illumination',
      head: 'Amit Singh',
      contact: '+91 98765 43212',
      email: 'lighting@civic.gov.in',
      activeIssues: 28,
      resolvedIssues: 156,
      icon: Lightbulb,
      color: 'yellow'
    },
    {
      id: 4,
      name: 'Water Supply Department',
      description: 'Water distribution, pipeline maintenance, and quality management',
      head: 'Deepak Verma',
      contact: '+91 98765 43213',
      email: 'water@civic.gov.in',
      activeIssues: 19,
      resolvedIssues: 178,
      icon: Droplets,
      color: 'cyan'
    },
    {
      id: 5,
      name: 'Transportation Department',
      description: 'Traffic management, public transport, and road safety',
      head: 'Sunita Devi',
      contact: '+91 98765 43214',
      email: 'transport@civic.gov.in',
      activeIssues: 15,
      resolvedIssues: 89,
      icon: Car,
      color: 'purple'
    }
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: '',
    contact: '',
    email: '',
    icon: 'Building2',
    color: 'blue'
  });

  const iconOptions = [
    { name: 'Building2', component: Building2 },
    { name: 'Wrench', component: Wrench },
    { name: 'Recycle', component: Recycle },
    { name: 'Lightbulb', component: Lightbulb },
    { name: 'Droplets', component: Droplets },
    { name: 'Car', component: Car }
  ];

  const colorOptions = [
    'blue', 'green', 'yellow', 'cyan', 'purple', 'red', 'orange', 'pink'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDepartment = () => {
    const newDepartment = {
      id: departments.length + 1,
      ...formData,
      activeIssues: 0,
      resolvedIssues: 0,
      icon: iconOptions.find(icon => icon.name === formData.icon)?.component || Building2
    };
    setDepartments(prev => [...prev, newDepartment]);
    setFormData({
      name: '',
      description: '',
      head: '',
      contact: '',
      email: '',
      icon: 'Building2',
      color: 'blue'
    });
    setIsAddModalOpen(false);
  };

  const handleEditDepartment = () => {
    setDepartments(prev =>
      prev.map(dept =>
        dept.id === selectedDepartment.id
          ? {
              ...dept,
              ...formData,
              icon: iconOptions.find(icon => icon.name === formData.icon)?.component || dept.icon
            }
          : dept
      )
    );
    setIsEditModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleDeleteDepartment = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    }
  };

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      head: department.head,
      contact: department.contact,
      email: department.email,
      icon: iconOptions.find(icon => icon.component === department.icon)?.name || 'Building2',
      color: department.color
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      head: '',
      contact: '',
      email: '',
      icon: 'Building2',
      color: 'blue'
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments Management</h1>
          <p className="text-gray-600">Manage civic departments and their responsibilities</p>
        </div>
        <motion.button
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 sm:mt-0 flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </motion.button>
      </motion.div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department, index) => (
          <motion.div
            key={department.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Department Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${department.color}-100`}>
                <department.icon className={`w-6 h-6 text-${department.color}-600`} />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(department)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600"
                  title="Edit Department"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(department.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-600"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Department Info */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{department.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{department.description}</p>

            {/* Department Head */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{department.head}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{department.contact}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{department.email}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{department.activeIssues}</p>
                <p className="text-xs text-gray-500">Active Issues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{department.resolvedIssues}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Add New Department</h2>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter department description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    name="head"
                    value={formData.head}
                    onChange={handleInputChange}
                    placeholder="Enter department head name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon.name} value={icon.name}>
                        {icon.name.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-full h-8 rounded-lg border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        } bg-${color}-500`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDepartment}
                    disabled={!formData.name}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Department</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Department Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Edit Department</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Same form fields as Add modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter department description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    name="head"
                    value={formData.head}
                    onChange={handleInputChange}
                    placeholder="Enter department head name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditDepartment}
                    disabled={!formData.name}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default DepartmentsManagement;
