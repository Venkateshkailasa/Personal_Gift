# API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Sign Up
**POST** `/auth/signup`

Create a new user account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
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

---

### Login
**POST** `/auth/login`

Log in existing user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Get Current User
**GET** `/auth/me` ⚠️ Protected

Get information about logged-in user

**Response (200):**
```json
{
  "user": {
    "id": "507f...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## Wishlist Endpoints

### Create Wishlist
**POST** `/wishlists` ⚠️ Protected

Create a new wishlist

**Request:**
```json
{
  "title": "Birthday Wishlist",
  "description": "Items I want for my birthday",
  "isPublic": true,
  "hideReserverName": false,
  "eventDate": "2024-12-25"
}
```

**Response (201):**
```json
{
  "message": "Wishlist created successfully",
  "wishlist": {
    "_id": "507f...",
    "userId": "507f...",
    "title": "Birthday Wishlist",
    "description": "Items I want for my birthday",
    "isPublic": true,
    "publicLink": "abc123def456...",
    "hideReserverName": false,
    "eventDate": "2024-12-25T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get My Wishlists
**GET** `/wishlists/my-wishlists` ⚠️ Protected

Get all wishlists created by current user

**Response (200):**
```json
{
  "wishlists": [
    {
      "_id": "507f...",
      "title": "Birthday Wishlist",
      "description": "...",
      "isPublic": true,
      "publicLink": "abc123...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f...",
      "title": "Wedding Registry",
      "description": "...",
      "isPublic": false,
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ]
}
```

---

### Get Wishlist Details
**GET** `/wishlists/:id` ⚠️ Protected

Get details of a specific wishlist (must be owner)

**Response (200):**
```json
{
  "wishlist": {
    "_id": "507f...",
    "userId": "507f...",
    "title": "Birthday Wishlist",
    "description": "...",
    "isPublic": true,
    "publicLink": "abc123...",
    "hideReserverName": false,
    "eventDate": "2024-12-25T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Public Wishlist
**GET** `/wishlists/public/:publicLink`

Get public wishlist (no authentication required)

**Response (200):**
```json
{
  "wishlist": {
    "_id": "507f...",
    "userId": {
      "_id": "507f...",
      "name": "John Doe"
    },
    "title": "Birthday Wishlist",
    "description": "...",
    "isPublic": true,
    "publicLink": "abc123...",
    "hideReserverName": false,
    "eventDate": "2024-12-25T00:00:00.000Z"
  }
}
```

---

### Update Wishlist
**PUT** `/wishlists/:id` ⚠️ Protected

Update wishlist details (only owner)

**Request:**
```json
{
  "title": "Updated Birthday Wishlist",
  "description": "Updated description",
  "isPublic": false,
  "hideReserverName": true,
  "eventDate": "2024-12-25"
}
```

**Response (200):**
```json
{
  "message": "Wishlist updated successfully",
  "wishlist": { /* updated wishlist data */ }
}
```

---

### Delete Wishlist
**DELETE** `/wishlists/:id` ⚠️ Protected

Delete a wishlist and all its items (only owner)

**Response (200):**
```json
{
  "message": "Wishlist deleted successfully"
}
```

---

## Item Endpoints

### Add Item
**POST** `/items` ⚠️ Protected

Add item to a wishlist (only owner can add)

**Request:**
```json
{
  "wishlistId": "507f...",
  "name": "Sony Headphones",
  "productLink": "https://amazon.com/...",
  "description": "Wireless noise-cancelling headphones"
}
```

**Response (201):**
```json
{
  "message": "Item added successfully",
  "item": {
    "_id": "507f...",
    "wishlistId": "507f...",
    "name": "Sony Headphones",
    "productLink": "https://amazon.com/...",
    "description": "Wireless noise-cancelling headphones",
    "status": "available",
    "reservedBy": null,
    "reserverName": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Items by Wishlist
**GET** `/items/wishlist/:wishlistId`

Get all items in a wishlist (public access if wishlist is public)

**Response (200):**
```json
{
  "items": [
    {
      "_id": "507f...",
      "wishlistId": "507f...",
      "name": "Sony Headphones",
      "productLink": "https://amazon.com/...",
      "description": "Wireless noise-cancelling headphones",
      "status": "available",
      "reservedBy": null,
      "reserverName": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f...",
      "name": "Apple Watch",
      "productLink": "https://apple.com/...",
      "description": "Latest smartwatch model",
      "status": "taken",
      "reservedBy": "507f...",
      "reserverName": "Jane Smith",
      "reservedAt": "2024-01-16T14:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Update Item
**PUT** `/items/:id` ⚠️ Protected

Update item details (only wishlist owner)

**Request:**
```json
{
  "name": "Sony WH-1000XM headphones",
  "productLink": "https://amazon.com/...",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "message": "Item updated successfully",
  "item": { /* updated item data */ }
}
```

---

### Delete Item
**DELETE** `/items/:id` ⚠️ Protected

Delete an item (only wishlist owner)

**Response (200):**
```json
{
  "message": "Item deleted successfully"
}
```

---

### Reserve Item
**POST** `/items/:id/reserve` ⚠️ Protected

Reserve an item (any authenticated user)

**Request:**
```json
{
  "reserverName": "Jane Smith"
}
```

**Response (200):**
```json
{
  "message": "Item reserved successfully",
  "item": {
    "_id": "507f...",
    "wishlistId": "507f...",
    "name": "Sony Headphones",
    "productLink": "https://amazon.com/...",
    "description": "...",
    "status": "taken",
    "reservedBy": "507f...",
    "reserverName": "Jane Smith",
    "reservedAt": "2024-01-16T14:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Unreserve Item
**POST** `/items/:id/unreserve` ⚠️ Protected

Unreserve an item (reserver or wishlist owner)

**Response (200):**
```json
{
  "message": "Item unreserved successfully",
  "item": {
    "_id": "507f...",
    "status": "available",
    "reservedBy": null,
    "reserverName": null,
    "reservedAt": null,
    /* ... other item data ... */
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to update this wishlist"
}
```

### 404 Not Found
```json
{
  "message": "Wishlist not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating wishlist",
  "error": "Database connection error"
}
```

---

## Example Usage with Fetch

### Login and Get Token
```javascript
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token);
```

### Create Wishlist (with token)
```javascript
const wishlistResponse = await fetch(
  'http://localhost:5000/api/wishlists',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Birthday Wishlist',
      isPublic: true
    })
  }
);

const data = await wishlistResponse.json();
console.log(data.wishlist);
```

---

## Rate Limiting
Currently not implemented. Consider adding for production.

---

## Pagination
Currently not implemented. All results returned at once. Consider adding for large datasets.

---

## Filtering & Sorting
Currently not implemented. Basic filtering by status available through frontend.
