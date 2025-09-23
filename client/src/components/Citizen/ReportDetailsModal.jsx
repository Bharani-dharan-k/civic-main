import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, User, Tag, AlertCircle, Clock, MessageSquare, Star } from 'lucide-react';

const ReportDetailsModal = ({ isOpen, onClose, report, onAddComment, onSubmitFeedback }) => {
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'text-yellow-600 bg-yellow-100';
      case 'acknowledged': return 'text-blue-600 bg-blue-100';
      case 'assigned': return 'text-purple-600 bg-purple-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await onAddComment(report._id, comment.trim());
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.rating) return;
    
    setIsSubmittingFeedback(true);
    try {
      await onSubmitFeedback(report._id, feedback);
      setShowFeedback(false);
      setFeedback({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!isOpen || !report) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority?.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Main Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium capitalize">{report.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{report.address}</p>
                        {report.district && (
                          <p className="text-sm text-gray-600">
                            District: {report.district}
                            {report.urbanLocalBody && ` • ${report.urbanLocalBody}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium">{formatDate(report.createdAt)}</p>
                      </div>
                    </div>

                    {report.assignedTo && (
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Assigned To</p>
                          <p className="font-medium">{report.assignedTo}</p>
                          {report.assignedDepartment && (
                            <p className="text-sm text-gray-600">{report.assignedDepartment}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {report.estimatedResolutionTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Estimated Resolution</p>
                          <p className="font-medium">{report.estimatedResolutionTime} days</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Report Image */}
                {report.imageUrl && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Report Image</h4>
                    <img
                      src={report.imageUrl}
                      alt="Report"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Report Video */}
                {report.videoUrl && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Report Video</h4>
                    <video
                      src={report.videoUrl}
                      controls
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Progress Photos */}
                {report.workProgressPhotos && report.workProgressPhotos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Progress Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {report.workProgressPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.url}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Image */}
                {report.resolutionImageUrl && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Resolution Image</h4>
                    <img
                      src={report.resolutionImageUrl}
                      alt="Resolution"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {report.adminNotes && report.adminNotes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Admin Notes</h4>
                <div className="space-y-3">
                  {report.adminNotes.map((note, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-700">{note.note}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(note.addedAt)} by {note.addedBy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worker Notes */}
            {report.workerNotes && report.workerNotes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Worker Notes</h4>
                <div className="space-y-3">
                  {report.workerNotes.map((note, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <p className="text-gray-700">{note.note}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(note.addedAt)} by {note.addedBy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citizen Comments */}
            {report.citizenComments && report.citizenComments.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Comments</h4>
                <div className="space-y-3">
                  {report.citizenComments.map((comment, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-700">{comment.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(comment.addedAt)} by {comment.addedBy?.name || 'You'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Section for Resolved Reports */}
            {report.status === 'resolved' && !report.feedback && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">How was our service?</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  Your report has been resolved! Please share your feedback to help us improve our services.
                </p>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Provide Feedback
                </button>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedback && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Rate Our Service</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Satisfaction
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                          className={`p-2 rounded-full transition-colors ${
                            feedback.rating >= rating
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star className="w-6 h-6" fill={feedback.rating >= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={feedback.comment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!feedback.rating || isSubmittingFeedback}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Comment Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Add Comment
              </h4>
              <div className="space-y-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add a comment or ask a question about this report..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmittingComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Report ID: {report._id}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportDetailsModal;