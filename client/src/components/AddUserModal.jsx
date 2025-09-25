import React, { useState, useCallback, useEffect } from 'react';
import { UserPlus, X, User, Shield } from 'lucide-react';

const AddUserModal = ({
  showModal,
  onClose,
  onSubmit,
  isSubmitting,
  municipalityMapping = {},
  errors = {}
}) => {
  // Internal state management to prevent focus loss
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'district_admin',
    district: '',
    municipality: '',
    department: ''
  });

  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'district_admin',
        district: '',
        municipality: '',
        department: ''
      });
      setAvailableMunicipalities([]);
    }
  }, [showModal]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle district change
  const handleDistrictChange = useCallback((e) => {
    const selectedDistrict = e.target.value;
    setFormData(prev => ({ ...prev, district: selectedDistrict, municipality: '' }));

    // Update available municipalities
    if (selectedDistrict && municipalityMapping[selectedDistrict]) {
      setAvailableMunicipalities(municipalityMapping[selectedDistrict]);
    } else {
      setAvailableMunicipalities([]);
    }
  }, [municipalityMapping]);

  // Handle role change
  const handleRoleChange = useCallback((e) => {
    const selectedRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      district: '',
      municipality: '',
      department: ''
    }));
    setAvailableMunicipalities([]);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [onSubmit, formData]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header with Indian Flag Theme */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-6 rounded-t-2xl border-b-4 border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <UserPlus className="w-7 h-7 text-blue-800" />
                Add New Admin User
              </h3>
              <p className="text-gray-700 mt-1 text-lg">नया व्यवस्थापक उपयोगकर्ता जोड़ें</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 p-4 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Basic Information / बुनियादी जानकारी
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name / पूरा नाम *
                </label>
                <input
                  id="name-input"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  autoComplete="name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address / ईमेल पता *
                </label>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Password / पासवर्ड *
                </label>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter secure password (min 6 characters)"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
          </div>

          {/* Role and Jurisdiction Section */}
          <div className="bg-gradient-to-r from-green-50 via-white to-orange-50 p-4 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Role & Jurisdiction / भूमिका और क्षेत्राधिकार
            </h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Role / व्यवस्थापक भूमिका *
                </label>
                <select
                  id="role-select"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="district_admin">District Admin / जिला व्यवस्थापक</option>
                  <option value="municipality_admin">Municipality Admin / नगरपालिका व्यवस्थापक</option>
                  <option value="department_head">Department Head / विभाग प्रमुख</option>
                  <option value="state_admin">State Admin / राज्य व्यवस्थापक</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>

              {/* District Selection */}
              {['district_admin', 'municipality_admin', 'department_head'].includes(formData.role) && (
                <div>
                  <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-2">
                    District / जिला *
                  </label>
                  <select
                    id="district-select"
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.district ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select District / जिला चुनें</option>
                    {Object.keys(municipalityMapping).map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>
              )}

              {/* Municipality Selection */}
              {['municipality_admin', 'department_head'].includes(formData.role) && (
                <div>
                  <label htmlFor="municipality-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Municipality / नगरपालिका *
                  </label>
                  <select
                    id="municipality-select"
                    name="municipality"
                    value={formData.municipality}
                    onChange={(e) => handleInputChange('municipality', e.target.value)}
                    disabled={!formData.district || availableMunicipalities.length === 0}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.municipality ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      !formData.district || availableMunicipalities.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {!formData.district
                        ? 'Select District First / पहले जिला चुनें'
                        : availableMunicipalities.length === 0
                          ? 'No municipalities available / कोई नगरपालिका उपलब्ध नहीं'
                          : 'Select Municipality / नगरपालिका चुनें'
                      }
                    </option>
                    {availableMunicipalities.map(municipality => (
                      <option key={municipality} value={municipality}>
                        {municipality}
                      </option>
                    ))}
                  </select>
                  {!formData.district && (
                    <p className="text-gray-500 text-sm mt-1">
                      Please select a district first to see available municipalities
                    </p>
                  )}
                  {errors.municipality && <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>}
                </div>
              )}

              {/* Department Selection */}
              {formData.role === 'department_head' && (
                <div>
                  <label htmlFor="department-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Department / विभाग *
                  </label>
                  <select
                    id="department-select"
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department / विभाग चुनें</option>
                    <option value="public_works">Public Works / लोक निर्माण</option>
                    <option value="sanitation">Sanitation / स्वच्छता</option>
                    <option value="water_supply">Water Supply / जल आपूर्ति</option>
                    <option value="electricity">Electricity / बिजली</option>
                    <option value="roads_transport">Roads & Transport / सड़क और परिवहन</option>
                    <option value="health">Health / स्वास्थ्य</option>
                    <option value="education">Education / शिक्षा</option>
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel / रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Admin / व्यवस्थापक बनाएं
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;