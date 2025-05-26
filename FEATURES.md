# MosqueConnect - Community Management Platform

A comprehensive Next.js application for managing mosque communities, volunteers, businesses, and events with role-based access control and real-time management capabilities.

## 🌟 Features Overview

### 🔐 Authentication & Authorization
- **NextAuth.js Integration** - Secure authentication system with multiple providers
- **Role-Based Access Control** - Admin, Imam, Business, and User roles
- **Session Management** - Persistent login sessions with JWT tokens
- **Protected Routes** - Route protection based on user roles and permissions
- **User Registration & Login** - Complete authentication flow with email verification

### 👥 User Management System

#### User Features:
- **Profile Management** - Complete CRUD operations for user profiles
- **Account Settings** - Personal preferences and account configuration
- **Role-Based Navigation** - Dynamic navigation based on user role
- **Avatar & Profile Pictures** - User avatar management with fallback initials

#### Admin User Management:
- **User Dashboard** - Comprehensive user administration
- **User Statistics** - Growth metrics, active users, verification status
- **User Search & Filtering** - Advanced search by role, verification status
- **Bulk User Operations** - Manage multiple users simultaneously
- **User Analytics** - Registration trends and user activity metrics

### 🕌 Mosque Management System

#### For Imams:
- **Mosque Registration** - Complete mosque profile creation
- **Mosque Dashboard** - Centralized mosque management interface
- **Service Management** - Add/edit mosque services and facilities
- **Prayer Times** - Manage and display prayer schedules
- **Event Management** - Create and manage mosque events
- **Volunteer Coordination** - Manage volunteer applications and assignments

#### For Admins:
- **Mosque Approval System** - Review and approve mosque registrations
- **Mosque Analytics** - Statistics on mosque registrations and activities
- **Bulk Mosque Management** - Administrative oversight of all mosques
- **Mosque Verification** - Verification process for mosque authenticity

### 🤝 Comprehensive Volunteer Management System

#### For Volunteers (Regular Users):
- **Volunteer Dashboard** - Personal volunteer activity center
  - Volunteer status overview with statistics
  - Application tracking and history
  - General offers management
  - Activity timeline and history

- **Volunteer Profile & Settings**:
  - Skills and expertise management
  - Availability scheduling (days, time slots, hours per week)
  - Contact preferences (email, phone)
  - Certificates and qualifications
  - Volunteer bio and experience
  - Complete CRUD operations for profile data

- **Application System**:
  - Apply to volunteer at specific mosques
  - Track application status (pending, accepted, rejected)
  - View application history and feedback
  - Category-based applications (education, events, maintenance, etc.)

- **General Volunteer Offers**:
  - Create general volunteer service offerings
  - Manage offer status (active/inactive)
  - Edit and delete volunteer offers
  - Skills-based offering system

- **Activity History**:
  - Complete timeline of volunteer activities
  - Application submissions and status changes
  - Offer creation and updates
  - Profile modifications tracking

#### For Imams:
- **Imam Volunteer Dashboard** - Mosque-specific volunteer management
  - Review incoming volunteer applications
  - Accept/reject applications with feedback
  - Assign volunteers to specific roles and tasks
  - Track volunteer performance and hours
  - Direct communication with volunteers

#### For Admins:
- **System-wide Volunteer Oversight**:
  - Monitor all volunteer activities across the platform
  - Volunteer statistics and analytics
  - Application approval workflows
  - Volunteer data management and reporting

### 🏢 Business Management System
- **Business Registration** - Local businesses can join the platform
- **Business Profiles** - Detailed business information and services
- **Business Categories** - Categorized business listings
- **Business Dashboard** - Business owners can manage their listings
- **Admin Business Management** - Administrative oversight of business listings

### 📊 Analytics & Reporting

#### Admin Analytics:
- **User Analytics**:
  - Total user count and growth metrics
  - User registration trends (7-day and 30-day)
  - Users by role distribution
  - Verification status metrics
  - Active user tracking

- **Mosque Analytics**:
  - Mosque registration statistics
  - Approval status distribution
  - Geographic distribution of mosques
  - Top mosques by volunteer applications

- **Volunteer Analytics**:
  - Total volunteer applications and status
  - Volunteer offer statistics
  - Top performing mosques for volunteers
  - Volunteer activity trends

- **System Performance Metrics**:
  - Database performance monitoring
  - API response time tracking
  - User activity levels

### 🛠 Technical Features

#### Architecture:
- **Next.js 13+ with App Router** - Modern React framework
- **TypeScript Support** - Type-safe development
- **MongoDB with Mongoose** - NoSQL database with ODM
- **NextAuth.js** - Authentication and session management
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI Components** - Modern UI component library

#### Database Models:
- **User Model** - Complete user information with volunteer fields
- **VolunteerApplication Model** - Volunteer applications with status tracking
- **VolunteerOffer Model** - General volunteer offerings
- **Mosque Model** - Mosque information and services
- **Business Model** - Business listings and details

#### API Routes:
- **User Management APIs** - `/api/admin/users/*`, `/api/user/*`
- **Volunteer APIs** - `/api/user/volunteer/*`, `/api/imam/volunteers/*`
- **Mosque APIs** - `/api/admin/mosques/*`, `/api/mosques/*`
- **Analytics APIs** - `/api/admin/stats/*`
- **Authentication APIs** - `/api/auth/*`

### 🎨 User Interface Features

#### Navigation:
- **Dynamic Navigation Bar** - Role-based menu items
- **User Dropdown Menu** - Profile, settings, and role-specific dashboards
- **Mobile-Responsive Design** - Mobile menu with full functionality
- **Active Route Highlighting** - Visual indication of current page

