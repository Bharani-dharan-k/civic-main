import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Eye, EyeOff, UserPlus, LogIn, Wrench, ChevronDown } from 'lucide-react';
import logo from "../assets/logo.png";
const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen', 'admin', or 'worker'
  const [isSignup, setIsSignup] = useState(false); // Only for citizen
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [citizenForm, setCitizenForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });

  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });

  const [workerForm, setWorkerForm] = useState({
    loginId: '',
    password: '',
    department: ''
  });

  const handleCitizenSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        // Handle citizen signup
        if (citizenForm.password !== citizenForm.confirmPassword) {
          alert('Passwords do not match!');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/citizen/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: citizenForm.fullName,
            email: citizenForm.email,
            password: citizenForm.password,
            phone: citizenForm.phone
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Account created successfully! You can now login.');
          setIsSignup(false);
          setCitizenForm({ 
            ...citizenForm, 
            password: '', 
            confirmPassword: '',
            fullName: '',
            phone: ''
          });
        } else {
          alert(data.msg || 'Registration failed');
        }
      } else {
        // Handle citizen login
        const response = await fetch('http://localhost:5000/api/auth/citizen/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: citizenForm.email,
            password: citizenForm.password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store token and user info
          localStorage.setItem('citizenToken', data.token);
          localStorage.setItem('citizenUser', JSON.stringify(data.user));
          alert(`Welcome back, ${data.user.name}!`);
          navigate('/citizen-dashboard');
        } else {
          alert(data.msg || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Citizen auth error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminForm.email,
          password: adminForm.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin token and user info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        alert(`Welcome, ${data.user.name}!`);
        navigate('/admin/dashboard');
      } else {
        alert(data.msg || 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Department-specific authentication
      const departmentCredentials = {
        pwd: { id: 'pwd001', password: 'pwd@2024' },
        sanitation: { id: 'san001', password: 'san@2024' },
        lighting: { id: 'light001', password: 'light@2024' },
        water: { id: 'water001', password: 'water@2024' },
        others: { id: 'other001', password: 'other@2024' }
      };

      const selectedDeptCreds = departmentCredentials[workerForm.department];

      if (selectedDeptCreds &&
          workerForm.loginId === selectedDeptCreds.id &&
          workerForm.password === selectedDeptCreds.password) {

        const departmentNames = {
          pwd: 'Roads & Public Works (PWD)',
          sanitation: 'Sanitation & Waste Management',
          lighting: 'Street Lighting & Electricity',
          water: 'Water Supply & Drainage',
          others: 'Others'
        };

        localStorage.setItem('fieldAdminToken', 'mock-field-jwt-token');
        localStorage.setItem('fieldAdminUser', JSON.stringify({
          name: `${departmentNames[workerForm.department]} Admin`,
          email: workerForm.loginId,
          role: 'Field Administrator',
          department: workerForm.department,
          departmentName: departmentNames[workerForm.department]
        }));

        alert(`Welcome to ${departmentNames[workerForm.department]}!`);
        navigate('/field-admin/dashboard');
      } else {
        alert('Invalid credentials for selected department');
      }
    } catch (error) {
      console.error('Field admin login error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4 relative">
      {/* Indian Flag Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Indian Flag Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <img
                src={logo}
                alt="SEVA TRACK Logo"
                className="w-12 h-12 object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg items-center justify-center text-white font-bold text-lg hidden"
                style={{ display: 'none' }}
              >
                ST
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SEVA TRACK</h1>
          <p className="text-gray-600">Choose your login type to continue</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-transparent bg-gradient-to-r from-orange-500/20 via-white to-green-600/20 bg-clip-border overflow-hidden"
          style={{
            background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #16a34a 100%) border-box'
          }}
        >
          {/* Tab Selector */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all duration-300 ${
                activeTab === 'citizen'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-b-2 border-blue-700'
                  : 'bg-gradient-to-r from-orange-50 to-green-50 text-gray-600 hover:from-orange-100 hover:to-green-100'
              }`}
            >
              <User className="inline-block w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Citizen</span>
              <span className="sm:hidden">Citizen</span>
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all duration-300 ${
                activeTab === 'worker'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-b-2 border-green-700'
                  : 'bg-gradient-to-r from-orange-50 to-green-50 text-gray-600 hover:from-orange-100 hover:to-green-100'
              }`}
            >
              <Wrench className="inline-block w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Field Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-b-2 border-orange-700'
                  : 'bg-gradient-to-r from-orange-50 to-green-50 text-gray-600 hover:from-orange-100 hover:to-green-100'
              }`}
            >
              <Shield className="inline-block w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'citizen' ? (
              <motion.div
                key="citizen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Citizen Login/Signup Toggle */}
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setIsSignup(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        !isSignup
                          ? 'bg-blue-100 text-blue-700 shadow-md'
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <LogIn className="inline-block w-4 h-4 mr-1" />
                      Login
                    </button>
                    <button
                      onClick={() => setIsSignup(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isSignup
                          ? 'bg-blue-100 text-blue-700 shadow-md'
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <UserPlus className="inline-block w-4 h-4 mr-1" />
                      Sign Up
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-center text-gray-800">
                    {isSignup ? 'Create Citizen Account' : 'Citizen Login'}
                  </h2>
                </div>

                <form onSubmit={handleCitizenSubmit} className="space-y-4">
                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={citizenForm.fullName}
                        onChange={(e) => setCitizenForm({...citizenForm, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={citizenForm.email}
                      onChange={(e) => setCitizenForm({...citizenForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={citizenForm.phone}
                        onChange={(e) => setCitizenForm({...citizenForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={citizenForm.password}
                        onChange={(e) => setCitizenForm({...citizenForm, password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={citizenForm.confirmPassword}
                          onChange={(e) => setCitizenForm({...citizenForm, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Login as Citizen')}
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'worker' ? (
              <motion.div
                key="worker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                    Field Admin Login
                  </h2>
                  <p className="text-sm text-center text-gray-600">
                    Department-based Field Administration
                  </p>
                </div>

                <form onSubmit={handleWorkerSubmit} className="space-y-4">
                  {/* Department Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Department
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={workerForm.department}
                        onChange={(e) => setWorkerForm({...workerForm, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                      >
                        <option value="">Choose your department...</option>
                        <option value="pwd">🛣️ Roads & Public Works (PWD)</option>
                        <option value="sanitation">🗑️ Sanitation & Waste Management</option>
                        <option value="lighting">💡 Street Lighting & Electricity</option>
                        <option value="water">🚰 Water Supply & Drainage</option>
                        <option value="others">⚙️ Others</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Login ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Login ID
                    </label>
                    <input
                      type="text"
                      required
                      value={workerForm.loginId}
                      onChange={(e) => setWorkerForm({...workerForm, loginId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter your department login ID"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={workerForm.password}
                        onChange={(e) => setWorkerForm({...workerForm, password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Department Info Display */}
                  {workerForm.department && (
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 font-medium mb-2">
                        🇮🇳 {workerForm.department === 'pwd' ? 'Roads & Public Works (PWD)' :
                        workerForm.department === 'sanitation' ? 'Sanitation & Waste Management' :
                        workerForm.department === 'lighting' ? 'Street Lighting & Electricity' :
                        workerForm.department === 'water' ? 'Water Supply & Drainage' :
                        'Others'} Department
                      </p>
                      <p className="text-xs text-gray-600">
                        Demo ID: {workerForm.department === 'pwd' ? 'pwd001' :
                        workerForm.department === 'sanitation' ? 'san001' :
                        workerForm.department === 'lighting' ? 'light001' :
                        workerForm.department === 'water' ? 'water001' :
                        'other001'} | Password: {workerForm.department}@2024
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Signing in...' : 'Login as Field Admin'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                    Admin Login
                  </h2>
                  <p className="text-sm text-center text-gray-600">
                    Administrative access only
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter admin email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter admin password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Signing in...' : 'Login as Admin'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
