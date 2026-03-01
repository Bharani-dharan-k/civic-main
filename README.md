# 🏛️ Civic Management Platform

A comprehensive municipal governance and civic issue management system designed to streamline citizen complaints, task assignments, and administrative workflows across multiple hierarchical levels.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

The Civic Management Platform is a full-stack web application that enables efficient management of civic issues, complaints, and municipal operations. It provides a hierarchical task delegation system from district administrators down to field workers, ensuring accountability and transparency in civic governance.

### Key Highlights

- **Multi-level Administrative Hierarchy**: District Admin → Municipal Admin → Department Head → Field Worker
- **Citizen Portal**: Easy complaint submission with real-time tracking
- **Interactive Maps**: Geospatial visualization of civic issues
- **AI-Powered Image Classification**: Automated issue categorization
- **Real-time Analytics**: Comprehensive dashboards for all user roles
- **Task Management**: Complete lifecycle tracking from creation to resolution

## ✨ Features

### For Citizens
- 🔐 Secure registration and authentication
- 📝 Submit civic complaints with photo/video evidence
- 📍 Geolocation-based issue reporting
- 📊 Track complaint status in real-time
- 🗺️ Interactive map view of civic issues
- 💬 AI chatbot assistance (English & Tamil)
- 📱 Responsive mobile-friendly interface

### For Administrators
- 👥 **District Admin**: Oversee multiple municipalities
- 🏢 **Municipal Admin**: Manage departments and assign tasks
- 🧑‍💼 **Department Head**: Coordinate departmental tasks and field workers
- 👷 **Field Worker**: Execute assigned tasks on the ground
- 📈 Advanced analytics and reporting
- 🔔 Notification system
- 📊 Performance metrics and KPIs

### For Super Admin
- 🌐 System-wide oversight
- 👤 User management across all levels
- 🏛️ Municipality and department configuration
- 📉 Comprehensive analytics dashboard
- ⚙️ System settings and configurations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **UI Libraries**: 
  - Material-UI (MUI) 7.3.1
  - Tailwind CSS 4.1.12
  - Lucide React Icons
  - Framer Motion (animations)
- **Maps**: React Leaflet, Google Maps API
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.8.2
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer + Cloudinary
- **PDF Generation**: Puppeteer, jsPDF
- **Image Classification**: Custom service with external API integration

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Development**: Nodemon, Concurrently
- **Environment**: dotenv

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Citizen  │  │ Municipal│  │ Dept Head│  │  Field   │   │
│  │ Portal   │  │ Dashboard│  │ Dashboard│  │  Worker  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + MongoDB)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers  │  Routes  │  Middleware  │  Models    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Image Classifier Service (External API Integration)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Database + Cloudinary                   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)
- Git

### Clone Repository
```bash
git clone https://github.com/Bharani-dharan-k/civic-main.git
cd civic-main
```

### Backend Setup
```bash
cd server
npm install

# Create .env file with required variables
touch .env
```

**Required Environment Variables** (`.env`):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
IMAGE_CLASSIFIER_API_URL=your_classifier_service_url
```

### Frontend Setup
```bash
cd ../client
npm install

# Create .env file if needed
touch .env
```

**Optional Frontend Environment Variables**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Seed Database (Optional)
```bash
cd ../server
npm run seed:admin
node seedCitizens.js
node seedDepartments.js
node seedReports.js
```

## 💻 Usage

### Start Development Servers

**Backend** (Terminal 1):
```bash
cd server
npm run dev
# or run both services concurrently
npm run dev:concurrent
```

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```

### Access the Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

### Default Admin Credentials
```
Super Admin:
Email: admin@civic.com
Password: admin123

District Admin:
Email: district@example.com
Password: password123

Municipal Admin:
Email: municipal@example.com
Password: password123
```

## 👥 User Roles

### 1. **Citizen**
- Register and submit complaints
- Track complaint status
- View resolved issues in their area
- Access AI chatbot for assistance

### 2. **Field Worker**
- View assigned tasks
- Update task progress
- Upload completion evidence
- Mark tasks as completed

### 3. **Department Head**
- Manage departmental tasks
- Assign tasks to field workers
- Monitor team performance
- Approve completed tasks

