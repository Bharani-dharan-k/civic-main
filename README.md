# सेवा Track - Civic Management System

A comprehensive civic complaint management system with beautiful Hindi/English interface built with React and Tailwind CSS.

## 🌟 Features

### 🎨 Beautiful UI Design
- **Modern Tailwind CSS Design** with custom gradients and animations
- **Hindi Language Support** with देवनागरी script
- **Responsive Design** for all devices
- **Custom Color Palette** with civic-themed colors
- **Beautiful Cards and Components** with hover effects
- **Loading Animations** and smooth transitions

### 🔐 Role-Based Authentication
- **Ward Officer** (वार्ड अधिकारी) - Ward management dashboard
- **Department Officer** (विभाग अधिकारी) - Department oversight
- **Field Staff** (फील्ड स्टाफ) - Task management
- **Super Admin** (सुपर एडमिन) - System administration

### 🏠 Citizen Portal
- **Beautiful Landing Page** with Hindi branding
- **Issue Reporting Form** with category selection
- **Photo Upload** capability
- **Location Tracking**
- **Real-time Statistics** display
- **Recent Updates** section
- **Contact Information**

### 👩‍💼 Ward Officer Dashboard
- **Statistics Overview** with animated cards
- **Report Management** with filtering
- **Task Assignment** to field staff
- **Status Updates** with comments
- **List and Map Views**
- **Priority-based Color Coding**
- **Hindi Interface** throughout

### 🔔 Notification System
- **Real-time Notifications** with badge counts
- **Priority-based Notifications**
- **Mark as Read/Unread** functionality
- **Beautiful Dropdown Interface**
- **Hindi Notification Text**

### 🎯 Key Technologies
- **React 19.1.1** - Latest React version
- **Tailwind CSS 4.1.12** - Modern CSS framework
- **React Router DOM** - Navigation
- **React Toastify** - Beautiful notifications
- **Custom Hindi Fonts** - Noto Sans Devanagari
- **Modern JavaScript** - ES6+ features

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd civic-connect
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔑 Demo Login Credentials

### Ward Officer (वार्ड अधिकारी)
- **Email:** ward@civic.com
- **Password:** password
- **Dashboard:** /ward-dashboard

### Department Officer (विभाग अधिकारी)  
- **Email:** dept@civic.com
- **Password:** password
- **Dashboard:** /department-dashboard

### Field Staff (फील्ड स्टाफ)
- **Email:** field@civic.com
- **Password:** password
- **Dashboard:** /field-dashboard

### Super Admin (सुपर एडमिन)
- **Email:** admin@civic.com
- **Password:** password
- **Dashboard:** /admin-dashboard

## 📱 Pages Overview

### 🏠 Home Page (/)
- **Beautiful Hero Section** with Hindi branding
- **Issue Reporting Form** with 6 categories
- **Recent Updates** sidebar
- **Statistics Display**
- **Contact Information**

### 🔐 Login Page (/login)
- **Gradient Background** with animations
- **Demo Account Cards** for easy access
- **Beautiful Form Design**
- **Auto-fill Credentials**
- **Hindi Interface**

### 👩‍💼 Ward Officer Dashboard (/ward-dashboard)
- **Statistics Cards** with hover effects
- **Advanced Filtering** system
- **Task Assignment** dialogs
- **Status Update** functionality
- **List/Map View** toggle
- **Hindi Labels** throughout

## 🎨 Design Features

### Color Scheme
- **Primary:** Blue gradient (#3b82f6 to #8b5cf6)
- **Success:** Green (#22c55e)
- **Warning:** Orange/Yellow (#f59e0b)
- **Error:** Red (#ef4444)
- **Background:** Light gray (#f9fafb)

### Typography
- **Hindi Text:** Noto Sans Devanagari
- **English Text:** Inter
- **Font Weights:** 400, 500, 600, 700

### Components
- **Cards:** Rounded corners, subtle shadows
- **Buttons:** Gradient backgrounds, hover effects
- **Forms:** Clean inputs with focus states
- **Navigation:** Modern nav with dropdowns
- **Notifications:** Beautiful dropdown system

## 🚀 Features Implemented

### ✅ Core Features
- [x] Role-based authentication
- [x] Beautiful UI with Tailwind CSS
- [x] Hindi language support
- [x] Responsive design
- [x] Citizen portal with issue reporting
- [x] Ward officer dashboard
- [x] Notification system
- [x] Form validation
- [x] Loading states
- [x] Error handling

### ✅ UI/UX Features
- [x] Custom gradients and animations
- [x] Hover effects and transitions
- [x] Loading spinners
- [x] Toast notifications
- [x] Modal dialogs
- [x] Dropdown menus
- [x] Responsive navigation
- [x] Beautiful cards and layouts

## 📂 Project Structure

```
civic-connect/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   ├── ProtectedRoute.js
│   │   │   │   └── SevaNotificationSystem.js
│   │   │   └── Layout/
│   │   │       ├── SevaNavbar.js
│   │   │       └── SevaFooter.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── NewCitizenPortal.js
│   │   │   ├── NewLogin.js
│   │   │   └── NewWardOfficerDashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 🎯 Usage Guide

### For Citizens
1. Visit the homepage
2. Fill the complaint form
3. Select category and upload photo
4. Submit the report
5. Track status updates

### For Staff Members
1. Go to login page
2. Click on role demo card
3. Login automatically
4. Access role-specific dashboard
5. Manage reports and tasks

### Navigation
- **सेवा Track Logo** - Return to home
- **Dashboard Button** - Go to role dashboard  
- **Notification Bell** - View notifications
- **Profile Avatar** - User menu

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to customize colors:
```javascript
colors: {
  civic: {
    500: '#0ea5e9', // Primary civic blue
    600: '#0284c7', // Darker blue
  }
}
```

### Hindi Text
Add new Hindi text in components:
```jsx
<span className="hindi-text">आपका हिंदी टेक्स्ट</span>
```

### Animations
Custom animations in `index.css`:
```css
.loading-spinner {
  animation: spin 1s linear infinite;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Kill existing process or use different port
   
2. **Tailwind Classes Not Working**
   - Ensure postcss and tailwind are properly configured
   
3. **Hindi Fonts Not Loading**
   - Check Google Fonts import in index.css

## 📈 Performance

- **Fast Loading** with optimized components
- **Smooth Animations** with CSS transitions
- **Responsive Design** for all devices
- **Efficient Rendering** with React best practices

## 🎉 Project Highlights

This civic management system features:

✨ **Beautiful Hindi Interface** with देवनागरी support  
✨ **Modern Tailwind Design** with gradients and animations  
✨ **Perfect Responsive Layout** for all screen sizes  
✨ **Role-Based Dashboards** for different user types  
✨ **Real-Time Notifications** with priority system  
✨ **Comprehensive Forms** with validation  
✨ **Professional UI Components** with hover effects  
✨ **Error-Free Code** with proper error handling  

---

## 👨‍💻 Developer Information

**Built with ❤️ using:**
- React 19.1.1
- Tailwind CSS 4.1.12  
- Modern JavaScript
- Hindi Language Support

**Ready for production use** with beautiful design and perfect functionality!

Open `http://localhost:3000` to see the application in action! 🚀