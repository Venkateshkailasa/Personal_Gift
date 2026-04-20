# Debugging Guide - Blank Pages Issue

## Problem Identified
The application was showing blank white pages when users navigated to Dashboard, Circle section, or tried to view Gift/Activity pages. This was caused by **inadequate error handling and logging** - errors were being silently caught without proper display.

## Root Causes Fixed

### 1. **Generic Error Messages Without Logging**
- **Before**: `catch { setError('Failed to fetch circle') }`
- **After**: `catch (err) { console.error(...); setError(err.response?.data?.message || err.message || default) }`
- **Impact**: Users couldn't see actual errors, making debugging impossible

### 2. **Missing Error Interceptor in API**
- **Before**: Only request interceptor was present
- **After**: Added response interceptor with detailed error logging
- **Benefit**: Network errors now show helpful message: "Network error - unable to connect to server. Is the backend running?"

### 3. **Silent Failures in Data Fetching**
- **Before**: Multiple catch blocks without logging, empty error messages
- **After**: All catch blocks now log the full error object to console and display meaningful messages
- **Files Updated**:
  - `app/src/components/CircleSection.jsx`
  - `app/src/pages/DashboardPage.jsx`
  - `app/src/pages/MessagesPage.jsx`
  - `app/src/pages/WishlistPage.jsx`
  - `app/src/api.js`

## How to Debug Blank Pages Now

### Step 1: Open Browser Console
```
Press: F12 (or Cmd+Option+I on Mac)
Go to: Console tab
```

### Step 2: Look for Error Messages
The console will now show:
- Detailed error objects with response status and messages
- Network connectivity issues
- API validation errors

Example error:
```
Response error: {
  status: 404,
  message: "Not authorized to view this wishlist",
  data: {...}
}
```

### Step 3: Check Common Issues

#### Issue: "Network error - unable to connect to server"
**Solution**: 
1. Verify backend is running: `npm start` in `/backend` directory
2. Check backend is on port 5001: Look in `backend/.env` for `PORT=5001`
3. Check frontend points to correct API: `app/.env` should have `VITE_API_URL=http://localhost:5001/api`

#### Issue: "Network error - no response from server"
**Solution**:
1. Backend might have crashed - check backend console for errors
2. Database connection issue - verify MongoDB is running
3. CORS issue - check browser Network tab for failed requests

#### Issue: "User not found" or "Not authorized"
**Solution**:
1. Authentication token might be expired
2. Clear localStorage: `localStorage.clear()` in console
3. Log out and log back in

#### Issue: Endpoint not found (404)
**Solution**:
1. Check if the API endpoint exists in backend routes
2. Verify endpoint URL matches what frontend is calling
3. Ensure all required middleware is in place

## Verification Checklist

Before reporting an issue, verify:

- [ ] Backend server is running (`npm start` in backend)
- [ ] Frontend can reach backend (check Network tab in DevTools)
- [ ] No errors in browser console (F12 > Console tab)
- [ ] No errors in backend terminal
- [ ] MongoDB is running on localhost:27017
- [ ] Environment variables are set correctly
  - Backend: `backend/.env` with `PORT=5001`
  - Frontend: `app/.env` with `VITE_API_URL=http://localhost:5001/api`
- [ ] Token is stored in localStorage (check: `localStorage.getItem('token')` in console)

## API Error Response Format

The API now returns detailed error messages. When you see an error on the page, it will show:

```javascript
{
  status: 400,
  message: "Validation failed - Username is required"
}
```

Or for network errors:
```
Network error - unable to connect to server. Is the backend running?
```

## Improved Error Messages in UI

All pages now display error messages like:
- ✅ "Error fetching circle: Network error - unable to connect to server"
- ✅ "Failed to send gift: Receiver friend ID is required"
- ✅ "Error loading wishlist: Not authorized to view this wishlist"

Instead of just:
- ❌ "Failed to fetch circle"
- ❌ "Failed to send gift"

## Console Logging

Every error is logged to browser console with context:

```javascript
// Example console output
console.error('handleSendGift error:', AxiosError)
// Shows full error object for inspection
```

Look for these in console:
- `fetchCircle error:`
- `fetchUpcomingEvents error:`
- `fetchFriendRequests error:`
- `fetchNotifications error:`
- `handleSendGift error:`
- `handleSendGiftSubmit error:`
- And similar for all API calls

## Testing After Fix

1. **Test Dashboard Page**:
   - Navigate to `/dashboard`
   - Should show Circle section and Wishlists
   - Check console for any red errors

2. **Test Circle Operations**:
   - Add a friend
   - View friends list
   - Accept/reject requests
   - Check for error messages

3. **Test Gift Modal**:
   - Click "Send Gift" on a friend
   - Should load friend's wishlists
   - Check console for errors

4. **Test Messages**:
   - Navigate to Messages page
   - Select a friend
   - Send a message
   - Should show actual errors if they occur

## Support

If you still see blank pages:

1. **Don't reload immediately** - Check console first
2. **Copy the error message** from the red error box on the page
3. **Check browser console (F12)** for detailed error info
4. **Check backend terminal** for server-side errors
5. **Verify all services are running**:
   - Backend: `npm start`
   - Frontend: `npm run dev`
   - MongoDB: running on 27017

## Files Modified

- `/app/src/api.js` - Added response error interceptor
- `/app/src/components/CircleSection.jsx` - Improved error handling
- `/app/src/pages/DashboardPage.jsx` - Improved error handling
- `/app/src/pages/MessagesPage.jsx` - Improved error handling
- `/app/src/pages/WishlistPage.jsx` - Improved error handling

---

**The error messages will now guide you to the actual problem instead of showing blank pages!**
