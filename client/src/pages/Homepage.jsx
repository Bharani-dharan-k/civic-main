import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Shield,
  Zap,
  Target,
  Heart,
  Flag,
  Award,
  Calendar,
  Clock,
  MessageSquare,
  Camera,
  Navigation,
  FileText,
  Activity,
  BarChart3
} from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    totalReports: 15847,
    resolvedReports: 11234,
    activeUsers: 8956,
    satisfactionRate: 92
  });

  // Enhanced testimonials with Indian names and contexts
  const testimonials = [
    {
      id: 1,
      name: "राजेश कुमार",
      location: "नई दिल्ली",
      rating: 5,
      text: "स्वच्छ भारत ऐप के माध्यम से मैंने अपने क्षेत्र की सड़क की समस्या की रिपोर्ट की। 3 दिन में ही समस्या हल हो गई। यह वास्तव में डिजिटल इंडिया की शक्ति है।",
      role: "स्थानीय निवासी",
      image: "👨‍💼"
    },
    {
      id: 2,
      name: "प्रिया शर्मा",
      location: "मुंबई",
      rating: 5,
      text: "बहुत ही उपयोगी ऐप है। स्ट्रीट लाइट की समस्या रिपोर्ट करने के 2 दिन बाद ही ठीक हो गई। अब मैं नियमित रूप से इसका उपयोग करती हूं।",
      role: "गृहिणी",
      image: "👩‍🏫"
    },
    {
      id: 3,
      name: "अमित पटेल",
      location: "अहमदाबाद",
      rating: 5,
      text: "AI चैटबॉट बहुत मददगार है। हिंदी में भी काम करता है। मेरी कचरा संग्रह की शिकायत तुरंत स्वीकार हुई और समाधान भी मिला।",
      role: "व्यापारी",
      image: "👨‍💻"
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: "AI सहायक",
      description: "24/7 उपलब्ध बुद्धिमान चैटबॉट आपकी हर समस्या का समाधान",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Camera,
      title: "फोटो अपलोड",
      description: "समस्या की तस्वीर लगाकर अपनी शिकायत को मजबूत बनाएं",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Navigation,
      title: "GPS ट्रैकिंग",
      description: "सटीक स्थान के साथ तुरंत समस्या की रिपोर्ट करें",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: BarChart3,
      title: "रियल-टाइम ट्रैकिंग",
      description: "अपनी शिकायत की स्थिति को लाइव देखें और अपडेट पाएं",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "समस्या रिपोर्ट करें",
      description: "आसान फॉर्म भरकर या AI चैटबॉट से बात करके अपनी समस्या बताएं",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      step: 2,
      title: "तुरंत पुष्टि",
      description: "आपकी शिकायत तुरंत स्वीकार होगी और ट्रैकिंग ID मिलेगी",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      step: 3,
      title: "विभाग को सौंपा जाना",
      description: "संबंधित विभाग को आपकी शिकायत भेजी जाएगी",
      icon: Users,
      color: "bg-orange-500"
    },
    {
      step: 4,
      title: "समाधान और अपडेट",
      description: "समस्या हल होने तक नियमित अपडेट और अंत में समाधान",
      icon: Star,
      color: "bg-purple-500"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animate stats on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalReports: 15847,
        resolvedReports: 11234,
        activeUsers: 8956,
        satisfactionRate: 92
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50">
      {/* Enhanced Hero Section with Indian Flag Theme */}
      <section className="relative overflow-hidden">
        {/* Indian Flag Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-500/20 via-white to-green-600/20"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* National Emblem */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <Flag className="w-10 h-10 text-saffron-600" />
                <div className="text-2xl font-bold text-gray-800">स्वच्छ भारत मिशन</div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-saffron-600 to-green-600 bg-clip-text text-transparent">
                  डिजिटल इंडिया
                </span>
                <br />
                नागरिक सेवा पोर्टल
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                आपकी आवाज़, आपका शहर, आपका भविष्य।
                AI तकनीक के साथ शहरी समस्याओं का तुरंत समाधान।
                एक बेहतर भारत बनाने में अपना योगदान दें।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/citizen-dashboard')}
                  className="bg-gradient-to-r from-saffron-500 to-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  <MessageSquare className="w-6 h-6" />
                  तुरंत शिकायत दर्ज करें
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="border-2 border-saffron-500 text-saffron-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-saffron-50 transition-all duration-300 flex items-center gap-3"
                >
                  <Activity className="w-6 h-6" />
                  स्थिति ट्रैक करें
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>सुरक्षित</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>तुरंत प्रतिक्रिया</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>नागरिक केंद्रित</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Interactive Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-saffron-600" />
                  लाइव आंकड़े
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                  >
                    <div className="text-3xl font-bold text-blue-600">{stats.totalReports.toLocaleString()}</div>
                    <div className="text-sm text-blue-700 mt-1">कुल शिकायतें</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
                  >
                    <div className="text-3xl font-bold text-green-600">{stats.resolvedReports.toLocaleString()}</div>
                    <div className="text-sm text-green-700 mt-1">हल हुई शिकायतें</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
                  >
                    <div className="text-3xl font-bold text-purple-600">{stats.activeUsers.toLocaleString()}</div>
                    <div className="text-sm text-purple-700 mt-1">सक्रिय नागरिक</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                    className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200"
                  >
                    <div className="text-3xl font-bold text-yellow-600">{stats.satisfactionRate}%</div>
                    <div className="text-sm text-yellow-700 mt-1">संतुष्टि दर</div>
                  </motion.div>
                </div>

                {/* Live Indicator */}
                <div className="flex items-center justify-center mt-6 gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">लाइव अपडेट</span>
                </div>
              </div>

              {/* Floating Achievement Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-saffron-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                🏆 #1 नागरिक सेवा ऐप
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
              <Target className="w-10 h-10 text-saffron-600" />
              मुख्य विशेषताएं
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              आधुनिक तकनीक के साथ नागरिक सेवाओं में क्रांति।
              AI, GPS और रियल-टाइम ट्रैकिंग के साथ।
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Process Section */}
      <section className="py-20 bg-gradient-to-br from-saffron-50 to-green-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
              <Clock className="w-10 h-10 text-green-600" />
              कैसे काम करता है
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              सिर्फ 4 आसान चरणों में अपनी समस्या का समाधान पाएं
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex items-center gap-8 mb-12 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mb-4 ${index % 2 === 1 ? 'ml-auto' : ''}`}>
                    {step.step}
                  </div>
                  <div className={index % 2 === 1 ? 'text-right' : ''}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                      {index % 2 === 1 && <step.icon className="w-6 h-6 text-gray-600" />}
                      {step.title}
                      {index % 2 === 0 && <step.icon className="w-6 h-6 text-gray-600" />}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block">
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
              <Star className="w-10 h-10 text-yellow-500" />
              नागरिकों की आवाज़
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              हजारों खुश नागरिक हमारी सेवा का उपयोग कर रहे हैं
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-saffron-50 to-green-50 rounded-2xl p-8 border border-saffron-200 shadow-lg"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{testimonials[currentTestimonial].image}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>

                <blockquote className="text-xl text-gray-800 text-center leading-relaxed mb-6 italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial ? 'bg-saffron-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-saffron-500 via-white to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              आज ही शुरू करें
            </h2>
            <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto">
              अपने शहर को बेहतर बनाने में योगदान दें।
              एक बेहतर भारत का सपना साकार करने में हमारे साथ जुड़ें।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/citizen-dashboard')}
                className="bg-white text-saffron-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                <Flag className="w-6 h-6" />
                अभी शुरू करें
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                सहायता: 1800-XXX-XXXX
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Flag className="w-8 h-8 text-saffron-500" />
                <h3 className="text-xl font-bold">स्वच्छ भारत मिशन</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                डिजिटल इंडिया के तहत नागरिक सेवाओं को बेहतर बनाने का अभियान।
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-saffron-500 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">त्वरित लिंक</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">शिकायत दर्ज करें</a></li>
                <li><a href="#" className="hover:text-white transition-colors">स्थिति ट्रैक करें</a></li>
                <li><a href="#" className="hover:text-white transition-colors">नागरिक सेवाएं</a></li>
                <li><a href="#" className="hover:text-white transition-colors">सहायता केंद्र</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">सेवाएं</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">सड़क और परिवहन</a></li>
                <li><a href="#" className="hover:text-white transition-colors">जल और स्वच्छता</a></li>
                <li><a href="#" className="hover:text-white transition-colors">विद्युत सेवाएं</a></li>
                <li><a href="#" className="hover:text-white transition-colors">स्वास्थ्य सेवाएं</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">संपर्क</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <span>1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <span>support@swachhbharat.gov.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>नई दिल्ली, भारत</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 स्वच्छ भारत मिशन। सभी अधिकार सुरक्षित।
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">गोपनीयता नीति</a>
              <a href="#" className="hover:text-white transition-colors">नियम और शर्तें</a>
              <a href="#" className="hover:text-white transition-colors">सहायता</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;