import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  X,
  Upload,
  FileText,
  Clock,
  MapPin,
  Camera,
  AlertCircle,
  Save
} from 'lucide-react';
import AshokaChakra from '../Common/AshokaChakra';

const WorkCompletionForm = ({ issue, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    workDescription: '',
    timeSpent: '',
    materialsUsed: '',
    challenges: '',
    additionalNotes: '',
    beforePhotos: [],
    afterPhotos: [],
    completionDate: new Date().toISOString().split('T')[0],
    completionTime: new Date().toTimeString().slice(0, 5)
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (files, type) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please upload only images under 5MB.');
    }

    const fileUrls = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileUrls]
    }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    handleFileUpload(files, type);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const removeFile = (index, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.workDescription.trim()) {
      newErrors.workDescription = 'Work description is required';
    }

    if (!formData.timeSpent.trim()) {
      newErrors.timeSpent = 'Time spent is required';
    }

    if (formData.afterPhotos.length === 0) {
      newErrors.afterPhotos = 'At least one after photo is required as proof';
    }

    if (!formData.completionDate) {
      newErrors.completionDate = 'Completion date is required';
    }

    if (!formData.completionTime) {
      newErrors.completionTime = 'Completion time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const completionData = {
        issueId: issue._id,
        ...formData,
        submittedAt: new Date().toISOString(),
        submittedBy: JSON.parse(localStorage.getItem('fieldAdminUser'))
      };

      onSubmit(completionData);

      // Reset form
      setFormData({
        workDescription: '',
        timeSpent: '',
        materialsUsed: '',
        challenges: '',
        additionalNotes: '',
        beforePhotos: [],
        afterPhotos: [],
        completionDate: new Date().toISOString().split('T')[0],
        completionTime: new Date().toTimeString().slice(0, 5)
      });

    } catch (error) {
      console.error('Error submitting completion form:', error);
      alert('Failed to submit completion form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header with Indian Flag Theme */}
          <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-6 border-b-4 border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                  <AshokaChakra size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">Work Completion Form</h2>
                  <p className="text-blue-700">Issue #{issue._id.slice(-6)} - {issue.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-red-600" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Details Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">📍 Issue Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{issue.address}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      issue.priority === 'high' ? 'bg-red-100 text-red-700' :
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {issue.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Description:</span>
                    <span className="ml-2 text-gray-600">{issue.description}</span>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Work Performed Description *
                </label>
                <textarea
                  name="workDescription"
                  value={formData.workDescription}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe in detail what work was performed to resolve this issue..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all resize-none ${
                    errors.workDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.workDescription && (
                  <p className="text-red-500 text-sm font-medium">{errors.workDescription}</p>
                )}
              </div>

              {/* Time and Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time Spent *
                  </label>
                  <input
                    type="text"
                    name="timeSpent"
                    value={formData.timeSpent}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours 30 minutes"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all ${
                      errors.timeSpent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.timeSpent && (
                    <p className="text-red-500 text-sm font-medium">{errors.timeSpent}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all ${
                      errors.completionDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.completionDate && (
                    <p className="text-red-500 text-sm font-medium">{errors.completionDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Completion Time *
                  </label>
                  <input
                    type="time"
                    name="completionTime"
                    value={formData.completionTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all ${
                      errors.completionTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.completionTime && (
                    <p className="text-red-500 text-sm font-medium">{errors.completionTime}</p>
                  )}
                </div>
              </div>

              {/* Materials Used */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Materials/Tools Used
                </label>
                <textarea
                  name="materialsUsed"
                  value={formData.materialsUsed}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="List any materials, tools, or equipment used..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Challenges */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  <AlertCircle className="inline w-4 h-4 mr-1" />
                  Challenges Faced
                </label>
                <textarea
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Any challenges or difficulties encountered during the work..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Photo Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Photos */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800">
                    <Camera className="inline w-4 h-4 mr-1" />
                    Before Photos (Optional)
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragOver === 'beforePhotos'
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={(e) => handleDrop(e, 'beforePhotos')}
                    onDragOver={(e) => handleDragOver(e, 'beforePhotos')}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('beforePhotos').click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB per image
                    </p>
                  </div>
                  <input
                    type="file"
                    id="beforePhotos"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'beforePhotos')}
                    className="hidden"
                  />

                  {/* Before Photos Preview */}
                  {formData.beforePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.beforePhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.url}
                            alt={`Before ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'beforePhotos')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Photos */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800">
                    <Camera className="inline w-4 h-4 mr-1" />
                    After Photos (Required) *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragOver === 'afterPhotos'
                        ? 'border-green-400 bg-green-50'
                        : errors.afterPhotos
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={(e) => handleDrop(e, 'afterPhotos')}
                    onDragOver={(e) => handleDragOver(e, 'afterPhotos')}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('afterPhotos').click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB per image - Required for completion
                    </p>
                  </div>
                  <input
                    type="file"
                    id="afterPhotos"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'afterPhotos')}
                    className="hidden"
                  />

                  {errors.afterPhotos && (
                    <p className="text-red-500 text-sm font-medium">{errors.afterPhotos}</p>
                  )}

                  {/* After Photos Preview */}
                  {formData.afterPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.afterPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.url}
                            alt={`After ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'afterPhotos')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional information or recommendations..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark Work Complete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkCompletionForm;