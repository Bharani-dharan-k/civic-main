import { useState, useCallback, useEffect } from 'react';

export const translations = {
  en: {
    // Navigation
    'submit_report': 'Submit Report',
    'track_status': 'Track Status',
    'leaderboard': 'Leaderboard',
    'notifications': 'Notifications',
    'insights': 'Insights',
    'profile': 'Profile',
    'logout': 'Logout',

    // Dashboard Header
    'seva_track': 'SEVA TRACK',
    'citizen_dashboard': 'Citizen Dashboard',
    'welcome_back': 'Welcome back',
    'welcome_citizen': 'Welcome, Citizen',
    'level_reporter': 'Level 3 Reporter',
    'reports': 'Reports',
    'resolved': 'Resolved',
    'points': 'Points',
    'badges': 'Badges',
    'civic_dashboard': 'Civic Dashboard',

    // Submit Report
    'report_civic_issue': 'Report a Civic Issue',
    'select_category': 'Select Category',
    'issue_title': 'Issue Title',
    'describe_issue': 'Describe the Issue',
    'upload_photo': 'Upload Photo/Video',
    'record_voice': 'Record Voice Note',
    'location': 'Location',
    'use_current_location': 'Use Current Location',
    'priority_level': 'Priority Level',
    'submit_complaint': 'Submit Complaint',
    'anonymous_report': 'Submit Anonymously',
    'single_image_only': 'Only one image can be uploaded',
    'attach_images': 'Attach Image',
    'click_to_upload_images': 'Click to upload image',

    // Categories
    'pothole': 'Pothole',
    'streetlight': 'Street Light',
    'waste_management': 'Waste Management',
    'drainage': 'Drainage',
    'water_supply': 'Water Supply',
    'electricity': 'Electricity',
    'road_repair': 'Road Repair',
    'traffic': 'Traffic Issues',
    'insights': 'Insights',
    'reports_submitted': 'Reports Submitted',
    'other': 'Other',

    // Status
    'submitted': 'Submitted',
    'acknowledged': 'Acknowledged',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Rejected',

    // Track Status
    'my_complaints': 'My Complaints',
    'complaint_progress': 'Complaint Progress',
    'estimated_completion': 'Estimated Completion',
    'days': 'days',
    'upvote': 'Upvote',
    'comment': 'Comment',
    'share': 'Share',

    // Leaderboard
    'top_reporters': 'Top Reporters',
    'community_champions': 'Community Champions',
    'your_rank': 'Your Rank',
    'achievements': 'Achievements',
    'first_reporter': 'First Reporter',
    'problem_solver': 'Problem Solver',
    'community_champion': 'Community Champion',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'no_data_available': 'No data available',
    'reports_submitted': 'reports submitted',
    'failed_to_load_leaderboard': 'Failed to load leaderboard',

    // Profile
    'personal_information': 'Personal Information',
    'full_name': 'Full Name',
    'email': 'Email',
    'phone': 'Phone',
    'address': 'Address',
    'location': 'Location',
    'bio': 'Bio',
    'edit_profile': 'Edit Profile',
    'save': 'Save',
    'cancel': 'Cancel',
    'save_changes': 'Save Changes',
    'saving': 'Saving...',
    'not_provided': 'Not Provided',
    'tell_us_about_yourself': 'Tell us about yourself...',
    'profile_updated_successfully': 'Profile updated successfully',
    'profile_update_failed': 'Failed to update profile',
    'activity_summary': 'Activity Summary',
    'total_reports': 'Total Reports',
    'reports_resolved': 'Reports Resolved',
    'points_earned': 'Points Earned',
    'badges_earned': 'Badges Earned',
    'statistics': 'Statistics',
    'privacy_security': 'Privacy & Security',
    'app_preferences': 'App Preferences',

    // Form fields
    'report_title': 'Report Title',
    'enter_report_title': 'Enter report title',
    'category': 'Category',
    'description': 'Description',
    'describe_issue_detail': 'Describe the issue in detail',
    'enter_location_or_use_gps': 'Enter location or use GPS',
    'gps': 'GPS',
    'priority': 'Priority',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'submitting': 'Submitting...',

    // Tracking
    'track_reports': 'Track Reports',
    'reports_found': 'reports found',
    'search_reports': 'Search reports',
    'all_status': 'All Status',
    'pending': 'Pending',
    'no_reports_found': 'No reports found',
    'try_different_search': 'Try a different search term',

    // Form validation & messages
    'fill_required_fields': 'Please fill in all required fields',
    'report_submitted_successfully': 'Report submitted successfully',
    'report_submission_failed': 'Report submission failed',
    'submit_new_report': 'Submit New Report',
    'geolocation_not_supported': 'Geolocation is not supported',
    'location_captured': 'Location captured successfully',
    'location_failed': 'Failed to capture location',

    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'try_again': 'Try Again',
    'close': 'Close',
    'view_details': 'View Details',
    'failed_to_load_data': 'Failed to load data. Please try again.',
  },

  hi: {
    // Navigation
    'submit_report': 'शिकायत दर्ज करें',
    'track_status': 'स्थिति ट्रैक करें',
    'leaderboard': 'लीडरबोर्ड',
    'notifications': 'सूचनाएं',
    'insights': 'अंतर्दृष्टि',
    'profile': 'प्रोफ़ाइल',
    'logout': 'लॉग आउट',

    // Dashboard Header
    'seva_track': 'सेवा ट्रैक',
    'citizen_dashboard': 'नागरिक डैशबोर्ड',
    'welcome_back': 'वापसी पर स्वागत',
    'welcome_citizen': 'स्वागत, नागरिक',
    'level_reporter': 'लेवल 3 रिपोर्टर',
    'reports': 'रिपोर्ट्स',
    'resolved': 'हल हुई',
    'points': 'अंक',
    'badges': 'बैज',
    'civic_dashboard': 'नागरिक डैशबोर्ड',

    // Submit Report
    'report_civic_issue': 'नागरिक समस्या की रिपोर्ट करें',
    'select_category': 'श्रेणी चुनें',
    'issue_title': 'समस्या का शीर्षक',
    'describe_issue': 'समस्या का वर्णन करें',
    'upload_photo': 'फोटो/वीडियो अपलोड करें',
    'record_voice': 'आवाज़ नोट रिकॉर्ड करें',
    'location': 'स्थान',
    'use_current_location': 'वर्तमान स्थान का उपयोग करें',
    'priority_level': 'प्राथमिकता स्तर',
    'submit_complaint': 'शिकायत दर्ज करें',
    'anonymous_report': 'गुमनाम रूप से दर्ज करें',
    'single_image_only': 'केवल एक इमेज अपलोड की जा सकती है',

    // Status
    'submitted': 'दर्ज',
    'acknowledged': 'स्वीकार की गई',
    'in_progress': 'प्रगति में',
    'resolved': 'हल',
    'rejected': 'अस्वीकृत',

    // Leaderboard
    'weekly': 'साप्ताहिक',
    'monthly': 'मासिक',
    'yearly': 'वार्षिक',
    'no_data_available': 'कोई डेटा उपलब्ध नहीं',
    'reports_submitted': 'रिपोर्ट्स जमा की गईं',
    'failed_to_load_leaderboard': 'लीडरबोर्ड लोड नहीं हो सका',

    // Common
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'try_again': 'पुनः प्रयास करें',
    'close': 'बंद करें',
    'view_details': 'विवरण देखें',
    'failed_to_load_data': 'डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।',
  },

  ta: {
    // Navigation
    'submit_report': 'புகார் சமர்பிக்க',
    'track_status': 'நிலையைக் கண்காணிக்க',
    'leaderboard': 'தலைமைப் பலகை',
    'notifications': 'அறிவிப்புகள்',
    'insights': 'நுண்ணறிவுகள்',
    'profile': 'சுயவிவரம்',
    'logout': 'வெளியேறு',

    // Dashboard Header
    'seva_track': 'சேவா ட்ராக்',
    'citizen_dashboard': 'குடிமக்கள் டாஷ்போர்டு',
    'welcome_back': 'மீண்டும் வரவேற்கிறோம்',
    'welcome_citizen': 'வரவேற்கிறோம், குடிமகனே',
    'level_reporter': 'நிலை 3 புகார்தாரர்',
    'reports': 'அறிக்கைகள்',
    'resolved': 'தீர்க்கப்பட்டது',
    'points': 'புள்ளிகள்',
    'badges': 'பேட்ஜ்கள்',
    'civic_dashboard': 'குடிமக்கள் டாஷ்போர்டு',

    // Submit Report
    'report_civic_issue': 'குடிமைச் சிக்கலைப் புகார் செய்க',
    'select_category': 'வகையைத் தேர்ந்தெடுக்கவும்',
    'issue_title': 'சிக்கலின் தலைப்பு',
    'describe_issue': 'சிக்கலை விவரிக்கவும்',
    'upload_photo': 'புகைப்படம்/வீடியோ பதிவேற்றம்',
    'record_voice': 'குரல் குறிப்பு பதிவு செய்க',
    'location': 'இடம்',
    'use_current_location': 'தற்போதைய இடத்தைப் பயன்படுத்தவும்',
    'priority_level': 'முன்னுரிமை நிலை',
    'submit_complaint': 'புகார் சமர்பிக்கவும்',
    'anonymous_report': 'பெயர் தெரியாமல் சமர்பிக்கவும்',
    'single_image_only': 'ஒரே ஒரு படம் மட்டுமே பதிவேற்ற முடியும்',

    // Status
    'submitted': 'சமர்பிக்கப்பட்டது',
    'acknowledged': 'ஏற்றுக்கொள்ளப்பட்டது',
    'in_progress': 'முன்னேற்றத்தில்',
    'resolved': 'தீர்க்கப்பட்டது',
    'rejected': 'நிராகரிக்கப்பட்டது',

    // Leaderboard  
    'weekly': 'வாராந்திர',
    'monthly': 'மாதாந்திர',
    'yearly': 'ஆண்டுதோறும்',
    'no_data_available': 'தரவு எதுவும் கிடைக்கவில்லை',
    'reports_submitted': 'அறிக்கைகள் சமர்பிக்கப்பட்டன',
    'failed_to_load_leaderboard': 'லீடர்போர்டை ஏற்ற முடியவில்லை',

    // Common
    'loading': 'ஏற்றுகிறது...',
    'error': 'பிழை',
    'success': 'வெற்றி',
    'try_again': 'மீண்டும் முயற்சிக்கவும்',
    'close': 'மூடு',
    'view_details': 'விவரங்களைக் காண்க',
    'failed_to_load_data': 'தரவை ஏற்ற முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
  }
};

export const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations.en[key] || key;
};

// React hook for translation - this is the main export needed by components
export const useTranslation = () => {
  const getInitialLang = () => {
    try {
      return localStorage.getItem('appLanguage') || 'en';
    } catch {
      return 'en';
    }
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem('appLanguage', currentLanguage);
    } catch {}
  }, [currentLanguage]);

  const t = useCallback(
    (key) => translations[currentLanguage]?.[key] ?? translations.en[key] ?? key,
    [currentLanguage]
  );

  const changeLanguage = useCallback((lang) => {
    setCurrentLanguage(lang);
  }, []);

  return { t, changeLanguage, currentLanguage };
};
