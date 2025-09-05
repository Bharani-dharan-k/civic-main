import React from 'react';
import { Button, Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  PhotoCamera,
  Map,
  Assignment,
  Notifications,
  Speed,
  Visibility,
  Group,
  LocationOn,
  CloudUpload,
  Build,
  CheckCircle,
  Phone,
  Email,
  Language
} from '@mui/icons-material';
import AshokaChakra from '../components/Common/AshokaChakra';
import logo from "../assets/logo.png";
const IndiaFlagHomepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PhotoCamera className="text-2xl" />,
      title: "Real-time Reporting",
      description: "Capture issues with photos and GPS location for precise reporting"
    },
    {
      icon: <Map className="text-2xl" />,
      title: "Interactive Map",
      description: "View all civic issues on a live map with real-time status updates"
    },
    {
      icon: <Assignment className="text-2xl" />,
      title: "Smart Routing",
      description: "Automated routing to the appropriate municipal department"
    },
    {
      icon: <Notifications className="text-2xl" />,
      title: "Progress Tracking",
      description: "Get notifications on issue status and resolution updates"
    }
  ];

  const steps = [
    {
      icon: <LocationOn className="text-4xl" />,
      title: "Capture Issue",
      description: "Take a photo and add location details of the civic issue",
      color: "bg-orange-500"
    },
    {
      icon: <CloudUpload className="text-4xl" />,
      title: "Submit Report", 
      description: "Upload via our mobile-friendly platform with one click",
      color: "bg-blue-800"
    },
    {
      icon: <Build className="text-4xl" />,
      title: "Municipality Acts",
      description: "Issue gets routed to the right department for resolution",
      color: "bg-orange-500"
    },
    {
      icon: <CheckCircle className="text-4xl" />,
      title: "Get Notified",
      description: "Receive updates when your issue is resolved",
      color: "bg-green-700"
    }
  ];

  const benefits = [
    {
      icon: <Speed className="text-4xl text-orange-500" />,
      title: "Faster Response Times",
      description: "Issues get resolved 60% faster with direct routing"
    },
    {
      icon: <Visibility className="text-4xl text-blue-800" />,
      title: "Greater Transparency", 
      description: "Track every step of the resolution process"
    },
    {
      icon: <Group className="text-4xl text-green-700" />,
      title: "Engaged Communities",
      description: "Citizens actively participate in improving their neighborhoods"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Saffron Header/Hero Section */}
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Indian Flag Gradient Background - Seamless Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-orange-500 to-white"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-green-600"></div>
        
        {/* Depth Elements - Soft Radial Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-orange-300/40 via-orange-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-green-400/40 via-green-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-white/30 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-radial from-blue-800/25 to-transparent rounded-full blur-2xl"></div>
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/15"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Navigation */}
          <nav className="absolute top-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={logo} 
                    alt="SEVA TRACK Logo" 
                    className="w-10 h-10 rounded-lg shadow-sm" 
                  />
                  <span className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    SevaTrack
                  </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-white hover:text-orange-200 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:bg-white/10 backdrop-blur-sm"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ml-3"
                  >
                    Report Issue
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button className="text-white hover:text-orange-200 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Content - Centered */}
          <div className="text-center flex flex-col justify-center min-h-screen">
            <h1 className="font-bold mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white drop-shadow-2xl">
              Empowering Citizens,<br />
              <span className="text-yellow-100 drop-shadow-lg">Strengthening Communities</span>
            </h1>
            
            <p className="mb-12 text-xl md:text-2xl text-white/95 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-lg">
              Report civic issues in real-time and track their resolution. 
              Together, we can make our communities better, stronger, and more connected.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto group bg-white/95 text-orange-500 px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm border border-white/50 hover:bg-white"
              >
                <PhotoCamera className="text-2xl group-hover:rotate-12 transition-transform" />
                <span>Report an Issue</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto border-2 border-white/80 text-white hover:bg-white hover:text-orange-500 px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm shadow-lg hover:shadow-xl bg-white/10"
              >
                <Map className="text-2xl" />
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* White Center Section with Clean Features */}
      <section className="bg-white py-24 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
              <AshokaChakra size={60} className="text-blue-800" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to report, track, and resolve civic issues efficiently.
              Built for the digital India of tomorrow.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 h-full shadow-soft hover:shadow-strong transition-all duration-300 border border-gray-100 group-hover:-translate-y-2 group-hover:border-orange-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-saffron group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Four simple steps to report and resolve civic issues in your community
            </p>
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-24 h-24 mx-auto ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                    {index + 1}
                  </div>
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 z-0"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Benefits Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Community Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Making a real difference in communities across India with measurable results
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 h-full">
                  <div className="mb-8 flex justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Clean Design */}
      <section className="bg-gradient-to-r from-orange-500 via-white to-green-600 py-24 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-orange-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-radial from-green-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-radial from-white/30 to-transparent rounded-full blur-2xl"></div>
        
        {/* Content overlay for better readability */}
        <div className="absolute inset-0 bg-white/10"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <AshokaChakra size={50} className="text-blue-800" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800 drop-shadow-sm">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-12 text-gray-700 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
              Join thousands of citizens already using our platform to build better communities
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm border border-orange-400/20"
              >
                <PhotoCamera className="text-2xl group-hover:rotate-12 transition-transform" />
                <span>Start Reporting Issues</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-white/90 border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg backdrop-blur-sm hover:shadow-xl"
              >
                <Map className="text-2xl" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Green Footer Section */}
      <footer className="bg-gradient-to-r from-green-700 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <AshokaChakra size={40} className="filter brightness-0 invert opacity-90" />
                <h3 className="text-2xl font-bold">SevaTrack</h3>
              </div>
              <p className="text-green-100 leading-relaxed text-lg">
                Empowering citizens and strengthening communities through 
                technology-driven civic engagement across India.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-xl font-bold mb-6 text-green-100">Quick Links</h4>
              <div className="space-y-4">
                {[
                  { label: 'About Us', path: '/about' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Privacy Policy', path: '/privacy' },
                  { label: 'Terms of Service', path: '/terms' }
                ].map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="block w-full text-green-200 hover:text-white transition-colors duration-200 font-medium text-lg py-1"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-6 text-green-100">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Email className="text-green-200 text-xl" />
                  <span className="text-green-100 text-lg">support@civicconnect.gov.in</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Phone className="text-green-200 text-xl" />
                  <span className="text-green-100 text-lg">1800-123-CIVIC</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <Language className="text-green-200 text-xl" />
                  <span className="text-green-100 text-lg">Smart India Hackathon 2025</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-green-600 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-green-200 text-center md:text-left">
                © 2025 Civic Engagement Platform. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  <div className="w-8 h-5 bg-orange-500 rounded-sm shadow-sm"></div>
                  <div className="w-8 h-5 bg-white rounded-sm shadow-sm"></div>
                  <div className="w-8 h-5 bg-green-600 rounded-sm shadow-sm"></div>
                </div>
                <span className="text-green-200 font-medium">Proudly Made in India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndiaFlagHomepage;
