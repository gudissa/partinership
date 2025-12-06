# Windows Server Deployment Guide

This guide will help you deploy the Partnership Management System on a Windows Server and access it from client computers on your network.

## 📋 Prerequisites

1. **Windows Server** (2016, 2019, 2022, or Windows 10/11 Pro)
2. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
3. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
4. **Firewall access** to ports 5000, 5173, 5174

## 🚀 Step-by-Step Deployment

### Step 1: Install Node.js and MongoDB

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install MongoDB Community Edition
3. Verify installations:
   ```powershell
   node --version
   npm --version
   mongod --version
   ```

### Step 2: Configure MongoDB

1. Start MongoDB service:
   ```powershell
   # As Administrator
   net start MongoDB
   ```

2. Or configure MongoDB to start automatically:
   - Open Services (services.msc)
   - Find "MongoDB" service
   - Set Startup Type to "Automatic"

### Step 3: Get Server IP Address

1. Open Command Prompt or PowerShell
2. Run:
   ```powershell
   ipconfig
   ```
3. Note your server's IP address (e.g., `192.168.1.100`)

### Step 4: Configure Backend

1. Navigate to backend folder:
   ```powershell
   cd E:\partnership\pms\backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```env
   # MongoDB - Use server IP or localhost
   MONGO_URI=mongodb://localhost:27017/pms
   
   # Server Configuration
   PORT=5000
   HOST=0.0.0.0
   NODE_ENV=production
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   
   # Frontend URLs - Use SERVER IP ADDRESS
   ADMIN_APP_URL=http://192.168.1.100:5173
   USER_APP_URL=http://192.168.1.100:5174
   FRONTEND_BASE_URL=http://192.168.1.100:5173
   
   # CORS - Add all client IPs or use wildcard for development
   CORS_ORIGINS=http://192.168.1.100:5173,http://192.168.1.100:5174,http://192.168.1.100:3000
   ```

   **Replace `192.168.1.100` with your actual server IP address!**

### Step 5: Configure Frontend (Admin)

1. Navigate to frontend folder:
   ```powershell
   cd E:\partnership\pms\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file:
   ```env
   # Backend API URL - Use SERVER IP ADDRESS
   VITE_API_URL=http://192.168.1.100:5000
   ```

4. Build for production:
   ```powershell
   npm run build
   ```

### Step 6: Configure User Frontend

1. Navigate to user-frontend folder:
   ```powershell
   cd E:\partnership\pms\user-frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file:
   ```env
   # Backend API URL - Use SERVER IP ADDRESS
   VITE_API_URL=http://192.168.1.100:5000
   
   # Google OAuth (optional)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. Build for production:
   ```powershell
   npm run build
   ```

### Step 7: Configure Windows Firewall

1. Open Windows Defender Firewall with Advanced Security
2. Create Inbound Rules for:
   - **Port 5000** (Backend API)
   - **Port 5173** (Admin Frontend)
   - **Port 5174** (User Frontend)

   Or use PowerShell (as Administrator):
   ```powershell
   # Backend API
   New-NetFirewallRule -DisplayName "PMS Backend API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   
   # Admin Frontend
   New-NetFirewallRule -DisplayName "PMS Admin Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
   
   # User Frontend
   New-NetFirewallRule -DisplayName "PMS User Frontend" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
   ```

### Step 8: Start the Services

#### Option A: Using PM2 (Recommended)

1. Install PM2 globally:
   ```powershell
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. Start backend:
   ```powershell
   cd E:\partnership\pms\backend
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

3. Start frontend (Admin):
   ```powershell
   cd E:\partnership\pms\frontend
   pm2 start npm --name "pms-admin" -- run preview
   pm2 save
   ```

4. Start user frontend:
   ```powershell
   cd E:\partnership\pms\user-frontend
   pm2 start npm --name "pms-user" -- run preview
   pm2 save
   ```

#### Option B: Using Windows Services (node-windows)

See `WINDOWS_SERVICE_SETUP.md` for detailed instructions.

#### Option C: Manual Start (Development/Testing)

1. Start backend:
   ```powershell
   cd E:\partnership\pms\backend
   npm start
   ```

2. Start admin frontend (new terminal):
   ```powershell
   cd E:\partnership\pms\frontend
   npm run preview
   ```

3. Start user frontend (new terminal):
   ```powershell
   cd E:\partnership\pms\user-frontend
   npm run preview
   ```

## 🌐 Accessing from Client Computers

### From Client Browsers:

1. **Admin Frontend**: `http://192.168.1.100:5173`
2. **User Frontend**: `http://192.168.1.100:5174`
3. **API Health Check**: `http://192.168.1.100:5000/health`

**Replace `192.168.1.100` with your server's IP address!**

### Troubleshooting Client Access:

1. **Can't connect?**
   - Verify server IP address
   - Check Windows Firewall rules
   - Ensure services are running
   - Try pinging the server: `ping 192.168.1.100`

2. **CORS errors?**
   - Add client URLs to `CORS_ORIGINS` in backend `.env`
   - Or temporarily use `CORS_ORIGINS=*` for testing (not recommended for production)

3. **Connection refused?**
   - Check if ports are open in firewall
   - Verify services are running on server
   - Check server IP address is correct

## 🔧 Production Recommendations

1. **Use a Reverse Proxy** (IIS, Nginx, or Caddy):
   - Set up IIS with URL Rewrite
   - Use port 80/443 for frontend
   - Use subdomain or path for API

2. **Use HTTPS**:
   - Get SSL certificate
   - Configure reverse proxy with SSL
   - Update frontend `.env` to use `https://`

3. **Domain Name** (Optional):
   - Set up DNS or hosts file
   - Use domain names instead of IP addresses

4. **Auto-start on Boot**:
   - Use PM2 startup or Windows Services
   - Configure MongoDB to start automatically

## 📝 Quick Start Scripts

See `scripts/` folder for Windows batch scripts to automate startup.

## 🔍 Verification Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Firewall rules are configured
- [ ] Can access from server: `http://localhost:5000/health`
- [ ] Can access from client: `http://SERVER_IP:5000/health`
- [ ] Frontend can connect to backend API
- [ ] Services auto-start on server reboot

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test network connectivity
4. Review firewall settings

