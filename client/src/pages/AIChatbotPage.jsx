import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  Bot, 
  User, 
  Camera, 
  MapPin, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mic,
  MicOff,
  Image,
  X,
  MessageSquare
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';

const AIChatbotPage = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [reportData, setReportData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [recognition, setRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      speechRecognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(speechRecognition);
    }
  }, []);

  useEffect(() => {
    // Welcome message
    const welcomeMessage = {
      id: `msg-${Date.now()}-welcome`,
      type: 'bot',
      content: "Hello! I'm your civic assistant. I can help you:",
      options: [
        { text: "Report a new civic issue", action: "start_report" },
        { text: "Check status of my reports", action: "check_status" },
        { text: "Get area statistics", action: "area_stats" },
        { text: "General help", action: "help" }
      ],
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type, content, options = null) => {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Truly unique ID
      type,
      content,
      options,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Add user message
    addMessage('user', message);
    setInputMessage('');

    // Process the message
    await processUserMessage(message);
  };

  const processUserMessage = async (message) => {
    simulateTyping(() => {
      if (currentFlow === null) {
        handleMainMenu(message);
      } else if (currentFlow === 'report') {
        handleReportFlow(message);
      } else if (currentFlow === 'status_check') {
        handleStatusCheck(message);
      } else if (currentFlow === 'area_stats') {
        handleAreaStats(message);
      }
    });
  };

  const handleMainMenu = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('report') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      startReportFlow();
    } else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
      startStatusCheck();
    } else if (lowerMessage.includes('statistics') || lowerMessage.includes('stats') || lowerMessage.includes('area')) {
      startAreaStats();
    } else if (lowerMessage.includes('help')) {
      showHelp();
    } else {
      addMessage('bot', "I didn't understand that. Please choose one of the options below:", [
        { text: "Report a new civic issue", action: "start_report" },
        { text: "Check status of my reports", action: "check_status" },
        { text: "Get area statistics", action: "area_stats" },
        { text: "General help", action: "help" }
      ]);
    }
  };

  const startReportFlow = () => {
    setCurrentFlow('report');
    setReportData({});
    addMessage('bot', "I'll help you report a civic issue. First, what type of issue are you reporting?", [
      { text: "Pothole", action: "select_type", value: "pothole" },
      { text: "Street Light", action: "select_type", value: "streetlight" },
      { text: "Garbage Collection", action: "select_type", value: "garbage" },
      { text: "Drainage Problem", action: "select_type", value: "drainage" },
      { text: "Maintenance Issue", action: "select_type", value: "maintenance" },
      { text: "Electrical Problem", action: "select_type", value: "electrical" },
      { text: "Plumbing Issue", action: "select_type", value: "plumbing" },
      { text: "Cleaning Required", action: "select_type", value: "cleaning" },
      { text: "Other", action: "select_type", value: "other" }
    ]);
  };

  const handleReportFlow = async (message) => {
    if (!reportData.issueType) {
      // User should select issue type from options
      return;
    }
    
    if (!reportData.description) {
      setReportData(prev => ({ ...prev, description: message }));
      addMessage('bot', "Thank you! Now please provide the location where this issue is present. You can type the address or describe the location:");
      return;
    }
    
    if (!reportData.address) {
      setReportData(prev => ({ ...prev, address: message }));
      addMessage('bot', "Perfect! Would you like to add a photo to help us better understand the issue?", [
        { text: "Yes, upload photo", action: "upload_photo" },
        { text: "No, submit without photo", action: "submit_report" }
      ]);
      return;
    }
  };

  const handleOptionClick = async (action, value) => {
    if (action === 'start_report') {
      startReportFlow();
    } else if (action === 'check_status') {
      startStatusCheck();
    } else if (action === 'area_stats') {
      startAreaStats();
    } else if (action === 'help') {
      showHelp();
    } else if (action === 'select_type') {
      setReportData(prev => ({ ...prev, issueType: value }));
      addMessage('user', value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' '));
      simulateTyping(() => {
        addMessage('bot', `You've selected "${value.replace('-', ' ')}". Please describe the issue in detail:`);
      });
    } else if (action === 'upload_photo') {
      addMessage('user', 'Yes, upload photo');
      fileInputRef.current?.click();
    } else if (action === 'submit_report') {
      addMessage('user', 'No, submit without photo');
      await submitReport();
    } else if (action === 'new_conversation') {
      startNewConversation();
    }
  };

  const submitReport = async () => {
    simulateTyping(async () => {
      try {
        // Validate that we have all required data
        if (!reportData.issueType || !reportData.description || !reportData.address) {
          addMessage('bot', "❌ I need more information to submit your report. Please provide the issue type, description, and address.");
          return;
        }

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Get user's location if available, otherwise use default coordinates
        const getCoordinates = () => {
          return new Promise((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  resolve([position.coords.longitude, position.coords.latitude]);
                },
                (error) => {
                  console.log('Location access denied, using default coordinates');
                  resolve([77.5946, 12.9716]); // Default to Bangalore coordinates
                }
              );
            } else {
              resolve([77.5946, 12.9716]); // Default coordinates
            }
          });
        };

        const coordinates = await getCoordinates();
        
        const reportPayload = {
          title: `${(reportData.issueType || 'civic').replace('-', ' ')} issue`,
          category: reportData.issueType || 'other',
          description: reportData.description,
          address: reportData.address,
          location: {
            type: 'Point',
            coordinates: coordinates
          },
          imageUrl: selectedImage || 'https://via.placeholder.com/400x300?text=No+Image'
        };

        console.log('Submitting report:', reportPayload);
        const response = await reportService.submitReport(reportPayload);
        
        if (response) {
          addMessage('bot', `✅ Your report has been submitted successfully! 

📋 **Report ID:** ${response.report?._id || 'Generated'}
📅 **Date:** ${new Date().toLocaleDateString()}
🔄 **Status:** Submitted

You can track the progress of your report anytime by asking me to check your report status.

Is there anything else I can help you with?`, [
            { text: "Report another issue", action: "start_report" },
            { text: "Check report status", action: "check_status" },
            { text: "Start new conversation", action: "new_conversation" }
          ]);
          
          setCurrentFlow(null);
          setReportData({});
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Report submission error:', error);
        const errorMessage = error.error || error.message || 'Unknown error occurred';
        addMessage('bot', `❌ Sorry, there was an error submitting your report: ${errorMessage}. Please try again later or contact support.`);
      }
    }, 1500);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        addMessage('user', 'Photo uploaded');
        simulateTyping(async () => {
          addMessage('bot', "Great! I've received your photo. Your report is ready to submit:", [
            { text: "Submit Report", action: "submit_report" },
            { text: "Cancel", action: "new_conversation" }
          ]);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startStatusCheck = () => {
    setCurrentFlow('status_check');
    addMessage('bot', "I can help you check your report status. Please provide your report ID or email address:");
  };

  const handleStatusCheck = async (message) => {
    simulateTyping(async () => {
      try {
        // Simulate checking status
        addMessage('bot', `📊 Here are your recent reports:

🔹 **Report #1234** - Pothole on Main Street
   Status: In Progress ⏳
   Submitted: 2 days ago
   
🔹 **Report #1235** - Street light not working  
   Status: Resolved ✅
   Submitted: 1 week ago
   
🔹 **Report #1236** - Garbage collection issue
   Status: Pending 📋
   Submitted: 3 days ago

Would you like details about any specific report?`, [
          { text: "Report another issue", action: "start_report" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);
      } catch (error) {
        addMessage('bot', "I couldn't find any reports with that information. Please double-check your details.");
      }
    });
  };

  const startAreaStats = () => {
    setCurrentFlow('area_stats');
    addMessage('bot', "Which area would you like statistics for? Please provide the area name or pincode:");
  };

  const handleAreaStats = (message) => {
    simulateTyping(() => {
      addMessage('bot', `📈 Statistics for ${message}:

📊 **Report Summary:**
• Total Reports: 127
• Resolved: 89 (70%)
• In Progress: 23 (18%)  
• Pending: 15 (12%)

🏆 **Top Issues:**
1. Potholes (32 reports)
2. Street lights (28 reports)
3. Garbage collection (19 reports)
4. Water supply (15 reports)

⚡ **Response Time:** Average 3.2 days
🎯 **Resolution Rate:** 70% this month

This area is performing well with quick response times!`, [
        { text: "Report an issue here", action: "start_report" },
        { text: "Check another area", action: "area_stats" },
        { text: "Start new conversation", action: "new_conversation" }
      ]);
      setCurrentFlow(null);
    });
  };

  const showHelp = () => {
    addMessage('bot', `🤖 **How to use this chatbot:**

📝 **Reporting Issues:**
• Select "Report a new civic issue"
• Choose issue type
• Describe the problem
• Provide location details
• Optionally add photos

📊 **Checking Status:**
• Select "Check status of my reports"
• Provide report ID or email
• View all your report statuses

📈 **Area Statistics:**
• Get insights about your area
• View resolution rates and trends
• Compare with other areas

💡 **Tips:**
• Be specific in descriptions
• Include exact locations
• Add photos when possible
• Keep your report ID for tracking

What would you like to do next?`, [
      { text: "Report a new civic issue", action: "start_report" },
      { text: "Check status of my reports", action: "check_status" },
      { text: "Get area statistics", action: "area_stats" }
    ]);
  };

  const startNewConversation = () => {
    setCurrentFlow(null);
    setReportData({});
    setSelectedImage(null);
    const welcomeMessage = {
      id: `msg-${Date.now()}-restart`,
      type: 'bot',
      content: "Hello! How can I help you today?",
      options: [
        { text: "Report a new civic issue", action: "start_report" },
        { text: "Check status of my reports", action: "check_status" },
        { text: "Get area statistics", action: "area_stats" },
        { text: "General help", action: "help" }
      ],
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const startVoiceRecognition = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </div>
              <button
                onClick={startNewConversation}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex mb-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-lg ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option, index) => (
                          <button
                            key={`${message.id}-option-${index}-${option.action}`}
                            onClick={() => handleOptionClick(option.action, option.value)}
                            className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border"
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-white rounded-lg border p-3 flex items-center space-x-3">
            <img src={selectedImage} alt="Selected" className="w-12 h-12 object-cover rounded" />
            <span className="text-sm text-gray-600">Image selected</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="ml-auto p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-32 min-h-[3rem]"
                  rows="1"
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={startVoiceRecognition}
                  disabled={!recognition}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Upload Image"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotPage;
