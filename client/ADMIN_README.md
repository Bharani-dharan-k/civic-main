# SevaTrack - Admin Dashboard

A modern, responsive admin dashboard for managing civic issue reporting system.

## 🚀 Features

### 1. **Admin Authentication**
- Secure login with email/password validation
- Demo credentials: `admin@civic.gov.in` / `admin123`
- Session management with JWT tokens
- Auto-redirect after login

### 2. **Dashboard Overview**
- Real-time statistics cards (Total Issues, In Progress, Resolved, Response Time)
- Recent issues list with status indicators
- Department performance overview
- Quick action buttons for common tasks

### 3. **Issue Management**
- Comprehensive issues table with filtering and search
- Filter by status, category, priority, and date
- Detailed issue view modal with images and location
- Status update actions (Assign, In Progress, Resolved)
- Bulk actions support

### 4. **Department Management**
- CRUD operations for civic departments
- Department performance tracking
- Contact information management
- Icon and color customization
- Active/resolved issues counters

### 5. **Analytics & Reports**
- Interactive charts and graphs
- Issue trends over time
- Category distribution analysis
- Department performance metrics
- Exportable reports
- Location-based heatmap (placeholder)

### 6. **Settings Management**
- **Profile Settings**: Personal information, contact details
- **Security Settings**: Password change functionality
- **Notification Preferences**: Email, SMS, push notifications
- **System Configuration**: Auto-assignment, file upload limits

## 🎨 Design Features

### **Modern UI Components**
- Clean, minimal design with soft shadows
- Responsive layout (mobile-first approach)
- Smooth animations with Framer Motion
- India flag color theme (Saffron #FF9933, White, Green #138808, Navy Blue #000080)
- Glassmorphism effects and backdrop blur

### **Navigation**
- Collapsible sidebar navigation
- Top navbar with search, notifications, profile dropdown
- Breadcrumb navigation
- Mobile-responsive hamburger menu

### **Interactive Elements**
- Hover effects and smooth transitions
- Loading states and form validation
- Modal overlays for detailed views
- Toast notifications (ready for implementation)

## 🛠️ Tech Stack

### **Frontend**
- **React 19** with functional components and hooks
- **Vite** for fast development and building
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for modern icons

### **State Management**
- Local state with useState
- Context API for authentication
- LocalStorage for session persistence

### **Form Handling**
- Controlled components
- Real-time validation
- Error state management

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px (stacked layout, collapsible sidebar)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (full sidebar, grid layouts)

### **Layout Components**
- Flexible grid systems
- Adaptive card layouts
- Collapsible navigation
- Responsive tables with horizontal scroll

## 🔐 Security Features

### **Authentication**
- JWT token-based authentication
- Protected routes with AdminProtectedRoute component
- Automatic logout on token expiration
- Session persistence across browser refreshes

### **Form Security**
- Input validation and sanitization
- Password strength requirements
- Protected API endpoints simulation
- CSRF protection ready

## 🧩 Component Architecture

```
src/
├── components/
│   ├── Admin/
│   │   ├── AdminLayout.jsx          # Main layout with sidebar/navbar
│   │   └── AdminProtectedRoute.jsx  # Route protection wrapper
│   ├── Common/
│   │   ├── AshokaChakra.jsx        # Symbolic component
│   │   └── Button.jsx              # Reusable button component
│   └── UI/
│       └── [Future UI components]
├── pages/
│   └── Admin/
│       ├── AdminLogin.jsx          # Authentication page
│       ├── AdminDashboard.jsx      # Main dashboard
│       ├── ManageIssues.jsx        # Issues management
│       ├── DepartmentsManagement.jsx # Departments CRUD
│       ├── Analytics.jsx           # Reports and charts
│       └── Settings.jsx            # System configuration
└── context/
    └── AuthContext.jsx             # Authentication state management
```

## 🎯 Key User Flows

### **Admin Login**
1. Visit `/admin/login`
2. Enter credentials (demo: admin@civic.gov.in / admin123)
3. Successful login redirects to `/admin/dashboard`
4. Failed login shows error message

### **Issue Management**
1. Navigate to "Manage Issues" from sidebar
2. View issues in filterable table format
3. Click "View" to open detailed modal
4. Use action buttons to update status
5. Filter by status/category for specific views

### **Department Management**
1. Go to "Departments" section
2. View existing departments with statistics
3. Click "Add Department" to create new one
4. Edit existing departments with pencil icon
5. Delete departments with confirmation dialog

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Demo Access**
- **URL**: http://localhost:3001/admin/login
- **Email**: admin@civic.gov.in
- **Password**: admin123

## 🔧 Configuration

### **Environment Variables** (Future Enhancement)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_SECRET=your-jwt-secret
REACT_APP_GOOGLE_MAPS_KEY=your-maps-key
```

### **Customization**
- **Colors**: Update Tailwind config for theme colors
- **Icons**: Replace Lucide icons with preferred icon library
- **Layout**: Modify AdminLayout component for different structures
- **Charts**: Integrate Recharts for real data visualization

## 📈 Future Enhancements

### **Planned Features**
- [ ] Real backend API integration
- [ ] Advanced charts with Recharts
- [ ] Google Maps integration for location heatmap
- [ ] Real-time notifications with WebSockets
- [ ] File upload functionality
- [ ] Advanced filtering and sorting
- [ ] Bulk operations for issues
- [ ] Export functionality (PDF, CSV)
- [ ] Multi-language support
- [ ] Dark mode toggle

### **Performance Optimizations**
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle size optimization

## 🐛 Known Issues

1. **Tailwind CSS Warnings**: @apply directives show lint warnings (non-breaking)
2. **Animation Delays**: Some animations may be delayed on slower devices
3. **Mobile Responsiveness**: Tables need horizontal scroll on very small screens

## 💡 Usage Tips

### **Best Practices**
1. **Navigation**: Use sidebar for main sections, top nav for global actions
2. **Filtering**: Combine search with filters for better issue discovery
3. **Status Updates**: Use bulk actions for efficiency when managing many issues
4. **Mobile Usage**: Sidebar auto-collapses on mobile, use hamburger menu

### **Keyboard Shortcuts** (Future Enhancement)
- `Ctrl+K`: Open search
- `Esc`: Close modals
- `Ctrl+N`: New issue/department

## 📞 Support

For technical support or feature requests:
- **Email**: admin@civic.gov.in
- **Documentation**: Built-in help tooltips
- **Demo**: Full demo with sample data included

---

**Built with ❤️ for Digital India Initiative**
*Empowering citizens through technology-driven civic engagement*
