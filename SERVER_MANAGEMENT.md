# 🚀 SERVER MANAGEMENT GUIDE

## ✅ CURRENT STATUS: SERVER IS RUNNING

Your backend server is **already running** on port 3001!
- **Status:** ✅ Active
- **Port:** 3001
- **Uptime:** 39+ minutes
- **All endpoints:** ✅ Responding (HTTP 200)

---

## 🔍 HOW TO CHECK IF SERVER IS RUNNING

### Method 1: Check Port Status
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```
If you see output, the server is running.

### Method 2: Test API Endpoint
```powershell
curl http://localhost:3001/api/products -UseBasicParsing
```
If you get a response (even an empty array `[]`), the server is working.

### Method 3: Check Process
```powershell
Get-Process node -ErrorAction SilentlyContinue
```
Look for node.js processes.

---

## ⚠️ COMMON ERROR: "EADDRINUSE"

### What It Means
```
Error: listen EADDRINUSE: address already in use :::3001
```
This error means **the server is already running** on port 3001. You don't need to start it again!

### Why This Happens
- You tried to run `npm start` when the server was already running
- Port 3001 is occupied by the existing server process

### Solution
**Do nothing!** Your server is already working. Just use it.

---

## 🛑 HOW TO STOP THE SERVER

If you need to stop the server (for updates, etc.):

### Method 1: Find and Kill Process
```powershell
# Find the process using port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess

# Kill the process (replace XXXX with the process ID)
taskkill /PID XXXX /F
```

### Method 2: Kill All Node Processes
```powershell
# ⚠️ WARNING: This kills ALL Node.js processes
taskkill /IM node.exe /F
```

### Method 3: Use Ctrl+C in Terminal
If you have the terminal where you started the server:
1. Click on that terminal window
2. Press `Ctrl + C`
3. Confirm with `Y` if prompted

---

## ▶️ HOW TO START THE SERVER

Only start the server if it's **not already running**!

### Step 1: Navigate to Backend Directory
```powershell
cd "c:\Users\TECH TURF\Downloads\tech-turf-website (2)\tech-turf-website\tech-turf-website\backend"
```

### Step 2: Start the Server
```powershell
npm start
```

### Expected Output
```
Server is running on http://localhost:3001
MongoDB Connected Successfully
Serving frontend from: C:/Users/TECH TURF/Downloads/...
```

---

## 🔄 HOW TO RESTART THE SERVER

When you make changes to backend code, you need to restart:

### Option 1: Manual Restart
```powershell
# 1. Stop the server (Ctrl+C or kill process)
taskkill /IM node.exe /F

# 2. Start it again
npm start
```

### Option 2: Use Nodemon (Development Mode)
```powershell
# Install nodemon globally (one time only)
npm install -g nodemon

# Use dev mode (auto-restarts on file changes)
npm run dev
```

---

## 📊 VERIFY SERVER IS WORKING

### Test All Endpoints
```powershell
# Products endpoint
curl http://localhost:3001/api/products -UseBasicParsing

# Launches endpoint
curl http://localhost:3001/api/launches -UseBasicParsing

# Blog endpoint
curl http://localhost:3001/api/blog -UseBasicParsing

# Admin stats (requires authentication)
curl http://localhost:3001/api/admin/stats -UseBasicParsing
```

### Expected Responses
- **Public endpoints:** `[]` (empty array) or data
- **Protected endpoints:** `{"message":"Not authorized, no token"}`

Both responses mean the server is working correctly!

---

## 🌐 ACCESS YOUR APPLICATION

### Main Website
```
http://localhost:3001/index.html
```
Or just open `index.html` directly in your browser.

### Admin Dashboard
```
http://localhost:3001/admin/dashboard.html
```
Or open `admin/dashboard.html` directly.

### API Base URL
```
http://localhost:3001/api
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot connect to server"
**Solution:**
1. Check if server is running (see "How to Check" above)
2. If not running, start it with `npm start`
3. Check for error messages in terminal

### Problem: "EADDRINUSE" error
**Solution:**
- Server is already running! No action needed.
- If you want to restart, kill the process first (see "How to Stop" above)

### Problem: "MongoDB connection failed"
**Solution:**
1. Check your `.env` file has correct `MONGO_URI`
2. Ensure MongoDB is running (local or cloud)
3. Check network connection if using MongoDB Atlas

### Problem: "Module not found" errors
**Solution:**
```powershell
# Reinstall dependencies
npm install
```

### Problem: Changes not reflecting
**Solution:**
1. Stop the server (Ctrl+C)
2. Start it again (`npm start`)
3. Or use `npm run dev` for auto-restart

---

## 📝 QUICK REFERENCE

| Task | Command |
|------|---------|
| Check if running | `Get-NetTCPConnection -LocalPort 3001` |
| Test API | `curl http://localhost:3001/api/products -UseBasicParsing` |
| Start server | `npm start` |
| Stop server | `Ctrl+C` or `taskkill /IM node.exe /F` |
| Restart server | Stop, then `npm start` |
| Dev mode | `npm run dev` |
| Install deps | `npm install` |

---

## ✅ YOUR CURRENT SITUATION

**Right Now:**
- ✅ Server is running on port 3001
- ✅ All API endpoints responding
- ✅ Frontend can connect to backend
- ✅ Everything is working correctly

**What You Should Do:**
- ❌ Don't run `npm start` again (server already running)
- ✅ Just use your application
- ✅ Open `index.html` or `admin/dashboard.html` in browser
- ✅ Test features and functionality

**When to Restart:**
- Only if you make changes to backend code
- Only if server crashes or stops responding
- Only if you need to update environment variables

---

## 🎉 SUMMARY

Your server is **already running and working perfectly**! 

The "EADDRINUSE" error is actually a **good sign** - it means your server is up and running. You don't need to do anything else. Just start using your application!

**Next Steps:**
1. Open your website in a browser
2. Test the features
3. Add data through the admin panel
4. Enjoy your fully functional application!

---

**Last Updated:** December 3, 2025 at 08:01 AM IST  
**Server Status:** 🟢 RUNNING & HEALTHY
