import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if scrolled enough to change header style
      setIsScrolled(currentScrollY > 50);

      // Hide/show header based on scroll direction
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or at the top - show header
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at the top - hide header
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    <>
      <style jsx>{`
        @keyframes chakra-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .chakra-rotate {
          animation: chakra-rotate 20s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .shadow-soft {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .shadow-strong {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .hindi-text {
          font-family: 'Devanagari Sangam MN', 'Noto Sans Devanagari', serif;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
        }

        .header-hide {
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.5s ease-in-out, opacity 0.3s ease-in-out;
        }

        .header-show {
          transform: translateY(0);
          opacity: 1;
          transition: transform 0.5s ease-in-out, opacity 0.3s ease-in-out;
        }
      `}</style>
      <div className="min-h-screen bg-white font-sans">
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
          {/* Simplified Navigation Header */}
          <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl shadow-lg ${
            isHeaderVisible ? 'header-show' : 'header-hide'
          } ${
            isScrolled
              ? 'bg-white/95 py-2'
              : 'bg-white/98 py-2'
          }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex justify-between items-center transition-all duration-500 ${
                isScrolled ? 'h-14' : 'h-16'
              }`}>
                {/* Logo Section */}
                <div className="flex items-center space-x-3 group cursor-pointer">
                  <div className="relative transform transition-all duration-300 group-hover:scale-105">
                    <img
                      src={logo}
                      alt="SEVA TRACK Logo"
                      className="relative w-10 h-10 rounded-xl shadow-lg border border-gray-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 via-blue-800 to-green-700 bg-clip-text text-transparent">
                      SevaTrack
                    </span>
                    <span className="text-xs text-gray-600 hindi-text">समुदायिक सेवा ट्रैकर</span>
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-blue-800 px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:bg-gray-50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Enhanced Hero Content - Centered */}
          <div className="text-center mt-20 pt-8">
            <h1 className="font-bold mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white drop-shadow-2xl animate-fade-in">
              Empowering Citizens,<br />
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">Strengthening Bharat</span>
            </h1>

            <div className="mb-12 text-center max-w-5xl mx-auto">
              <p className="mb-4 text-xl md:text-2xl text-white/95 font-light leading-relaxed drop-shadow-lg animate-slide-up">
                Report civic issues in real-time and track their resolution.
                Together, we can make our communities better, stronger, and more connected.
              </p>
              <p className="text-lg md:text-xl text-yellow-100/90 font-medium hindi-text drop-shadow-md">
                वास्तविक समय में नागरिक मुद्दों की रिपोर्ट करें और उनके समाधान को ट्रैक करें।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto mb-8">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto group bg-white/95 text-orange-600 px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm border-2 border-white/70 hover:bg-white hover:border-orange-200"
              >
                <PhotoCamera className="text-2xl group-hover:rotate-12 transition-transform" />
                <span>Report an Issue</span>
                <span className="text-sm font-normal">सूचना दें</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto border-3 border-white/90 text-white hover:bg-white hover:text-blue-800 px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm shadow-xl hover:shadow-2xl bg-white/15 hover:border-blue-200"
              >
                <Map className="text-2xl" />
                <span>View Dashboard</span>
                <span className="text-sm font-normal">डैशबोर्ड</span>
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/80 text-sm md:text-base">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80 text-sm md:text-base">Cities Connected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">1M+</div>
                <div className="text-white/80 text-sm md:text-base">Citizens Empowered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-32 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-green-300 to-green-400 rounded-full blur-2xl animate-pulse-slow animation-delay-200"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full blur-xl animate-pulse-slow animation-delay-400"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Section Header */}
          <div className="text-center mb-24">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <AshokaChakra size={80} className="text-blue-800 chakra-rotate" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-bounce-gentle"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-600 rounded-full animate-bounce-gentle animation-delay-200"></div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-600 via-blue-800 to-green-700 bg-clip-text text-transparent">
              Platform Features
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Everything you need to report, track, and resolve civic issues efficiently.
              Built for the digital India of tomorrow.
            </p>
            <p className="text-lg text-gray-500 hindi-text">
              डिजिटल भारत के कल के लिए निर्मित, कुशलतापूर्वक नागरिक मुद्दों की रिपोर्ट, ट्रैक और समाधान करने के लिए आपको जो कुछ भी चाहिए।
            </p>
          </div>
          
          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => {
              const gradientColors = [
                'from-orange-500 to-orange-600',
                'from-blue-600 to-blue-700',
                'from-green-600 to-green-700',
                'from-purple-600 to-purple-700'
              ];
              return (
                <div key={index} className="group animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="bg-white rounded-3xl p-8 h-full shadow-soft hover:shadow-strong transition-all duration-500 border border-gray-100 group-hover:-translate-y-4 group-hover:border-orange-200 relative overflow-hidden">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-3xl"></div>

                    <div className="text-center relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-8 bg-gradient-to-br ${gradientColors[index]} rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-4 border-white`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {feature.description}
                      </p>

                      {/* Progress indicator */}
                      <div className="mt-6 w-full bg-gray-100 rounded-full h-1">
                        <div className={`bg-gradient-to-r ${gradientColors[index]} h-1 rounded-full transition-all duration-700 group-hover:w-full`} style={{width: '30%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 py-32 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 via-white to-orange-500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <div className="text-center mb-24">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1 rounded-full">
                <div className="bg-white rounded-full p-4">
                  <AshokaChakra size={48} className="text-blue-800" />
                </div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-600 via-blue-800 to-green-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Four simple steps to report and resolve civic issues in your community
            </p>
            <p className="text-lg text-gray-500 hindi-text">
              आपके समुदाय में नागरिक मुद्दों की रिपोर्ट और समाधान के लिए चार सरल चरण
            </p>
          </div>
          
          {/* Enhanced Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {steps.map((step, index) => (
              <div key={index} className="text-center group animate-slide-up" style={{animationDelay: `${index * 150}ms`}}>
                <div className="relative mb-10">
                  {/* Main step circle */}
                  <div className={`w-28 h-28 mx-auto ${step.color} rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white relative z-10`}>
                    {step.icon}
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-800 to-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg z-20 border-3 border-white">
                    {index + 1}
                  </div>

                  {/* Decorative ring */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-2 border-dashed border-gray-300 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>

                  {/* Enhanced Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-14 left-full w-full z-0">
                      <div className="relative">
                        <div className="h-1 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-6 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto text-base mb-4">
                  {step.description}
                </p>

                {/* Progress indicator */}
                <div className="w-20 h-1 bg-gray-200 rounded-full mx-auto">
                  <div className={`${step.color} h-1 rounded-full transition-all duration-1000 group-hover:w-full`} style={{width: `${25 * (index + 1)}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Impact Benefits Section */}
      <section className="bg-gradient-to-br from-white via-blue-50/30 to-white py-32 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-orange-400 rounded-full blur-xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-green-400 rounded-full blur-xl animate-pulse-slow animation-delay-200"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400 rounded-full blur-2xl animate-pulse-slow animation-delay-400"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Section Header */}
          <div className="text-center mb-24">
            <div className="flex justify-center items-center mb-10">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full p-1">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <AshokaChakra size={48} className="text-blue-800" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-600 via-blue-800 to-green-700 bg-clip-text text-transparent">
              Community Impact
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Making a real difference in communities across India with measurable results
            </p>
            <p className="text-lg text-gray-500 hindi-text">
              मापने योग्य परिणामों के साथ पूरे भारत में समुदायों में वास्तविक बदलाव लाना
            </p>
          </div>
          
          {/* Enhanced Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {benefits.map((benefit, index) => {
              const bgColors = ['bg-orange-50', 'bg-blue-50', 'bg-green-50'];
              const borderColors = ['border-orange-200', 'border-blue-200', 'border-green-200'];
              return (
                <div key={index} className="text-center group animate-slide-up" style={{animationDelay: `${index * 200}ms`}}>
                  <div className={`p-10 rounded-3xl ${bgColors[index]} hover:bg-white border-2 ${borderColors[index]} hover:border-opacity-50 transition-all duration-500 h-full shadow-soft hover:shadow-strong group-hover:-translate-y-2 relative overflow-hidden`}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/50 to-transparent rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/30 to-transparent rounded-tr-3xl"></div>

                    <div className="relative z-10">
                      <div className="mb-10 flex justify-center">
                        <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-gray-100">
                          {benefit.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto mb-6">
                        {benefit.description}
                      </p>

                      {/* Achievement badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                        <span className="text-2xl mr-2">✓</span>
                        <span className="text-sm font-medium text-gray-600">Verified Impact</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="bg-gradient-to-br from-orange-500 via-white to-green-600 py-32 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-radial from-orange-400/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-green-400/30 to-transparent rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white/40 to-transparent rounded-full blur-2xl animate-pulse-slow animation-delay-400"></div>

        {/* Decorative flag stripes */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-green-600 via-white to-orange-500 opacity-60"></div>

        {/* Content overlay for better readability */}
        <div className="absolute inset-0 bg-white/15 backdrop-blur-sm"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Enhanced header with flag elements */}
            <div className="flex justify-center items-center mb-10">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-12 bg-orange-500 rounded-sm shadow-md"></div>
                  <div className="w-2 h-12 bg-white rounded-sm shadow-md border border-gray-200"></div>
                  <div className="w-2 h-12 bg-green-600 rounded-sm shadow-md"></div>
                </div>
                <AshokaChakra size={60} className="text-blue-800 animate-pulse-slow" />
                <div className="flex space-x-1">
                  <div className="w-2 h-12 bg-orange-500 rounded-sm shadow-md"></div>
                  <div className="w-2 h-12 bg-white rounded-sm shadow-md border border-gray-200"></div>
                  <div className="w-2 h-12 bg-green-600 rounded-sm shadow-md"></div>
                </div>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-600 via-blue-800 to-green-700 bg-clip-text text-transparent drop-shadow-sm">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-gray-800 leading-relaxed max-w-3xl mx-auto drop-shadow-sm font-medium">
              Join thousands of citizens already using our platform to build better communities
            </p>
            <p className="text-lg mb-12 text-gray-700 hindi-text leading-relaxed max-w-2xl mx-auto">
              बेहतर समुदाय बनाने के लिए हमारे प्लेटफॉर्म का उपयोग करने वाले हजारों नागरिकों के साथ जुड़ें
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center max-w-4xl mx-auto mb-12">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto group bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-16 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm border-2 border-orange-400/30 hover:border-orange-300"
              >
                <PhotoCamera className="text-2xl group-hover:rotate-12 transition-transform" />
                <div className="flex flex-col items-start">
                  <span>Start Reporting Issues</span>
                  <span className="text-sm font-normal opacity-90">समस्या की रिपोर्ट शुरू करें</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-white/95 border-3 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white px-16 py-5 rounded-2xl text-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl backdrop-blur-sm hover:shadow-2xl hover:border-blue-600"
              >
                <Map className="text-2xl" />
                <div className="flex flex-col items-start">
                  <span>Admin Dashboard</span>
                  <span className="text-sm font-normal opacity-70">प्रबंधन डैशबोर्ड</span>
                </div>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">100%</div>
                <div className="text-sm text-gray-600">Secure Platform</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">Free</div>
                <div className="text-sm text-gray-600">For All Citizens</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer Section */}
      <footer className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-green-600/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-green-500/20 to-transparent rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            {/* Enhanced Brand Section */}
            <div className="md:col-span-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-8">
                <div className="relative">
                  <AshokaChakra size={48} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold">SevaTrack</h3>
                  <p className="text-green-300 text-sm hindi-text">सेवा ट्रैक</p>
                </div>
              </div>
              <p className="text-green-100 leading-relaxed text-lg mb-6">
                Empowering citizens and strengthening communities through
                technology-driven civic engagement across India.
              </p>
              <p className="text-green-200 text-base hindi-text leading-relaxed">
                पूरे भारत में प्रौद्योगिकी-संचालित नागरिक जुड़ाव के माध्यम से नागरिकों को सशक्त बनाना और समुदायों को मजबूत बनाना।
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold mb-8 text-green-100 flex items-center justify-center md:justify-start">
                <span className="mr-2">🔗</span> Quick Links
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'About Us', path: '/about', hindi: 'हमारे बारे में' },
                  { label: 'Contact', path: '/contact', hindi: 'संपर्क' },
                  { label: 'Privacy Policy', path: '/privacy', hindi: 'गोपनीयता नीति' },
                  { label: 'Terms of Service', path: '/terms', hindi: 'सेवा की शर्तें' }
                ].map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="block w-full text-green-200 hover:text-white transition-all duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-green-600/30 group"
                  >
                    <div className="flex flex-col items-center md:items-start">
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      <span className="text-xs text-green-300 hindi-text">{link.hindi}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold mb-8 text-green-100 flex items-center justify-center md:justify-start">
                <span className="mr-2">📞</span> Contact Info
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start space-x-3 p-3 bg-green-600/20 rounded-lg">
                  <Email className="text-green-200 text-xl" />
                  <div>
                    <span className="text-green-100 text-lg block">support@civicconnect.gov.in</span>
                    <span className="text-green-300 text-sm">ईमेल समर्थन</span>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 p-3 bg-green-600/20 rounded-lg">
                  <Phone className="text-green-200 text-xl" />
                  <div>
                    <span className="text-green-100 text-lg block">1800-123-CIVIC</span>
                    <span className="text-green-300 text-sm">मुफ्त हेल्पलाइन</span>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 p-3 bg-green-600/20 rounded-lg">
                  <Language className="text-green-200 text-xl" />
                  <div>
                    <span className="text-green-100 text-lg block">Smart India Hackathon 2025</span>
                    <span className="text-green-300 text-sm">इनोवेशन पार्टनर</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer Bottom */}
          <div className="border-t-2 border-green-600 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-green-200 text-lg font-medium">
                  © 2025 Civic Engagement Platform. All rights reserved.
                </p>
                <p className="text-green-300 text-sm hindi-text mt-1">
                  सभी अधिकार सुरक्षित | भारत सरकार द्वारा प्रमाणित
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1 p-2 bg-white/10 rounded-lg">
                    <div className="w-10 h-6 bg-orange-500 rounded-sm shadow-lg"></div>
                    <div className="w-10 h-6 bg-white rounded-sm shadow-lg border border-gray-200"></div>
                    <div className="w-10 h-6 bg-green-600 rounded-sm shadow-lg"></div>
                  </div>
                  <div className="text-center">
                    <span className="text-green-200 font-bold text-lg block">Proudly Made in India</span>
                    <span className="text-green-300 text-sm hindi-text">गर्व से भारत में बना</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default IndiaFlagHomepage;
