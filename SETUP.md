# Setup & Installation Guide

## Quick Start (5 minutes)

### Option 1: Local Setup

#### Step 1: Install MongoDB Locally

**macOS with Homebrew:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download from: https://www.mongodb.com/try/download/community

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with local MongoDB
# MONGODB_URI=mongodb://localhost:27017/gift-registry

# Start backend server
npm run dev
```

**Backend should run at:** http://localhost:5000

#### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd app

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

**Frontend should run at:** http://localhost:5173

---

### Option 2: Cloud Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a free cluster

2. **Get Connection String**
   - In Atlas dashboard, click "Connect"
   - Copy the connection string
   - Replace username and password

3. **Update Backend .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gift-registry
   ```

4. **Rest is same as local setup**

---

## Detailed Setup Guide

### Backend Setup Detail

**1. Environment Variables (.env)**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/gift-registry

# Authentication (generate a strong secret)
JWT_SECRET=your_random_secret_key_12345

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**2. Install Dependencies**
```bash
npm install
```

**Installed packages:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `express-validator` - Input validation

**3. Run Backend**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
Server is running on port 5000
MongoDB Connected: localhost
```

---

### Frontend Setup Detail

**1. Environment Variables (.env.local)**
```bash
VITE_API_URL=http://localhost:5000/api
```

**2. Install Dependencies**
```bash
npm install
```

**Installed packages:**
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework

**3. Run Frontend**
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Expected output:**
```
VITE v8.0.4

Your app is running at:
  > Local:    http://localhost:5173/
```

---

## Testing the Application

### Test Endpoints with CURL or Postman

**1. Signup**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**3. Create Wishlist**
```bash
curl -X POST http://localhost:5000/api/wishlists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Birthday Wishlist",
    "description": "Items I want for my birthday",
    "isPublic": true,
    "eventDate": "2024-12-25"
  }'
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas: Add your IP to whitelist

```bash
# Check if MongoDB is running (macOS)
brew services list

# Start MongoDB (macOS)
brew services start mongodb-community

# Check if MongoDB is listening
lsof -i :27017
```

---

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

---

### Issue 3: CORS Error in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `FRONTEND_URL` in backend `.env`
2. Restart backend with correct URL
3. Check `VITE_API_URL` in frontend `.env.local`

```bash
# Backend .env
FRONTEND_URL=http://localhost:5173

# Frontend .env.local
VITE_API_URL=http://localhost:5000/api
```

---

### Issue 4: JWT Token Invalid

**Error:** `Token is not valid`

**Solution:**
- JWT_SECRET must be same in backend and frontend token
- Check token is sent in header: `Authorization: Bearer <token>`
- Token may have expired (valid for 7 days)

---

### Issue 5: Dependencies Installation Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Development Tools

### Recommended Extensions
- **VS Code**
  - ES7+ React/Redux/React-Native snippets
  - MongoDB for VS Code
  - Tailwind CSS IntelliSense
  - REST Client (for API testing)

### API Testing Tools
- **Postman** - Full-featured API testing
- **Thunder Client** - Lightweight VS Code extension
- **cURL** - Command-line tool

### Database Tools
- **MongoDB Compass** - GUI for MongoDB
- **MongoDB Atlas** - Cloud dashboard

---

## Deployment

### Backend Deployment (Heroku Example)

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create gift-registry-api

# Set environment variables
heroku config:set MONGODB_URI=<your_atlas_uri>
heroku config:set JWT_SECRET=<your_secret>

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Database Backup & Restore

### MongoDB Atlas Backup
1. Go to Atlas Dashboard
2. Cluster → Backup
3. Snapshots are automatically created

### Local MongoDB Backup
```bash
# Create backup
mongodump --db gift-registry --out ./backup

# Restore backup
mongorestore --db gift-registry ./backup/gift-registry
```

---

## Next Steps

1. ✅ Setup complete!
2. 📝 Create an account and test the app
3. 🌐 Make a wishlist public and share the link
4. 👥 Test reservations from another browser
5. 🚀 Deploy to production when ready

---

## Need Help?

- Check the main [README.md](./README.md)
- Review API documentation
- Check backend logs: Look for error messages in terminal
- Check frontend console: Open DevTools (F12)
- Check network tab: See actual API responses

Happy gifting! 🎁
