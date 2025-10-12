# ProjectHub - Comprehensive Project Management System

A full-stack project management application designed specifically for electrical and IT projects, built with Next.js 15, PostgreSQL, and Prisma.

## 🚀 Features

### Core Modules
- **Dashboard** - Real-time project analytics and KPIs
- **Project Management** - Complete project lifecycle management
- **Task Management** - Task assignment, dependencies, and progress tracking
- **Resource Management** - Manpower, equipment, and material tracking
- **Budget & Financials** - Cost estimation and actual spending tracking
- **Risk & Issue Tracking** - Risk identification, mitigation, and resolution
- **Document Management** - File uploads and document organization
- **Activity Logging** - Comprehensive audit trail
- **Notifications** - Real-time updates and reminders

### Role-Based Access Control
- **System Admin** - Full system access
- **Project Manager** - Project and team management
- **Field/Site Engineer** - Task execution and reporting
- **IT Developer/Technical Team** - Technical implementation
- **Client/Stakeholder** - View-only access

### Technical Features
- JWT-based authentication
- RESTful API with Next.js API routes
- PostgreSQL database with Prisma ORM
- Responsive UI with Tailwind CSS and shadcn/ui
- Real-time updates with WebSocket support
- File upload and management
- Advanced filtering and search
- Data visualization with charts

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **UI**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT tokens with bcrypt password hashing
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd pmo
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/projecthub"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔐 Default Login Credentials

After seeding the database, you can login with:

- **Admin**: `admin@projecthub.com` / `admin123`
- **Manager**: `manager@projecthub.com` / `manager123`  
- **Engineer**: `engineer@projecthub.com` / `engineer123`

## 📁 Project Structure

```
src/
├── app/
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/           # Dashboard page
│   │   ├── projects/            # Project management
│   │   ├── tasks/               # Task management
│   │   ├── resources/           # Resource management
│   │   ├── budget/              # Budget tracking
│   │   ├── risks/               # Risk management
│   │   ├── documents/           # Document management
│   │   ├── users/               # User management
│   │   └── settings/            # Application settings
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── projects/            # Project CRUD operations
│   │   ├── tasks/               # Task management
│   │   ├── users/               # User management
│   │   ├── resources/           # Resource management
│   │   ├── budgets/             # Budget tracking
│   │   ├── risks/               # Risk management
│   │   ├── documents/           # Document management
│   │   ├── activity-logs/       # Activity logging
│   │   └── dashboard/           # Dashboard analytics
│   ├── login/                   # Login page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (redirects to login/dashboard)
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── navigation.tsx           # Main navigation component
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Database connection
│   ├── middleware.ts            # API middleware
│   └── utils.ts                 # Utility functions
└── types/
    └── index.ts                 # TypeScript type definitions
```

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Roles** - User management with role-based permissions
- **Projects** - Project information, status, and metadata
- **Tasks** - Task breakdown with dependencies and assignments
- **Milestones** - Project milestone tracking
- **Resources** - Resource allocation and management
- **Budgets** - Financial planning and tracking
- **Risks** - Risk identification and mitigation
- **Documents** - File management and organization
- **Activity Logs** - Audit trail and activity tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - List projects (with filtering)
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Users & Roles
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `PUT /api/users/[id]/change-password` - Change password
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### Budget & Financials
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget entry

### Risk Management
- `GET /api/risks` - List risks
- `POST /api/risks` - Create risk

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document

### Analytics
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/activity-logs` - Activity log

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Role-based access control (RBAC)
- API route protection with middleware
- Input validation with Zod schemas
- SQL injection prevention with Prisma ORM
- XSS protection with React's built-in escaping

## 📊 Dashboard Features

- **Project Statistics** - Total, active, and completed projects
- **Task Analytics** - Task completion rates and overdue tasks
- **Budget Overview** - Estimated vs actual costs
- **Risk Monitoring** - High-priority risk alerts
- **Progress Tracking** - Visual progress indicators
- **Recent Activity** - Latest project and task updates
- **Charts & Graphs** - Interactive data visualization

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
# Database (use production PostgreSQL URL)
DATABASE_URL="postgresql://username:password@your-db-host:5432/projecthub"

# JWT Secret (use a strong, unique secret)
JWT_SECRET="your-production-jwt-secret"

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
```

### Database Migration for Production

```bash
# Generate and apply migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Database operations
npm run db:push          # Push schema changes
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed with sample data

# Linting and formatting
npm run lint             # Run ESLint
```

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core project management
- ✅ Task management with dependencies
- ✅ User management and RBAC
- ✅ Dashboard and analytics
- ✅ Document management

### Phase 2 (Next)
- 🔄 Advanced reporting and exports
- 🔄 Mobile application
- 🔄 Real-time notifications
- 🔄 Integration with external tools
- 🔄 Advanced workflow automation

### Phase 3 (Future)
- 📋 AI-powered project insights
- 📋 Advanced resource optimization
- 📋 Multi-tenant support
- 📋 Advanced analytics and ML
- 📋 Mobile app with offline support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**ProjectHub** - Streamlining project management for electrical and IT professionals.