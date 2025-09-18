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
  MessageSquare,
  Navigation,
  Map
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';
import LocationPicker from '../components/LocationPicker';
import DuplicateReportModal from '../components/Citizen/DuplicateReportModal';

const AIChatbotPage = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [reportData, setReportData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [recognition, setRecognition] = useState(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateReports, setDuplicateReports] = useState([]);
  const [pendingSubmissionData, setPendingSubmissionData] = useState(null);

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
      } else if (currentFlow === 'status_check_by_id') {
        handleStatusCheckById(message);
      } else if (currentFlow === 'status_check_by_email') {
        handleStatusCheckByEmail(message);
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
      addMessage('bot', "Great! Now let's get the location. How would you like to provide the location?", [
        { text: "📍 Use Current Location", action: "use_gps_location" },
        // { text: "🗺️ Select on Map", action: "select_on_map" },
        { text: "📝 Skip Location", action: "skip_location" }
      ]);
      return;
    }
  };

  const handleOptionClick = async (action, value) => {
    if (action === 'start_report') {
      startReportFlow();
    } else if (action === 'check_status') {
      startStatusCheck();
    } else if (action === 'show_all_reports') {
      addMessage('user', '📋 Show all my reports');
      await handleStatusCheck();
    } else if (action === 'search_by_id') {
      addMessage('user', '🔍 Search by Report ID');
      setCurrentFlow('status_check_by_id');
      addMessage('bot', "Please enter your Report ID (e.g., the 6-character code from your report):");
    } else if (action === 'search_by_email') {
      addMessage('user', '📧 Search by email');
      setCurrentFlow('status_check_by_email');
      addMessage('bot', "Please enter your email address to find reports associated with your account:");
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
    } else if (action === 'use_gps_location') {
      addMessage('user', '📍 Use Current Location');
      await handleGPSLocation();
    } else if (action === 'select_on_map') {
      addMessage('user', '🗺️ Select on Map');
      setShowLocationPicker(true);
    } else if (action === 'skip_location') {
      addMessage('user', '📝 Skip Location');
      proceedToPhotoOptions();
    } else if (action === 'new_conversation') {
      startNewConversation();
    }
  };

  const checkForDuplicates = async (coordinates) => {
    if (!coordinates || coordinates.length < 2) {
      return null;
    }

    try {
      const response = await reportService.checkDuplicateReports(
        coordinates[1], // latitude
        coordinates[0], // longitude
        20 // 20 meter radius
      );

      return response;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return null;
    }
  };

  const performDirectSubmission = async (reportPayload) => {
    try {
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
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error('Report submission error:', error);
      const errorMessage = error.error || error.message || 'Unknown error occurred';
      addMessage('bot', `❌ Sorry, there was an error submitting your report: ${errorMessage}. Please try again later or contact support.`);
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

        // Use selected location if available, otherwise use default coordinates
        const coordinates = reportData.coordinates || [77.5946, 12.9716];

        const reportPayload = {
          title: `${(reportData.issueType || 'civic').replace('-', ' ')} issue`,
          category: reportData.issueType || 'other',
          description: reportData.description,
          address: selectedLocation?.address || reportData.address || 'Location not specified',
          location: {
            type: 'Point',
            coordinates: coordinates
          },
          imageUrl: selectedImage || 'https://via.placeholder.com/400x300?text=No+Image'
        };

        // Check for duplicates if GPS coordinates are available
        if (reportData.coordinates && reportData.coordinates.length >= 2) {
          const duplicateCheck = await checkForDuplicates(reportData.coordinates);

          if (duplicateCheck && duplicateCheck.hasDuplicates && duplicateCheck.reports.length > 0) {
            // Store submission data for later use
            setPendingSubmissionData(reportPayload);
            setDuplicateReports(duplicateCheck.reports);
            setIsDuplicateModalOpen(true);
            return; // Stop here and show modal
          }
        }

        // No duplicates found or no GPS coordinates, proceed with submission
        await performDirectSubmission(reportPayload);

      } catch (error) {
        console.error('Report submission error:', error);
        const errorMessage = error.error || error.message || 'Unknown error occurred';
        addMessage('bot', `❌ Sorry, there was an error submitting your report: ${errorMessage}. Please try again later or contact support.`);
      }
    }, 1500);
  };

  const handleProceedWithSubmission = async () => {
    if (pendingSubmissionData) {
      try {
        await performDirectSubmission(pendingSubmissionData);
      } finally {
        setIsDuplicateModalOpen(false);
        setPendingSubmissionData(null);
        setDuplicateReports([]);
      }
    }
  };

  const handleCloseDuplicateModal = () => {
    setIsDuplicateModalOpen(false);
    setPendingSubmissionData(null);
    setDuplicateReports([]);
  };

  const handleViewExistingReport = (report) => {
    console.log('Viewing existing report:', report);
    addMessage('bot', `📋 **Report Details:**\n\n🔹 **Title:** ${report.title}\n📝 **Description:** ${report.description}\n📅 **Submitted:** ${new Date(report.createdAt).toLocaleDateString()}\n🔄 **Status:** ${report.status}`);
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
    addMessage('bot', "I can help you check your report status. How would you like to check your reports?", [
      { text: "📋 Show all my reports", action: "show_all_reports" },
      { text: "🔍 Search by Report ID", action: "search_by_id" },
      { text: "📧 Search by email", action: "search_by_email" }
    ]);
  };

  const handleStatusCheck = async (message) => {
    simulateTyping(async () => {
      try {
        addMessage('bot', "🔍 Fetching your reports from the system...");

        // Fetch real reports from backend
        const userReports = await reportService.getUserReports();
        console.log('Fetched user reports for status check:', userReports);

        if (!userReports || userReports.length === 0) {
          addMessage('bot', "📭 No reports found in your account.\n\nYou haven't submitted any reports yet. Would you like to report a new issue?", [
            { text: "Report a new issue", action: "start_report" },
            { text: "Start new conversation", action: "new_conversation" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Format the reports data
        let reportsText = `📊 **Found ${userReports.length} report${userReports.length > 1 ? 's' : ''} in your account:**\n\n`;

        userReports.slice(0, 5).forEach((report, index) => {
          const statusIcon = getStatusIcon(report.status);
          const timeAgo = getTimeAgo(report.createdAt);
          const reportId = report._id ? report._id.slice(-6) : 'N/A';

          reportsText += `🔹 **Report #${reportId}** - ${report.title || 'Untitled'}\n`;
          reportsText += `   Status: ${formatStatus(report.status)} ${statusIcon}\n`;
          reportsText += `   Category: ${report.category || 'Other'}\n`;
          reportsText += `   Submitted: ${timeAgo}\n`;
          if (report.address) {
            reportsText += `   Location: ${report.address}\n`;
          }
          reportsText += `\n`;
        });

        if (userReports.length > 5) {
          reportsText += `📝 *Showing latest 5 reports. You have ${userReports.length - 5} more reports.*\n\n`;
        }

        reportsText += "Would you like to see details of a specific report or perform another action?";

        const actionOptions = [
          { text: "Report another issue", action: "start_report" },
          { text: "Refresh status", action: "check_status" },
          { text: "Start new conversation", action: "new_conversation" }
        ];

        addMessage('bot', reportsText, actionOptions);
        setCurrentFlow(null);

      } catch (error) {
        console.error('Error fetching reports:', error);
        addMessage('bot', `❌ Sorry, I couldn't fetch your reports right now. This might be due to:\n\n• Network connection issues\n• Server temporarily unavailable\n• Authentication problems\n\nPlease try again in a moment or contact support if the issue persists.`, [
          { text: "Try again", action: "check_status" },
          { text: "Report a new issue", action: "start_report" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);
      }
    });
  };

  const handleStatusCheckById = async (reportId) => {
    simulateTyping(async () => {
      try {
        addMessage('bot', `🔍 Searching for report ID: ${reportId}...`);

        // Fetch all user reports and find the specific one
        const userReports = await reportService.getUserReports();

        if (!userReports || userReports.length === 0) {
          addMessage('bot', "📭 No reports found in your account.", [
            { text: "Report a new issue", action: "start_report" },
            { text: "Start new conversation", action: "new_conversation" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Search for the report by ID (match last 6 characters)
        const matchingReport = userReports.find(report =>
          report._id && report._id.slice(-6).toLowerCase() === reportId.toLowerCase()
        );

        if (!matchingReport) {
          addMessage('bot', `❌ Report ID "${reportId}" not found in your account.\n\nPlease check the ID and try again, or view all your reports.`, [
            { text: "📋 Show all my reports", action: "show_all_reports" },
            { text: "🔍 Try another ID", action: "search_by_id" },
            { text: "Start new conversation", action: "new_conversation" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Display the specific report details
        const statusIcon = getStatusIcon(matchingReport.status);
        const timeAgo = getTimeAgo(matchingReport.createdAt);
        const reportIdShort = matchingReport._id.slice(-6);

        let reportDetail = `✅ **Report Found!**\n\n`;
        reportDetail += `🔹 **Report #${reportIdShort}** - ${matchingReport.title || 'Untitled'}\n`;
        reportDetail += `   Status: ${formatStatus(matchingReport.status)} ${statusIcon}\n`;
        reportDetail += `   Category: ${matchingReport.category || 'Other'}\n`;
        reportDetail += `   Description: ${matchingReport.description || 'No description'}\n`;
        reportDetail += `   Submitted: ${timeAgo}\n`;
        if (matchingReport.address) {
          reportDetail += `   Location: ${matchingReport.address}\n`;
        }
        if (matchingReport.assignedTo) {
          reportDetail += `   Assigned to: ${matchingReport.assignedTo}\n`;
        }
        reportDetail += `\nWhat would you like to do next?`;

        addMessage('bot', reportDetail, [
          { text: "📋 Show all my reports", action: "show_all_reports" },
          { text: "Report another issue", action: "start_report" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);

      } catch (error) {
        console.error('Error searching report by ID:', error);
        addMessage('bot', "❌ Sorry, I couldn't search for that report right now. Please try again later.", [
          { text: "Try again", action: "search_by_id" },
          { text: "📋 Show all my reports", action: "show_all_reports" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);
      }
    });
  };

  const handleStatusCheckByEmail = async (email) => {
    simulateTyping(async () => {
      try {
        addMessage('bot', `🔍 Searching for reports associated with: ${email}...`);

        // For now, just fetch user's own reports since backend handles user-specific reports
        const userReports = await reportService.getUserReports();

        if (!userReports || userReports.length === 0) {
          addMessage('bot', `📭 No reports found for ${email}.\n\nEither no reports have been submitted with this email, or the email doesn't match your current account.`, [
            { text: "Report a new issue", action: "start_report" },
            { text: "Start new conversation", action: "new_conversation" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Format the reports data (same as show all reports)
        let reportsText = `📊 **Found ${userReports.length} report${userReports.length > 1 ? 's' : ''} for ${email}:**\n\n`;

        userReports.slice(0, 5).forEach((report, index) => {
          const statusIcon = getStatusIcon(report.status);
          const timeAgo = getTimeAgo(report.createdAt);
          const reportId = report._id ? report._id.slice(-6) : 'N/A';

          reportsText += `🔹 **Report #${reportId}** - ${report.title || 'Untitled'}\n`;
          reportsText += `   Status: ${formatStatus(report.status)} ${statusIcon}\n`;
          reportsText += `   Category: ${report.category || 'Other'}\n`;
          reportsText += `   Submitted: ${timeAgo}\n`;
          if (report.address) {
            reportsText += `   Location: ${report.address}\n`;
          }
          reportsText += `\n`;
        });

        if (userReports.length > 5) {
          reportsText += `📝 *Showing latest 5 reports. You have ${userReports.length - 5} more reports.*\n\n`;
        }

        reportsText += "What would you like to do next?";

        addMessage('bot', reportsText, [
          { text: "🔍 Search by Report ID", action: "search_by_id" },
          { text: "Report another issue", action: "start_report" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);

      } catch (error) {
        console.error('Error searching reports by email:', error);
        addMessage('bot', "❌ Sorry, I couldn't search for reports with that email right now. Please try again later.", [
          { text: "Try again", action: "search_by_email" },
          { text: "📋 Show all my reports", action: "show_all_reports" },
          { text: "Start new conversation", action: "new_conversation" }
        ]);
        setCurrentFlow(null);
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

  const handleGPSLocation = async () => {
    simulateTyping(async () => {
      if (!navigator.geolocation) {
        addMessage('bot', "❌ GPS location is not supported by your browser. Please select location manually.", [
          { text: "🗺️ Select on Map", action: "select_on_map" },
          { text: "📝 Skip Location", action: "skip_location" }
        ]);
        return;
      }

      addMessage('bot', "📍 Getting your current location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };

          setSelectedLocation(location);
          setReportData(prev => ({
            ...prev,
            coordinates: [longitude, latitude],
            gpsLocation: location
          }));

          simulateTyping(() => {
            addMessage('bot', `✅ Location captured successfully!\n📍 **Location:** ${location.address}\n\nWould you like to add a photo to help us better understand the issue?`, [
              { text: "📷 Yes, upload photo", action: "upload_photo" },
              { text: "📝 No, submit without photo", action: "submit_report" }
            ]);
          });
        },
        (error) => {
          console.error('GPS error:', error);
          simulateTyping(() => {
            addMessage('bot', "❌ Unable to get your current location. Please try selecting the location manually or skip this step.", [
              { text: "🗺️ Select on Map", action: "select_on_map" },
              { text: "📝 Skip Location", action: "skip_location" }
            ]);
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setReportData(prev => ({
      ...prev,
      coordinates: [location.lng, location.lat],
      gpsLocation: location
    }));

    simulateTyping(() => {
      addMessage('bot', `✅ Location selected successfully!\n📍 **Location:** ${location.address}\n\nWould you like to add a photo to help us better understand the issue?`, [
        { text: "📷 Yes, upload photo", action: "upload_photo" },
        { text: "📝 No, submit without photo", action: "submit_report" }
      ]);
    });
  };

  const proceedToPhotoOptions = () => {
    simulateTyping(() => {
      addMessage('bot', "Would you like to add a photo to help us better understand the issue?", [
        { text: "📷 Yes, upload photo", action: "upload_photo" },
        { text: "📝 No, submit without photo", action: "submit_report" }
      ]);
    });
  };

  const startNewConversation = () => {
    setCurrentFlow(null);
    setReportData({});
    setSelectedImage(null);
    setSelectedLocation(null);
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

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'submitted': '📋',
      'acknowledged': '👁️',
      'assigned': '👷',
      'in_progress': '⏳',
      'resolved': '✅',
      'rejected': '❌'
    };
    return icons[status] || '📋';
  };

  // Helper function to format status text
  const formatStatus = (status) => {
    const statusMap = {
      'submitted': 'Submitted',
      'acknowledged': 'Acknowledged',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
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

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            initialLocation={selectedLocation}
          />
        )}
      </AnimatePresence>

      {/* Selected Location Preview */}
      {selectedLocation && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-white rounded-lg border p-3 flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">Location Selected</span>
              <p className="text-xs text-gray-500">{selectedLocation.address}</p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

      {/* Duplicate Report Modal */}
      <DuplicateReportModal
        isOpen={isDuplicateModalOpen}
        onClose={handleCloseDuplicateModal}
        duplicateReports={duplicateReports}
        onProceedAnyway={handleProceedWithSubmission}
        onViewExisting={handleViewExistingReport}
        userLocation={reportData.coordinates ? {
          latitude: reportData.coordinates[1],
          longitude: reportData.coordinates[0]
        } : null}
      />
    </div>
  );
};

export default AIChatbotPage;