### 4. **Municipal Admin**
- Oversee municipality operations
- Assign tasks to department heads
- Manage municipal staff
- Generate reports

### 5. **District Admin**
- Supervise multiple municipalities
- Allocate resources
- View district-wide analytics
- Manage municipal administrators

### 6. **Super Admin**
- System-wide control
- Create/manage all users and entities
- Configure system settings
- Access comprehensive analytics

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/admin-login       - Admin login
GET    /api/auth/me                - Get current user
```

### Report Endpoints
```
GET    /api/reports                - Get all reports
POST   /api/reports                - Create new report
GET    /api/reports/:id            - Get report by ID
PUT    /api/reports/:id            - Update report
DELETE /api/reports/:id            - Delete report
POST   /api/reports/:id/progress   - Update progress
```

### Task Endpoints
```
GET    /api/tasks                  - Get all tasks
POST   /api/tasks                  - Create new task
GET    /api/tasks/:id              - Get task by ID
PUT    /api/tasks/:id              - Update task
POST   /api/tasks/:id/assign       - Assign task
```

### Department Head Endpoints
```
GET    /api/department-head/tasks          - Get department tasks
GET    /api/department-head/field-workers  - Get field workers
POST   /api/department-head/tasks/:id/assign - Assign to field worker
GET    /api/department-head/stats          - Get department statistics
```

### Municipal Admin Endpoints
```
GET    /api/municipal/tasks        - Get municipal tasks
POST   /api/municipal/staff        - Add staff member
GET    /api/municipal/departments  - Get departments
GET    /api/municipal/analytics    - Get analytics
```

### Image Classification
```
POST   /api/classify-image         - Classify uploaded image
```

*For complete API documentation, see individual controller files in `/server/controllers`*

## 📁 Project Structure

```
civic-main/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/                   # Page components
│   │   │   ├── Admin/               # Admin-related pages
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── MunicipalDashboard.jsx
│   │   │   ├── DepartmentOfficerDashboardWithAPI.jsx
│   │   │   ├── FieldStaffDashboard.jsx
│   │   │   └── ...
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Express application
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── municipalController.js
│   │   ├── departmentHeadController.js
│   │   └── ...
│   ├── models/                      # MongoDB models
│   │   ├── User.js
│   │   ├── Report.js
│   │   ├── Task.js
│   │   ├── Department.js
│   │   └── ...
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── tasks.js
│   │   └── ...
│   ├── middleware/                  # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/                       # Utility functions
│   ├── server.js                    # Main server file
│   ├── image-classifier-service.js  # Image classification service
│   └── package.json
│
├── scripts/                         # Utility scripts
│   └── dump_current_user.js
│
├── FIELD_WORKER_ASSIGNMENT_GUIDE.md # Feature documentation
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
└── README.md                        # This file
```

## 🔧 Configuration

### MongoDB Collections
- **users** - All user accounts (citizens, admins, workers)
- **reports** - Citizen complaints and issues
- **tasks** - Task assignments and tracking
- **departments** - Department information
- **municipalities** - Municipality data
- **notifications** - System notifications
- **analytics** - Analytics and metrics data

### Key Features Configuration

#### Task Assignment Hierarchy
Tasks flow through the following delegation chain:
```
Citizen Report → Municipal Admin → Department Head → Field Worker
```

Each level can:
- View assigned tasks
- Update task status
- Delegate to next level
- Track completion

## 🧪 Testing

### Run Test Scripts
```bash
cd server

# Test authentication
node test_admin_login.js

# Test task assignment
node test_field_worker_assignment.js

# Test municipal tasks
node test_municipal_tasks.js

# Check database connections
node test_atlas_connection.js
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Use meaningful variable names
- Comment complex logic
- Write tests for new features

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- **Bharani Dharan K** - [GitHub](https://github.com/Bharani-dharan-k)

## 🙏 Acknowledgments

- Smart India Hackathon (SIH) for the project initiative
- All contributors and testers
- Open source community for amazing tools and libraries

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: [bharani.dharan.k@example.com](mailto:bharani.dharan.k@example.com)

---

**Built with ❤️ for better civic governance**
