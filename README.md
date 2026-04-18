# Personal Gift Registry & Wishlist

A full-stack MERN application that allows users to create and share personalized gift wishlists, preventing duplicate gifts and coordinating gift-giving among friends and family.

## Features

### For Wishlist Owners
- ✅ User authentication (signup/login)
- ✅ Create multiple wishlists for different occasions
- ✅ Add items with product links and descriptions
- ✅ Make wishlists public and share with a unique link
- ✅ View reservations and see who's buying what
- ✅ Edit and delete wishlists and items
- ✅ Optional privacy to hide buyer names until event date

### For Friends & Family
- ✅ View public wishlists without signing up
- ✅ Browse items and view product links
- ✅ Reserve items they plan to buy
- ✅ See availability status of items
- ✅ Prevent duplicate purchases automatically

## Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Development server and bundler
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

## Project Structure

```
Personal Gift/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Context providers
│   │   ├── api.js          # API client
│   │   └── App.jsx         # Main app with routing
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── models/             # MongoDB schemas
    ├── routes/             # API routes
    ├── controllers/        # Request handlers
    ├── middleware/         # Custom middleware
    ├── config/             # Database config
    ├── server.js           # Express server
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your settings:**
   ```
   MONGODB_URI=mongodb://localhost:27017/gift-registry
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   **For MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gift-registry
   ```

5. **Start the backend server:**
   ```bash
   npm run dev    # For development with nodemon
   # or
   npm start      # For production
   ```

   Server will run at: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your settings:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Wishlists
- `POST /api/wishlists` - Create wishlist (protected)
- `GET /api/wishlists/my-wishlists` - Get user's wishlists (protected)
- `GET /api/wishlists/:id` - Get wishlist details (protected)
- `GET /api/wishlists/public/:publicLink` - Get public wishlist
- `PUT /api/wishlists/:id` - Update wishlist (protected)
- `DELETE /api/wishlists/:id` - Delete wishlist (protected)

### Items
- `POST /api/items` - Add item (protected)
- `GET /api/items/wishlist/:wishlistId` - Get items by wishlist
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)
- `POST /api/items/:id/reserve` - Reserve item (protected)
- `POST /api/items/:id/unreserve` - Unreserve item (protected)

## Usage Guide

### For Wishlist Creators

1. **Sign Up / Login**
   - Visit the home page and click "Sign Up" to create account
   - Or login if you already have an account

2. **Create a Wishlist**
   - Click "Create New Wishlist" in dashboard
   - Fill in title, description, and event date
   - Enable "Make Public" to get a shareable link
   - Optionally hide buyer names until event

3. **Add Items**
   - Click "View" on a wishlist
   - Click "Add New Item"
   - Fill in item name, product link, and description
   - Submit to add to wishlist

4. **Share Wishlist**
   - Copy the public link from the wishlist
   - Share via email, social media, or messaging
   - Friends can view and reserve items

### For Gift Buyers

1. **View Wishlist**
   - Click on the public link from wishlist creator
   - Browse items and see availability
   - Click product links to see items on e-commerce sites

2. **Reserve Item**
   - Click "Reserve This Item" on desired item
   - Enter your name
   - Item marked as "Taken" for others

3. **Unreserve Item**
   - If you change your mind, can unreserve item
   - Wishlist owner can also unreserve if needed

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Wishlists Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  isPublic: Boolean,
  publicLink: String (unique),
  hideReserverName: Boolean,
  eventDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Items Collection
```javascript
{
  _id: ObjectId,
  wishlistId: ObjectId (ref: Wishlist),
  name: String,
  productLink: String,
  description: String,
  status: String ('available' | 'taken'),
  reservedBy: ObjectId (ref: User),
  reserverName: String,
  reservedAt: Date,
  createdAt: Date
}
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/gift-registry
JWT_SECRET=your_secure_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Protected routes on frontend
- ✅ Authorization checks on backend
- ✅ CORS configuration
- ✅ Input validation

## Error Handling

The application includes comprehensive error handling:
- User-friendly error messages
- Validation for all inputs
- Proper HTTP status codes
- Try-catch blocks in async operations

## Future Enhancements

- 📧 Email notifications for reservations
- 📸 Image uploads for items
- 🎨 Custom wishlist themes
- 💝 Gift tracking after event
- 🤖 AI-based gift suggestions
- 📱 Mobile app
- 🔔 Push notifications
- 💬 Comments/messages between users

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MongoDB URI in .env
- Ensure PORT 5000 is not in use

### Frontend can't connect to backend
- Check VITE_API_URL in .env.local
- Ensure backend is running on correct port
- Check CORS settings in backend

### Authentication issues
- Clear localStorage and cookies
- Check JWT_SECRET is set correctly
- Verify token is being sent in headers

## License

MIT License - feel free to use this project!

## Support

For issues and questions, please refer to the code comments or reach out to the development team.
