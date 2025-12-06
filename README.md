# Partnership Management System (PMS)

A comprehensive full-stack application for managing partnerships, requests, and internal workflows.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pms
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Copy .env.example to .env and configure
   cp .env.example .env
   # Edit .env with your MongoDB URI and other configurations
   npm run dev
   ```

3. **Admin Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Copy .env.example to .env
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:5000 (or your backend URL)
   npm run dev
   ```

4. **User Frontend Setup**
   ```bash
   cd user-frontend
   npm install
   # Copy .env.example to .env
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:5000 (or your backend URL)
   npm run dev
   ```

## 📁 Project Structure

```
pms/
├── backend/              # Express.js API server
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Server entry point
│
├── frontend/            # Admin/Internal user frontend (React + Vite)
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── router/      # Routing configuration
│
└── user-frontend/       # External user frontend (React + Vite)
    └── src/
        ├── components/  # React components
        ├── pages/       # Page components
        ├── services/    # API services
        └── route/       # Routing configuration
```

## 🔧 Environment Variables

### Backend (.env)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/pms

# Server
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Frontend URLs (for CORS)
ADMIN_APP_URL=http://localhost:5173
USER_APP_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

### User Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🌐 Default Ports

- **Backend API**: `http://localhost:5000`
- **Admin Frontend**: `http://localhost:5173`
- **User Frontend**: `http://localhost:5174`

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

- `/health` - Health check endpoint
- `/internal` - Internal user routes
- `/admin` - Admin routes
- `/user` - User routes
- `/super-admin` - Super admin routes
- `/partners` - Partner management
- `/partnership-activities` - Partnership activities
- `/feedback` - Feedback system
- `/partnership-statistics` - Statistics and analytics

## 🛠️ Development

### Running in Development Mode

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start admin frontend: `cd frontend && npm run dev`
4. Start user frontend: `cd user-frontend && npm run dev`

### Building for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build

# User Frontend
cd user-frontend
npm run build
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration
- Input validation
- Secure password hashing (bcrypt)
- Protected API routes

## 🎨 UI/UX Features

- Modern, responsive design
- Loading states and error handling
- Toast notifications
- Smooth animations
- Accessible components
- Dark mode support (where applicable)

## 📝 Features

- **User Management**: Admin, Internal Users, External Users
- **Request Management**: Create, review, and track requests
- **Partner Management**: Manage partnerships and activities
- **Feedback System**: Collect and manage feedback
- **Statistics & Analytics**: Dashboard with insights
- **File Uploads**: Support for document attachments
- **Email Notifications**: Automated email system

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables are set
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend `.env` matches backend URL
- Check CORS configuration in backend
- Ensure backend is running

### CORS errors
- Add your frontend URL to `CORS_ORIGINS` in backend `.env`
- Or set `CORS_ORIGINS=*` for development (not recommended for production)

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🪟 Windows Server Deployment

For deploying on Windows Server and accessing from client computers, see:
- **[WINDOWS_SERVER_DEPLOYMENT.md](./WINDOWS_SERVER_DEPLOYMENT.md)** - Complete deployment guide
- **scripts/** folder - Windows batch scripts for easy setup

### Quick Windows Server Setup:

1. Run `scripts/get-server-ip.bat` to find your server IP
2. Update all `.env` files with the server IP address
3. Run `scripts/quick-deploy.bat` to install and configure
4. Run `scripts/start-all.bat` to start all services
5. Access from clients: `http://SERVER_IP:5173` (Admin) or `http://SERVER_IP:5174` (User)

## 📞 Support

For issues and questions, please open an issue on the repository.

