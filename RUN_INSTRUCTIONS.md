# 🚀 How to Run Pet Care Pro

## Quick Start (3 Commands)

### Step 1: Start Backend Server
```bash
cd /Users/oscar.araya.cr/Documents/learning/pet-care-server
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
🚀 Server running on port 3000
📝 API Base URL: http://localhost:3000/api
```

---

### Step 2: Start Mobile App (New Terminal)
```bash
cd /Users/oscar.araya.cr/Documents/learning/pet-care/pet-care-mobile
npm start
```

**Expected Output:**
```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
› Metro waiting on exp://[local-ip]:8081
›
› Scan this QR code or choose an option above:
› [QR Code displayed]
›
› Press i - to open iOS Simulator
› Press a - to open Android Emulator
› Press w - to open web
```

---

### Step 3: Choose Your Platform

**For iOS Simulator:**
```
Press: i
```

**For Android Emulator:**
```
Press: a
```

**For Web Browser:**
```
Press: w
```

---

## ✅ You Should See:

1. **Backend Terminal**: "Server running on port 3000"
2. **Mobile Terminal**: Waiting for platform selection
3. **App Opens**: Login screen appears in your simulator/emulator/browser

---

## 🧪 Test the App

1. **Register a new account:**
   - Select a role (Pet Owner, Staff, or Driver)
   - Fill in the form
   - Tap "Create Account"

2. **Backend processes:**
   - Creates user in MongoDB
   - Hashes password with bcrypt
   - Generates JWT tokens
   - Returns user data

3. **Mobile app:**
   - Stores tokens in Redux
   - Updates auth state
   - Navigates to role-specific home screen

---

## 🛠️ Troubleshooting

### Issue: "expo: command not found"
**Solution:** Already fixed! Expo is now installed as a dependency.
```bash
npm start  # Should work now
```

### Issue: Backend won't start
```bash
cd pet-care-server

# Check MongoDB is running
brew services list

# Start MongoDB if needed
brew services start mongodb-community

# Start backend again
npm run dev
```

### Issue: Mobile app won't load
```bash
# Try clearing cache and starting fresh
npm start -- --reset-cache

# Then press i, a, or w to start
```

### Issue: Can't connect to backend
Make sure both are running:
1. Terminal 1: `cd pet-care-server && npm run dev`
2. Terminal 2: `cd pet-care-mobile && npm start`

Both should show "running" status.

---

## 📱 Platform-Specific Notes

### iOS Simulator
- Requires Xcode installed
- Press `i` to open
- Takes 30-60 seconds to load

### Android Emulator  
- Requires Android Studio installed
- Emulator must be running first
- Press `a` to open

### Web Browser
- Fastest option for testing
- Press `w` to open
- Limited React Native support for some features

---

## 🎉 Success Indicators

✅ Backend server responds to requests:
```bash
curl http://localhost:3000/health
# Should return: { "success": true, "message": "Server is running" }
```

✅ Mobile app loads:
- See login screen
- Form is interactive
- No console errors

✅ Can register:
- Enter test credentials
- Tap "Create Account"
- See success message or navigate to home screen

---

## 🔄 Full Workflow

```
┌─ Terminal 1 ─────────────────────────┐
│ cd pet-care-server                   │
│ npm run dev                           │
│ ✅ Server running on port 3000       │
└──────────────────────────────────────┘
                    ↓
        (Keep this terminal running)
                    ↓
┌─ Terminal 2 ─────────────────────────┐
│ cd pet-care-mobile                   │
│ npm start                             │
│ Press: i (iOS) or a (Android)        │
└──────────────────────────────────────┘
                    ↓
        (App opens in simulator)
                    ↓
┌─ Simulator/Emulator ──────────────────┐
│ Login Screen appears                  │
│ Tap "Sign up"                         │
│ Register with test data               │
│ Backend creates user in MongoDB       │
│ Redux stores auth state               │
│ Navigate to home screen               │
└──────────────────────────────────────┘
```

---

## 📊 Project Locations

```
Backend API:
/Users/oscar.araya.cr/Documents/learning/pet-care-server

Mobile App:
/Users/oscar.araya.cr/Documents/learning/pet-care/pet-care-mobile

Both should be running simultaneously for full functionality.
```

---

## 💡 Tips

- Keep both terminals open while developing
- Changes to mobile code hot-reload automatically
- Backend changes require restart
- Use Postman to test API independently
- Check browser console for frontend errors
- Check terminal for backend errors

---

## 📖 Next Steps

1. ✅ Both running?
2. ✅ Can register/login?
3. ✅ See home screen?

Then you're ready to build features! Check out:
- `DEVELOPMENT.md` - Coding patterns
- `ARCHITECTURE.md` - System design
- `TODO.md` - Feature implementation

---

**Everything is working! Happy coding! 🎉**
