# 🚀 PMO Project Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)](https://tailwindcss.com/)

A comprehensive Project Management System designed specifically for electrical and IT projects, featuring role-based access control, real-time collaboration, and advanced project tracking capabilities.

## 🎯 **Overview**

PMO (Project Management Office) Hub is a modern, full-stack project management application built with Next.js 15, featuring:

- **Complete CRUD Operations** for Projects, Tasks, Resources, and Budgets
- **Role-Based Access Control** with 3-tier permission system
- **Real-time Dashboard** with analytics and reporting
- **Document Management** system with file uploads
- **Activity Logs** and comprehensive audit trail
- **Responsive UI** with modern design principles
- **Secure Authentication** with JWT tokens
- **Project Filtering** and user-specific data access

## 🏗️ **Tech Stack**

### **Frontend & Backend**
- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **React** - Component-based UI library

### **Database & ORM**
- **PostgreSQL 17** - Robust relational database
- **Prisma** - Modern database toolkit and ORM
- **Database**: `pmo_db` with `tbl_` prefix

### **Authentication & Security**
- **JWT (jose library)** - Secure token-based authentication
- **bcryptjs** - Password hashing and security
- **Role-Based Access Control** - Granular permission system

### **UI Components**
- **shadcn/ui** - Modern, accessible component library
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications
- **Recharts** - Data visualization charts

## 👥 **Role System**

### **🔴 Admin Role**
- Complete system access
- User management and role assignment
- System configuration and settings
- Full project and task oversight
- Budget and resource management
- Activity logs and audit trail

### **🟡 Project Manager Role**
- Project creation and management
- Team coordination and task assignment
- Budget control and approval
- Resource allocation
- Progress monitoring
- Document management

### **🔵 Engineer/User Role**
- Task execution and progress updates
- Document access and uploads
- Project information viewing (assigned projects only)
- Activity log access

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL 17
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tahatra21/pmohub.git
   cd pmohub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/pmo_db"
   JWT_SECRET="your-secret-key"
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Run the database setup script
   chmod +x setup-database.sh
   ./setup-database.sh
   ```

5. **Run database migrations**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 🔐 **Default Users**

After seeding the database, you can login with:

- **Admin**: `admin@projecthub.com` / `admin123`
- **Project Manager**: `manager@projecthub.com` / `manager123`  
- **Engineer**: `engineer@projecthub.com` / `engineer123`

## 📊 **Features**

### **Project Management**
- Create and manage projects with different types
- Project status tracking (Planning, In Progress, Review, Completed)
- Priority levels and progress monitoring
- Team assignment and collaboration
- Timeline management with milestones

### **Task Management**
- Task creation and assignment
- Progress tracking with percentage completion
- Task dependencies and relationships
- Status workflow (TODO → In Progress → Review → Completed)
- Priority management and deadline tracking

### **Resource Management**
- Person in Charge (PIC) allocation
- Resource availability tracking
- Resource allocation to projects and tasks
- Skill and expertise management

### **Budget Management**
- Budget planning and tracking
- Actual vs estimated cost monitoring
- Budget categories (Equipment, Labor, Materials, Other)
- Currency formatting in Rupiah (IDR)
- Budget approval workflows

### **Document Management**
- File upload and storage
- Document categorization
- Version control and access management
- Download and sharing capabilities

### **Dashboard & Analytics**
- Real-time project overview
- Progress visualization with charts
- Budget utilization tracking
- Deadline alerts and notifications
- Performance metrics and KPIs

### **Security & Permissions**
- JWT-based authentication
- Role-based access control
- Granular permission system
- Secure password hashing
- Session management
- Audit trail and activity logging

## 🗃️ **Database Schema**

The application uses a comprehensive database schema with the following key tables:

- `tbl_users` - User management
- `tbl_roles` - Role definitions and permissions
- `tbl_projects` - Project data and metadata
- `tbl_tasks` - Task management and tracking
- `tbl_project_members` - Project-team relationships
- `tbl_resources` - Resource management
- `tbl_resource_allocations` - Resource assignments
- `tbl_budgets` - Budget tracking and management
- `tbl_budget_types` - Budget categories
- `tbl_project_types` - Project type definitions
- `tbl_milestones` - Project milestones
- `tbl_attachments` - Document management
- `tbl_activity_logs` - Comprehensive audit trail

## 🔄 **API Endpoints**

The application provides a comprehensive REST API:

### **Authentication**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

### **Projects**
- `GET /api/projects` - List projects (with filtering)
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### **Tasks**
- `GET /api/tasks` - List tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### **Resources**
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### **Budget**
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget entry
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### **Dashboard**
- `GET /api/dashboard` - Dashboard analytics and metrics

## 🛠️ **Development**

### **Project Structure**
```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/   # Protected routes
│   ├── api/              # API routes
│   └── login/            # Authentication pages
├── components/           # Reusable components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## 🚀 **Deployment**

### **Environment Setup**
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Seed initial data
5. Build and deploy application

### **Production Considerations**
- Use environment-specific database configurations
- Set up proper backup strategies
- Configure reverse proxy (nginx)
- Enable HTTPS and security headers
- Set up monitoring and logging

## 📈 **Performance Features**

- **Optimized Database Queries** - Efficient Prisma queries
- **Real-time Updates** - Immediate UI updates
- **Responsive Design** - Mobile-first approach
- **Caching Strategy** - Strategic data caching
- **Lazy Loading** - Component-based lazy loading
- **Pagination** - Efficient data pagination

## 🔒 **Security Features**

- **Authentication** - JWT token-based authentication
- **Authorization** - Role-based access control
- **Data Protection** - SQL injection and XSS protection
- **Secure Headers** - Security headers implementation
- **Password Security** - bcrypt password hashing
- **Session Management** - Secure session handling

## 📱 **Browser Support**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Developer**: Jonathan Maharyuda
- **Repository**: [Tahatra21/pmohub](https://github.com/Tahatra21/pmohub)

## 🆘 **Support**

For support and questions:
- Create an issue in this repository
- Check the troubleshooting guide in `/troubleshooting-guide.md`
- Review the deployment checklist in `/DEPLOYMENT_CHECKLIST.md`

## 🎯 **Roadmap**

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Third-party integrations
- [ ] AI-powered task assignment
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API rate limiting and caching

---

**Built with ❤️ for efficient project management**