# Windows Server Quick Start Guide

## ✅ Yes, this can be deployed on Windows Server and accessed from client computers!

## 🚀 Quick Setup (5 Steps)

### Step 1: Find Your Server IP Address
```powershell
# Run in PowerShell or Command Prompt
ipconfig
```
Look for "IPv4 Address" (usually something like `192.168.1.100`)

**Or use the script:**
```batch
scripts\get-server-ip.bat
```

### Step 2: Configure Environment Variables

**Backend `.env` file:**
```env
MONGO_URI=mongodb://localhost:27017/pms
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

# Replace 192.168.1.100 with YOUR server IP
ADMIN_APP_URL=http://192.168.1.100:5173
USER_APP_URL=http://192.168.1.100:5174
CORS_ORIGINS=http://192.168.1.100:5173,http://192.168.1.100:5174
```

**Frontend `.env` file:**
```env
# Replace 192.168.1.100 with YOUR server IP
VITE_API_URL=http://192.168.1.100:5000
```

**User Frontend `.env` file:**
```env
# Replace 192.168.1.100 with YOUR server IP
VITE_API_URL=http://192.168.1.100:5000
```

### Step 3: Configure Firewall
Run as Administrator:
```batch
scripts\configure-firewall.bat
```

This opens ports:
- **5000** - Backend API
- **5173** - Admin Frontend  
- **5174** - User Frontend

### Step 4: Install & Build
```batch
scripts\quick-deploy.bat
```

### Step 5: Start Services
```batch
scripts\start-all.bat
```

## 🌐 Access from Client Computers

Once running, access from any computer on your network:

- **Admin Panel**: `http://YOUR_SERVER_IP:5173`
- **User Portal**: `http://YOUR_SERVER_IP:5174`
- **API Health**: `http://YOUR_SERVER_IP:5000/health`

**Example:**
If your server IP is `192.168.1.100`:
- Admin: `http://192.168.1.100:5173`
- User: `http://192.168.1.100:5174`

## 🔧 Important Configuration Notes

1. **HOST=0.0.0.0** - This allows network access (already configured)
2. **Vite host: '0.0.0.0'** - Frontend accessible from network (already configured)
3. **CORS Origins** - Must include your server IP in backend `.env`
4. **Firewall** - Must allow ports 5000, 5173, 5174

## 📋 Verification Checklist

- [ ] MongoDB is installed and running
- [ ] Server IP address identified
- [ ] All `.env` files configured with server IP
- [ ] Firewall configured (ports 5000, 5173, 5174 open)
- [ ] Dependencies installed (`npm install` in each folder)
- [ ] Frontend built (`npm run build` in frontend folders)
- [ ] Services started
- [ ] Can access from server: `http://localhost:5000/health`
- [ ] Can access from client: `http://SERVER_IP:5000/health`

## 🐛 Troubleshooting

### Can't access from client?
1. Check Windows Firewall - run `scripts\configure-firewall.bat`
2. Verify server IP in all `.env` files
3. Test from server first: `http://localhost:5000/health`
4. Check if services are running
5. Try pinging server: `ping SERVER_IP`

### CORS errors?
- Add client URLs to `CORS_ORIGINS` in backend `.env`
- Or temporarily use `CORS_ORIGINS=*` for testing

### Port already in use?
- Change ports in `.env` files and Vite configs
- Update firewall rules accordingly

## 📚 Full Documentation

For detailed instructions, see: **[WINDOWS_SERVER_DEPLOYMENT.md](./WINDOWS_SERVER_DEPLOYMENT.md)**

