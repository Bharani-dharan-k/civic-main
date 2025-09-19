import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Mail, Lock, Users } from 'lucide-react';
import AshokaChakra from '../../components/Common/AshokaChakra';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'super_admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const fillDemoCredentials = (roleType = 'super_admin') => {
    const demoCredentials = {
      super_admin: {
        email: 'bharani@gmail.com',
        password: 'bharani5544',
        role: 'super_admin'
      },
      district_admin: {
        email: 'district1@admin.com',
        password: 'district123',
        role: 'district_admin'
      },
      municipality_admin: {
        email: 'municipality1@admin.com',
        password: 'municipality123',
        role: 'municipality_admin'
      },
      department_head: {
        email: 'department1@admin.com',
        password: 'department123',
        role: 'department_head'
      }
    };
    setFormData(demoCredentials[roleType]);
    setErrors({}); // Clear any existing errors
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Use the real authentication with role
      const result = await login(formData.email, formData.password, 'admin', formData.role);
      
      if (result.success) {
        toast.success(`Welcome ${formData.role.replace('_', ' ')}!`);
        navigate('/admin/dashboard');
      } else {
        setErrors({ general: result.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white via-green-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header with Indian Flag Colors */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-blue-800"
          >
            <Shield className="w-12 h-12 text-blue-800" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-blue-800 to-green-600 bg-clip-text text-transparent mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-700 text-lg">Super Admin - Serving the Nation</p>
        </div>

        {/* Login Card with Indian Flag Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gradient-to-r from-orange-500 via-white to-green-500"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-800">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your admin email"
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-medium ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm"
                >
                  {errors.email}
                </motion.p>
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Role Selection Field */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Admin Role
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="district_admin">District Admin</option>
                  <option value="municipality_admin">Municipality Admin</option>
                  <option value="department_head">Department Head</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">
                Select your administrative role level
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 text-center font-medium">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('super_admin')}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-3 rounded-lg border border-red-200 transition-colors"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('district_admin')}
                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 font-medium py-2 px-3 rounded-lg border border-green-200 transition-colors"
                >
                  District Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('municipality_admin')}
                  className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium py-2 px-3 rounded-lg border border-purple-200 transition-colors"
                >
                  Municipality
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('department_head')}
                  className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium py-2 px-3 rounded-lg border border-orange-200 transition-colors"
                >
                  Department Head
                </button>
              </div>
            </div>

            {/* Submit Button with Indian Flag Gradient */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 via-white to-green-600 text-gray-900 py-4 rounded-xl font-bold text-lg hover:shadow-xl focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 border-2 border-blue-800"
              style={{
                background: isLoading
                  ? 'linear-gradient(135deg, #f97316 0%, #ffffff 50%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #f97316 0%, #ffffff 25%, #ffffff 75%, #16a34a 100%)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
                  <span className="text-blue-800 font-bold">Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6 text-blue-800" />
                  <span className="text-blue-800 font-bold">Access Admin Portal</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border-2 border-blue-200"
          >
            <p className="text-sm text-blue-800 font-bold mb-2">🇮🇳 Demo Credentials:</p>
            <p className="text-sm text-blue-700 font-medium">Email: admin@civic.gov.in</p>
            <p className="text-sm text-blue-700 font-medium">Password: admin123</p>
          </motion.div>
        </motion.div>

        {/* Footer with Ashoka Chakra */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center space-x-3 text-gray-700 text-lg font-medium">
            <AshokaChakra size={24} className="text-blue-800" />
            <span>SevaTrack Super Admin Portal</span>
            <AshokaChakra size={24} className="text-blue-800" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="text-orange-600 font-bold">सत्यमेव जयते</span> - Truth Alone Triumphs
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
