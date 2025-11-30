# Movie Collection Server

A RESTful API server for managing movie collections and user watchlists. Built with Express.js and MongoDB.

## Features

- User registration and management
- Movie CRUD operations
- Personal movie collections
- Watchlist functionality
- Filter movies by genre and rating
- Latest and top-rated movie endpoints

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** Email-based user tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
# Development
node index.js

# Or with nodemon
nodemon index.js
```

The server will run on `http://localhost:3000`

## API Endpoints

### General
- `GET /` - Health check

### Users
- `POST /users` - Register a new user
  - Body: `{ email, name, ... }`

### Movies
- `GET /movies` - Get all movies with optional filters
  - Query params: `?genres=Action,Drama&minRating=7&maxRating=9`
- `GET /movies/:id` - Get a single movie by ID
- `GET /movies/my-collection?email=user@example.com` - Get user's movies
- `GET /latest-movies` - Get 6 latest movies
- `GET /top-rated-movies` - Get 6 top-rated movies
- `POST /movies` - Add a new movie
  - Body: `{ title, posterUrl, genre, releaseYear, rating, email }`
- `PATCH /movies/:id` - Update a movie
- `DELETE /movies/:id` - Delete a movie

### Watchlist
- `GET /watchlist?email=user@example.com` - Get user's watchlist
- `POST /watchlist` - Add movie to watchlist
  - Body: `{ userEmail, movieId, title, posterUrl, genre, releaseYear, rating }`
- `DELETE /watchlist/:id?email=user@example.com` - Remove from watchlist

## Database Schema

### Collections

**users**
- email (unique)
- name
- other user fields

**movies**
- title
- posterUrl
- genre
- releaseYear
- rating
- email (owner)
- created_at

**watch-list**
- userEmail
- movieId
- title
- posterUrl
- genre
- releaseYear
- rating
- createdAt

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found
- `409` - Conflict (duplicate entry)
- `500` - Server error

## CORS

CORS is enabled for all origins. Configure `cors()` options for production use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