#### Dashboard Interfaces:
- **Admin Dashboard** - Comprehensive system overview with analytics
- **Imam Dashboard** - Mosque-specific management tools
- **Volunteer Dashboard** - Personal volunteer management center
- **Business Dashboard** - Business management interface

#### Form Management:
- **Volunteer Profile Form** - Complex form with skills, availability, certificates
- **Dynamic Form Elements** - Add/remove skills, certificates, time slots
- **Form Validation** - Client and server-side validation
- **Real-time Updates** - Immediate feedback on form submissions

### 🔄 Real-time Features
- **Status Updates** - Real-time volunteer application status changes
- **Activity Tracking** - Live activity feeds and history
- **Notification System** - Toast notifications for user actions
- **Dynamic Content Updates** - Auto-refresh of data without page reload

### 📱 Responsive Design
- **Mobile-First Approach** - Optimized for mobile devices
- **Tablet Compatibility** - Responsive design for all screen sizes
- **Touch-Friendly Interface** - Mobile-optimized interactions
- **Progressive Web App Ready** - PWA capabilities

### 🔒 Security Features
- **Role-Based Access Control** - Granular permission system
- **API Route Protection** - All APIs protected with authentication
- **Session Management** - Secure session handling
- **Data Validation** - Input validation and sanitization
- **CSRF Protection** - Cross-site request forgery protection

### 📈 Performance Features
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Optimized static pages where possible
- **Database Optimization** - Efficient queries with pagination
- **Caching Strategy** - Strategic caching for better performance
- **Image Optimization** - Next.js image optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Bun package manager (recommended)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd mosque-connect

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the development server
bun dev
```

### Environment Variables
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URI=your-mongodb-connection-string
```

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and management
│   ├── dashboard/         # Role-specific dashboards
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   ├── layout/           # Layout components
│   └── volunteer/        # Volunteer-specific components
├── models/               # Mongoose database models
├── lib/                  # Utility functions and configurations
└── hooks/                # Custom React hooks
```

## 🎯 Key User Flows

### Volunteer User Journey:
1. **Registration** → User creates account
2. **Activation** → User activates volunteer status
3. **Profile Setup** → Complete volunteer profile with skills/availability
4. **Apply/Offer** → Apply to mosques or create general offers
5. **Management** → Track applications and manage offers through dashboard

### Imam User Journey:
1. **Registration** → Imam creates account
2. **Mosque Setup** → Register and configure mosque profile
3. **Volunteer Management** → Review and manage volunteer applications
4. **Coordination** → Assign and communicate with volunteers

### Admin User Journey:
1. **System Oversight** → Monitor all platform activities
2. **Approvals** → Review and approve mosques/users
3. **Analytics** → Generate reports and insights
4. **Management** → Bulk operations and system maintenance

## 🔧 Development Features

### Code Quality:
- **TypeScript** - Type safety throughout the application
- **ESLint & Prettier** - Code formatting and linting
- **Component Testing** - Unit tests for critical components
- **API Testing** - Comprehensive API endpoint testing

### Development Tools:
- **Hot Reload** - Fast development iteration
- **Error Boundaries** - Graceful error handling
- **Debug Tools** - Development debugging capabilities
- **Performance Monitoring** - Built-in performance tracking

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### User Management
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/users/stats` - User statistics (Admin)
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/profile` - Get user profile

### Volunteer Management
- `GET /api/user/volunteer/status` - Get volunteer status
- `PATCH /api/user/volunteer/status` - Update volunteer status
- `GET /api/user/volunteer/applications` - Get user applications
- `POST /api/user/volunteer/applications` - Create application
- `GET /api/user/volunteer/offers` - Get user offers
- `POST /api/user/volunteer/offers` - Create offer
- `PUT /api/user/volunteer/offers/[id]` - Update offer
- `DELETE /api/user/volunteer/offers/[id]` - Delete offer
- `GET /api/user/volunteer/profile` - Get volunteer profile
- `PUT /api/user/volunteer/profile` - Update volunteer profile
- `GET /api/user/volunteer/activity` - Get activity history

### Imam Volunteer Management
- `GET /api/imam/volunteers` - Get mosque volunteers
- `GET /api/volunteers/applications/[id]` - Get specific application
- `PATCH /api/volunteers/applications/[id]` - Update application status

### Admin Analytics
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/volunteers` - Volunteer analytics
- `GET /api/admin/mosques` - Mosque analytics

## 🔍 Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: ['user', 'imam', 'business', 'admin'],
  volunteerStatus: ['active', 'inactive'],
  volunteerSkills: [String],
  volunteerAvailability: {
    days: [String],
    timeSlots: [String],
    hoursPerWeek: Number
  },
  volunteerContactPreferences: {
    email: Boolean,
    phone: Boolean,
    preferredMethod: String
  },
  volunteerCertificates: [String],
  volunteerBio: String,
  volunteerExperience: String
}
```

### VolunteerApplication Model
```javascript
{
  userId: ObjectId,
  mosqueId: ObjectId,
  category: String,
  message: String,
  skills: [String],
  availability: Object,
  status: ['pending', 'accepted', 'rejected'],
  createdAt: Date,
  updatedAt: Date
}
```

### VolunteerOffer Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  availability: Object,
  skills: [String],
  status: ['active', 'inactive'],
  isGeneralOffer: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

### Development Workflow:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards:
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Ensure responsive design compatibility

## 📝 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments
- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- MongoDB team for the robust database solution
- NextAuth.js for authentication solutions

---

**MosqueConnect** - Connecting communities, empowering volunteers, building stronger mosque networks.

For support or questions, please open an issue on GitHub or contact the development team.