import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Lock, ChevronDown, Languages } from 'lucide-react';
import AshokaChakra from '../components/Common/AshokaChakra';
import '../components/Common/GoogleTranslateStyles.css';

const FieldAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Google Translate script already exists
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript) {
      return;
    }

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement && !translateElement.hasChildNodes()) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,pa,or,as,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      // Clear the translate element
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement) {
        translateElement.innerHTML = '';
      }
    };
  }, []);

  const departments = [
    {
      id: 'pwd',
      name: 'Roads & Public Works (PWD)',
      description: 'Potholes, damaged pavements, broken dividers',
      icon: '🛣️'
    },
    {
      id: 'sanitation',
      name: 'Sanitation & Waste Management',
      description: 'Garbage overflow, illegal dumping, unclean streets',
      icon: '🗑️'
    },
    {
      id: 'lighting',
      name: 'Street Lighting & Electricity',
      description: 'Malfunctioning streetlights, exposed electric wires',
      icon: '💡'
    },
    {
      id: 'water',
      name: 'Water Supply & Drainage',
      description: 'Water leakages, pipeline bursts, open drains, sewage issues',
      icon: '🚰'
    },
    {
      id: 'others',
      name: 'Others',
      description: 'Other civic problems and issues',
      icon: '⚙️'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Login ID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Department-specific authentication
      const departmentCredentials = {
        pwd: { id: 'pwd001', password: 'pwd@2024' },
        sanitation: { id: 'san001', password: 'san@2024' },
        lighting: { id: 'light001', password: 'light@2024' },
        water: { id: 'water001', password: 'water@2024' },
        others: { id: 'other001', password: 'other@2024' }
      };

      const selectedDeptCreds = departmentCredentials[formData.department];

      if (selectedDeptCreds &&
          formData.email === selectedDeptCreds.id &&
          formData.password === selectedDeptCreds.password) {

        const departmentNames = {
          pwd: 'Roads & Public Works (PWD)',
          sanitation: 'Sanitation & Waste Management',
          lighting: 'Street Lighting & Electricity',
          water: 'Water Supply & Drainage',
          others: 'Others'
        };

        localStorage.setItem('fieldAdminToken', 'mock-field-jwt-token');
        localStorage.setItem('fieldAdminUser', JSON.stringify({
          name: `${departmentNames[formData.department]} Admin`,
          email: formData.email,
          role: 'Field Administrator',
          department: formData.department,
          departmentName: departmentNames[formData.department]
        }));
        navigate('/field-admin/dashboard');
      } else {
        setErrors({ general: 'Invalid credentials for selected department' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Google Translate */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-full flex items-center justify-center border-2 border-blue-800">
                <Shield className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Field Admin Portal</h1>
                <p className="text-sm text-gray-600">Government of India</p>
              </div>
            </div>

            {/* Right side - Language Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Language:</span>
                <div id="google_translate_element"></div>
              </div>
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border">🇮🇳 India</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          {/* Login Card Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-blue-800">
              <Shield className="w-10 h-10 text-blue-800" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Department Login</h2>
            <p className="text-gray-600">Access your field administration portal</p>
          </div>

        {/* Login Card with Indian Flag Theme */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Department Selection */}
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-bold text-gray-800">
                Select Department
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all appearance-none bg-white text-gray-800 font-medium ${
                    errors.department ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose your department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.icon} {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {formData.department && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 font-medium">
                    {departments.find(d => d.id === formData.department)?.description}
                  </p>
                </div>
              )}
              {errors.department && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Login ID Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-800">
                Department Login ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your department login ID"
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-medium ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-800">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-medium ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Access Department Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 font-semibold mb-3">Department Login Credentials:</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">PWD:</span>
                <span className="text-gray-600">pwd001 / pwd@2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Sanitation:</span>
                <span className="text-gray-600">san001 / san@2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Lighting:</span>
                <span className="text-gray-600">light001 / light@2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Water:</span>
                <span className="text-gray-600">water001 / water@2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Others:</span>
                <span className="text-gray-600">other001 / other@2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Ashoka Chakra */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-3 text-gray-700 text-sm font-medium">
            <AshokaChakra size={20} className="text-blue-600" />
            <span>SevaTrack Field Administration</span>
            <AshokaChakra size={20} className="text-blue-600" />
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <span className="text-orange-600 font-semibold">Truth Alone Triumphs</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAdminLogin;