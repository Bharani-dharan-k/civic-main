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

  // Jharkhand districts data
  const jharkhandDistricts = [
    'Ranchi', 'Dhanbad', 'Bokaro', 'Jamshedpur', 'Hazaribagh', 'Giridih',
    'Deoghar', 'Dumka', 'Godda', 'Sahibganj', 'Pakur', 'Palamu',
    'Garhwa', 'Latehar', 'Chatra', 'Koderma', 'Jamtara', 'Gumla',
    'Simdega', 'Lohardaga', 'Khunti', 'West Singhbhum', 'Seraikela Kharsawan', 'Ramgarh'
  ];

  // Urban local bodies by district (sample data - you can expand this)
  const urbanLocalBodies = {
    'Ranchi': ['Ranchi Municipal Corporation', 'Bundu Nagar Panchayat', 'Khunti Nagar Panchayat'],
    'Dhanbad': ['Dhanbad Municipal Corporation', 'Jharia Municipality', 'Sindri Municipality'],
    'Bokaro': ['Bokaro Steel City', 'Chas Municipality', 'Bermo Municipality'],
    'Jamshedpur': ['Jamshedpur Notified Area Committee', 'Jugsalai Municipality', 'Chakulia Municipality'],
    'Hazaribagh': ['Hazaribagh Municipality', 'Ramgarh Municipality', 'Barhi Municipality'],
    'Giridih': ['Giridih Municipality', 'Deoghar Municipality', 'Madhupur Municipality'],
    'Deoghar': ['Deoghar Municipality', 'Jasidih Municipality', 'Madhupur Municipality'],
    'Dumka': ['Dumka Municipality', 'Shikaripara Municipality'],
    'Godda': ['Godda Municipality', 'Mahagama Municipality'],
    'Sahibganj': ['Sahibganj Municipality', 'Rajmahal Municipality'],
    'Pakur': ['Pakur Municipality', 'Littipara Municipality'],
    'Palamu': ['Medininagar Municipality', 'Daltonganj Municipality'],
    'Garhwa': ['Garhwa Municipality', 'Ranka Municipality'],
    'Latehar': ['Latehar Municipality', 'Barwadih Municipality'],
    'Chatra': ['Chatra Municipality', 'Hunterganj Municipality'],
    'Koderma': ['Koderma Municipality', 'Jhumri Telaiya Municipality'],
    'Jamtara': ['Jamtara Municipality', 'Narayanpur Municipality'],
    'Gumla': ['Gumla Municipality', 'Bishunpur Municipality'],
    'Simdega': ['Simdega Municipality', 'Bolba Municipality'],
    'Lohardaga': ['Lohardaga Municipality', 'Senha Municipality'],
    'Khunti': ['Khunti Municipality', 'Torpa Municipality'],
    'West Singhbhum': ['Chaibasa Municipality', 'Manoharpur Municipality'],
    'Seraikela Kharsawan': ['Seraikela Municipality', 'Kharsawan Municipality'],
    'Ramgarh': ['Ramgarh Municipality', 'Patratu Municipality']
  };

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
      content: "🤖 Hello! I'm your **Jharkhand Civic Assistant**. I can help you with:",
      options: [
        { text: "📝 Report a new civic issue", action: "start_report" },
        { text: "📊 Check status of my reports", action: "check_status" },
        { text: "🗺️ View reports on interactive map", action: "view_map" },
        { text: "📈 Get district statistics", action: "area_stats" },
        { text: "💬 View/add comments on reports", action: "manage_comments" },
        { text: "❓ General help", action: "help" }
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
    simulateTyping(async () => {
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
      } else if (currentFlow === 'add_comment') {
        handleAddCommentFlow(message);
      } else if (currentFlow === 'feedback_flow') {
        handleFeedbackFlow(message);
      } else if (currentFlow === 'comment_input') {
        await submitComment(message);
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
        { text: "📝 Report a new civic issue", action: "start_report" },
        { text: "📊 Check status of my reports", action: "check_status" },
        { text: "🗺️ View reports on interactive map", action: "view_map" },
        { text: "📈 Get district statistics", action: "area_stats" },
        { text: "💬 View/add comments on reports", action: "manage_comments" },
        { text: "❓ General help", action: "help" }
      ]);
    }
  };

  const showMainMenu = () => {
    setCurrentFlow(null);
    addMessage('bot', "🏠 **Main Menu** - How can I assist you today?", [
      { text: "📝 Report a new civic issue", action: "start_report" },
      { text: "📊 Check status of my reports", action: "check_status" },
      { text: "🗺️ View reports on interactive map", action: "view_map" },
      { text: "📈 Get district statistics", action: "area_stats" },
      { text: "💬 View/add comments on reports", action: "manage_comments" },
      { text: "❓ General help", action: "help" }
    ]);
  };

  const startCommentManagement = () => {
    setCurrentFlow('comment_management');
    addMessage('bot', "💬 **Comment Management**\n\nI can help you with:\n• View comments on your reports\n• Add comments to reports\n• View feedback on resolved reports\n\nWhat would you like to do?", [
      { text: "📝 Add comment to a report", action: "add_comment" },
      { text: "👁️ View comments on my reports", action: "view_comments" },
      { text: "⭐ Give feedback on resolved reports", action: "give_feedback" },
      { text: "🏠 Back to main menu", action: "main_menu" }
    ]);
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
      addMessage('bot', "Thank you! Now, which district is this issue located in?", 
        jharkhandDistricts.map(district => ({
          text: district,
          action: "select_district",
          value: district
        }))
      );
      return;
    }
    
    if (!reportData.district) {
      // District will be set via option click
      return;
    }

    if (!reportData.urbanLocalBody) {
      // Urban local body will be set via option click
      return;
    }
    
    if (!reportData.address) {
      setReportData(prev => ({ ...prev, address: message }));
      addMessage('bot', "Perfect! Now let's get the precise location. How would you like to provide the location coordinates?", [
        { text: "📍 Use Current Location", action: "use_gps_location" },
        { text: "🗺️ Select on Map", action: "select_on_map" },
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
    } else if (action === 'view_map') {
      addMessage('user', '🗺️ View reports on interactive map');
      addMessage('bot', "🗺️ I'd love to show you the interactive map! The map displays all civic reports with district-wise filtering and shows completed reports with special markers.\n\n**Map Features:**\n• 📍 View all reports by location\n• 🏛️ Filter by Jharkhand districts\n• ✅ Highlight completed reports\n• 💬 See report details and comments\n\nWould you like me to guide you to the map or help with something else?", [
        { text: "🗺️ Go to Interactive Map", action: "navigate_to_map" },
        { text: "📝 Report new issue", action: "start_report" },
        { text: "📊 Check report status", action: "check_status" },
        { text: "🏠 Back to main menu", action: "main_menu" }
      ]);
    } else if (action === 'navigate_to_map') {
      addMessage('user', '🗺️ Go to Interactive Map');
      addMessage('bot', "🗺️ To access the Interactive Map:\n\n1. **From Citizen Dashboard:** Look for the 'Interactive Map' button\n2. **From Main Menu:** Navigate to the Map section\n3. **Direct Access:** The map shows all reports with district filtering\n\n**Pro Tips:**\n• Use district filter to see reports in your area\n• Look for green checkmarks on completed reports\n• Click markers to see full report details\n• Use 'Show Only Completed' for success stories\n\nWould you like help with anything else?", [
        { text: "📝 Report new issue", action: "start_report" },
        { text: "📊 Check my reports", action: "check_status" },
        { text: "🏠 Start over", action: "new_conversation" }
      ]);
    } else if (action === 'manage_comments') {
      addMessage('user', '� View/add comments on reports');
      startCommentManagement();
    } else if (action === 'show_all_reports') {
      addMessage('user', '�📋 Show all my reports');
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
    } else if (action === 'get_district_stats') {
      addMessage('user', `📈 ${value} District Statistics`);
      await getDistrictStats(value);
    } else if (action === 'help') {
      showHelp();
    } else if (action === 'main_menu') {
      addMessage('user', '🏠 Back to main menu');
      showMainMenu();
    } else if (action === 'select_type') {
      setReportData(prev => ({ ...prev, issueType: value }));
      addMessage('user', value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' '));
      simulateTyping(() => {
        addMessage('bot', `You've selected **"${value.replace('-', ' ')}"**. Please describe the issue in detail:\n\n💡 **Tips for better descriptions:**\n• Be specific about the problem\n• Mention size/severity if applicable\n• Include any safety concerns\n• Add timing information if relevant`);
      });
    } else if (action === 'select_district') {
      setReportData(prev => ({ ...prev, district: value }));
      addMessage('user', `📍 ${value} District`);
      simulateTyping(() => {
        const localBodies = urbanLocalBodies[value] || ['Municipality', 'Nagar Panchayat', 'Other'];
        addMessage('bot', `Great! You've selected **${value} District**. Now, which urban local body/municipality is this issue in?`, 
          localBodies.map(body => ({
            text: body,
            action: "select_urban_body",
            value: body
          }))
        );
      });
    } else if (action === 'select_urban_body') {
      setReportData(prev => ({ ...prev, urbanLocalBody: value }));
      addMessage('user', `🏛️ ${value}`);
      simulateTyping(() => {
        addMessage('bot', `Perfect! **District:** ${reportData.district}, **Area:** ${value}\n\nNow please provide the specific address or location description where this issue is present:`);
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
    } else if (action === 'add_comment') {
      addMessage('user', '📝 Add comment to a report');
      startAddComment();
    } else if (action === 'view_comments') {
      addMessage('user', '👁️ View comments on my reports');
      await showReportsWithComments();
    } else if (action === 'give_feedback') {
      addMessage('user', '⭐ Give feedback on resolved reports');
      await showResolvedReportsForFeedback();
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
          district: reportData.district || '',
          urbanLocalBody: reportData.urbanLocalBody || '',
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

        // Format the reports data with enhanced information
        let reportsText = `📊 **Found ${userReports.length} report${userReports.length > 1 ? 's' : ''} in your account:**\n\n`;

        userReports.slice(0, 5).forEach((report, index) => {
          const statusIcon = getStatusIcon(report.status);
          const timeAgo = getTimeAgo(report.createdAt);
          const reportId = report._id ? report._id.slice(-6) : 'N/A';

          reportsText += `🔹 **Report #${reportId}** - ${report.title || 'Untitled'}\n`;
          reportsText += `   📊 Status: ${formatStatus(report.status)} ${statusIcon}\n`;
          reportsText += `   🏷️ Category: ${report.category || 'Other'}\n`;
          
          // Add district and urban local body info
          if (report.district) {
            reportsText += `   🏛️ District: ${report.district}`;
            if (report.urbanLocalBody) {
              reportsText += ` • ${report.urbanLocalBody}`;
            }
            reportsText += `\n`;
          }
          
          reportsText += `   📅 Submitted: ${timeAgo}\n`;
          
          // Add resolution date if completed
          if (report.status === 'resolved' && report.resolvedAt) {
            const resolvedAgo = getTimeAgo(report.resolvedAt);
            reportsText += `   ✅ Resolved: ${resolvedAgo}\n`;
          }
          
          if (report.address) {
            reportsText += `   📍 Location: ${report.address}\n`;
          }
          
          // Add comment count if available
          if (report.citizenComments && report.citizenComments.length > 0) {
            reportsText += `   💬 Comments: ${report.citizenComments.length}\n`;
          }
          
          // Add priority if high or critical
          if (report.priority && (report.priority.toLowerCase() === 'high' || report.priority.toLowerCase() === 'critical')) {
            reportsText += `   ⚡ Priority: ${report.priority}\n`;
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
    addMessage('bot', "📈 **District Statistics**\n\nI can show you statistics for any Jharkhand district. Which district would you like to analyze?", 
      jharkhandDistricts.map(district => ({
        text: district,
        action: "get_district_stats",
        value: district
      }))
    );
  };

  const handleAreaStats = async (message) => {
    // This will handle text input for area stats
    await getDistrictStats(message);
  };

  const getDistrictStats = async (districtName) => {
    simulateTyping(async () => {
      try {
        addMessage('bot', `� Fetching statistics for ${districtName}...`);

        // Fetch all reports to calculate statistics
        const allReports = await reportService.getAllReports();
        
        // Filter reports by district
        const districtReports = allReports.filter(report => 
          report.district && report.district.toLowerCase() === districtName.toLowerCase()
        );

        if (districtReports.length === 0) {
          addMessage('bot', `📭 No reports found for ${districtName} district.\n\nThis could mean:\n• No reports have been submitted yet\n• Reports are from other districts\n• Different spelling used\n\nWould you like to check another district?`, [
            { text: "📈 Check another district", action: "area_stats" },
            { text: "� Report issue in this district", action: "start_report" },
            { text: "🏠 Back to main menu", action: "main_menu" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Calculate statistics
        const totalReports = districtReports.length;
        const resolvedReports = districtReports.filter(r => r.status === 'resolved');
        const inProgressReports = districtReports.filter(r => r.status === 'in_progress' || r.status === 'assigned');
        const pendingReports = districtReports.filter(r => r.status === 'submitted' || r.status === 'acknowledged');
        
        const resolvedPercent = Math.round((resolvedReports.length / totalReports) * 100);
        const inProgressPercent = Math.round((inProgressReports.length / totalReports) * 100);
        const pendingPercent = Math.round((pendingReports.length / totalReports) * 100);

        // Count by category
        const categoryCount = {};
        districtReports.forEach(report => {
          const category = report.category || 'other';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const topIssues = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 4);

        // Calculate average resolution time for resolved reports
        let avgResolutionDays = 'N/A';
        if (resolvedReports.length > 0) {
          const totalDays = resolvedReports.reduce((sum, report) => {
            if (report.resolvedAt && report.createdAt) {
              const days = Math.ceil((new Date(report.resolvedAt) - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
              return sum + days;
            }
            return sum;
          }, 0);
          avgResolutionDays = Math.round(totalDays / resolvedReports.length) || 'N/A';
        }

        let statsMessage = `📈 **${districtName} District Statistics**\n\n`;
        statsMessage += `📊 **Report Summary:**\n`;
        statsMessage += `• Total Reports: ${totalReports}\n`;
        statsMessage += `• ✅ Resolved: ${resolvedReports.length} (${resolvedPercent}%)\n`;
        statsMessage += `• 🔄 In Progress: ${inProgressReports.length} (${inProgressPercent}%)\n`;
        statsMessage += `• ⏳ Pending: ${pendingReports.length} (${pendingPercent}%)\n\n`;

        if (topIssues.length > 0) {
          statsMessage += `🏆 **Top Issues:**\n`;
          topIssues.forEach(([category, count], index) => {
            statsMessage += `${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} (${count} reports)\n`;
          });
          statsMessage += `\n`;
        }

        statsMessage += `⚡ **Avg Resolution Time:** ${avgResolutionDays} days\n`;
        statsMessage += `🎯 **Success Rate:** ${resolvedPercent}% completed\n\n`;

        if (resolvedPercent >= 70) {
          statsMessage += `🌟 **Excellent performance!** This district has a high resolution rate.`;
        } else if (resolvedPercent >= 50) {
          statsMessage += `👍 **Good progress!** This district is making steady improvements.`;
        } else {
          statsMessage += `📋 **Room for improvement** - More attention may be needed in this district.`;
        }

        addMessage('bot', statsMessage, [
          { text: "📝 Report issue in this district", action: "start_report" },
          { text: "🗺️ View on map", action: "view_map" },
          { text: "📈 Check another district", action: "area_stats" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
        setCurrentFlow(null);

      } catch (error) {
        console.error('Error fetching district statistics:', error);
        addMessage('bot', `❌ Sorry, I couldn't fetch statistics for ${districtName} right now. Please try again later.`, [
          { text: "📈 Try another district", action: "area_stats" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
        setCurrentFlow(null);
      }
    });
  };

  const startAddComment = () => {
    setCurrentFlow('add_comment');
    addMessage('bot', "📝 **Add Comment to Report**\n\nPlease provide your Report ID (6-character code) to add a comment:");
  };

  const showReportsWithComments = async () => {
    simulateTyping(async () => {
      try {
        addMessage('bot', "🔍 Fetching reports with comments...");
        
        const userReports = await reportService.getUserReports();
        const reportsWithComments = userReports.filter(report => 
          report.citizenComments && report.citizenComments.length > 0
        );

        if (reportsWithComments.length === 0) {
          addMessage('bot', "📭 No comments found on your reports.\n\nNone of your reports have comments yet. Comments help track progress and communicate with officials.", [
            { text: "📝 Add comment to a report", action: "add_comment" },
            { text: "📋 View all my reports", action: "show_all_reports" },
            { text: "🏠 Back to main menu", action: "main_menu" }
          ]);
          return;
        }

        let commentsText = `💬 **Reports with Comments (${reportsWithComments.length} found):**\n\n`;

        reportsWithComments.slice(0, 3).forEach(report => {
          const reportId = report._id.slice(-6);
          const commentCount = report.citizenComments.length;
          const latestComment = report.citizenComments[report.citizenComments.length - 1];
          const timeAgo = getTimeAgo(latestComment.createdAt);

          commentsText += `🔹 **Report #${reportId}** - ${report.title || report.category}\n`;
          commentsText += `   💬 ${commentCount} comment${commentCount > 1 ? 's' : ''} • Latest: ${timeAgo}\n`;
          commentsText += `   📝 ${latestComment.comment.substring(0, 50)}${latestComment.comment.length > 50 ? '...' : ''}\n\n`;
        });

        if (reportsWithComments.length > 3) {
          commentsText += `📝 *Showing 3 of ${reportsWithComments.length} reports with comments.*\n\n`;
        }

        commentsText += "What would you like to do?";

        addMessage('bot', commentsText, [
          { text: "📝 Add new comment", action: "add_comment" },
          { text: "📋 View all reports", action: "show_all_reports" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
      } catch (error) {
        console.error('Error fetching comments:', error);
        addMessage('bot', "❌ Sorry, I couldn't fetch comments right now. Please try again later.", [
          { text: "📝 Add comment", action: "add_comment" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
      }
    });
  };

  const showResolvedReportsForFeedback = async () => {
    simulateTyping(async () => {
      try {
        addMessage('bot', "🔍 Looking for your resolved reports...");
        
        const userReports = await reportService.getUserReports();
        const resolvedReports = userReports.filter(report => report.status === 'resolved');

        if (resolvedReports.length === 0) {
          addMessage('bot', "📭 No resolved reports found.\n\nYou don't have any resolved reports yet. Once your reports are completed, you can provide feedback to help improve services.", [
            { text: "📝 Report new issue", action: "start_report" },
            { text: "📊 Check report status", action: "check_status" },
            { text: "🏠 Back to main menu", action: "main_menu" }
          ]);
          return;
        }

        let feedbackText = `⭐ **Resolved Reports (${resolvedReports.length} found):**\n\n`;

        resolvedReports.slice(0, 3).forEach(report => {
          const reportId = report._id.slice(-6);
          const resolvedAgo = getTimeAgo(report.resolvedAt);
          const hasFeedback = report.feedback && report.feedback.length > 0;

          feedbackText += `🔹 **Report #${reportId}** - ${report.title || report.category}\n`;
          feedbackText += `   ✅ Resolved: ${resolvedAgo}\n`;
          feedbackText += `   ${hasFeedback ? '⭐ Feedback given' : '⭐ No feedback yet'}\n`;
          feedbackText += `   📍 ${report.district || 'Unknown district'}\n\n`;
        });

        if (resolvedReports.length > 3) {
          feedbackText += `📝 *Showing 3 of ${resolvedReports.length} resolved reports.*\n\n`;
        }

        feedbackText += "Would you like to give feedback on any of these completed reports?";

        addMessage('bot', feedbackText, [
          { text: "⭐ Give feedback by Report ID", action: "feedback_by_id" },
          { text: "📋 View all resolved reports", action: "show_resolved_reports" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
      } catch (error) {
        console.error('Error fetching resolved reports:', error);
        addMessage('bot', "❌ Sorry, I couldn't fetch resolved reports right now. Please try again later.", [
          { text: "📊 Check report status", action: "check_status" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
      }
    });
  };

  const showHelp = () => {
    addMessage('bot', `🤖 **Jharkhand Civic Assistant Help Guide:**

📝 **Reporting Issues:**
• Select "Report a new civic issue"
• Choose from 9+ issue types (pothole, streetlight, garbage, etc.)
• Select your district from 24 Jharkhand districts
• Choose urban local body/municipality
• Provide detailed description
• Add precise location via GPS or map
• Optionally upload photos for evidence

📊 **Checking Report Status:**
• View all your reports with detailed info
• Search by Report ID or email
• See district and urban local body info
• Track resolution progress and timelines
• View completion dates for resolved reports

🗺️ **Interactive Map Features:**
• View all reports on map by location
• Filter reports by district
• See completed reports with special markers
• Click markers for detailed popups
• District-based map centering

📈 **District Statistics:**
• Real-time statistics for all 24 districts
• Resolution rates and completion trends
• Top issues by category
• Average response times
• Performance comparisons

💬 **Comments & Feedback:**
• View existing comments on your reports
• Add comments for updates or clarification
• Give feedback on completed reports
• Star rating system for resolved issues

💡 **Pro Tips:**
• Be specific in issue descriptions
• Include exact addresses and landmarks
• Use GPS location for precise reporting
• Upload photos for faster resolution
• Track your reports regularly
• Provide feedback on completed work

🏛️ **Jharkhand Coverage:**
All 24 districts supported with local urban bodies!

What would you like to do next?`, [
      { text: "📝 Report new civic issue", action: "start_report" },
      { text: "📊 Check my report status", action: "check_status" },
      { text: "🗺️ View interactive map", action: "view_map" },
      { text: "📈 Get district statistics", action: "area_stats" },
      { text: "🏠 Back to main menu", action: "main_menu" }
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

  // Comment management handlers
  const handleAddCommentFlow = async (message) => {
    const reportId = message.trim();
    
    if (reportId.length !== 6) {
      addMessage('bot', "❌ Please provide a valid 6-character Report ID. You can find this in your reports list.");
      return;
    }

    simulateTyping(async () => {
      try {
        const userReports = await reportService.getUserReports();
        const matchingReport = userReports.find(report =>
          report._id && report._id.slice(-6).toLowerCase() === reportId.toLowerCase()
        );

        if (!matchingReport) {
          addMessage('bot', `❌ Report ID "${reportId}" not found in your account. Please check the ID and try again.`, [
            { text: "🔍 Try another ID", action: "add_comment" },
            { text: "📋 View all reports", action: "show_all_reports" },
            { text: "🏠 Back to main menu", action: "main_menu" }
          ]);
          setCurrentFlow(null);
          return;
        }

        // Set up for comment input
        setReportData({ commentReportId: matchingReport._id });
        setCurrentFlow('comment_input');
        
        addMessage('bot', `📝 **Adding comment to Report #${reportId}**\n\n**Report:** ${matchingReport.title || matchingReport.category}\n**Status:** ${formatStatus(matchingReport.status)}\n\nPlease type your comment or question:`);
        
      } catch (error) {
        console.error('Error finding report:', error);
        addMessage('bot', "❌ Sorry, I couldn't find that report right now. Please try again later.");
        setCurrentFlow(null);
      }
    });
  };

  const handleFeedbackFlow = async (message) => {
    // Handle feedback submission flow
    addMessage('bot', "⭐ **Feedback Feature**\n\nFeedback functionality will be available soon. For now, you can add comments to your reports.", [
      { text: "📝 Add comment instead", action: "add_comment" },
      { text: "🏠 Back to main menu", action: "main_menu" }
    ]);
    setCurrentFlow(null);
  };

  const submitComment = async (commentText) => {
    if (!commentText.trim()) {
      addMessage('bot', "❌ Please provide a comment to add to the report.");
      return;
    }

    if (!reportData.commentReportId) {
      addMessage('bot', "❌ Error: Report ID not found. Please try again.", [
        { text: "📝 Add comment", action: "add_comment" },
        { text: "🏠 Back to main menu", action: "main_menu" }
      ]);
      setCurrentFlow(null);
      return;
    }

    simulateTyping(async () => {
      try {
        addMessage('bot', "📝 Adding your comment to the report...");

        await reportService.addComment(reportData.commentReportId, commentText);

        addMessage('bot', `✅ **Comment added successfully!**\n\n💬 Your comment: "${commentText}"\n\nThe comment has been added to your report and relevant officials will be notified.\n\nWhat would you like to do next?`, [
          { text: "📝 Add another comment", action: "add_comment" },
          { text: "📊 View my reports", action: "show_all_reports" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);

        setCurrentFlow(null);
        setReportData({});

      } catch (error) {
        console.error('Error adding comment:', error);
        addMessage('bot', "❌ Sorry, I couldn't add your comment right now. Please try again later.", [
          { text: "🔄 Try again", action: "add_comment" },
          { text: "🏠 Back to main menu", action: "main_menu" }
        ]);
        setCurrentFlow(null);
      }
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
