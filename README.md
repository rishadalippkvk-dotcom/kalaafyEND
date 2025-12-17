# Kalaafi Backend API

This is the backend server for the Kalaafi college arts score publication website.

## What's Included

- **server.js** - Main Express server file
- **package.json** - Backend dependencies
- **data/** - All data files (programs, scores, notices, gallery)
- **uploads/** - Uploaded gallery images
- **node_modules/** - Dependencies (already installed)

## Running the Backend

### Start the Server

`bash
npm start
`

The server will start on **http://localhost:5000**

### Available Scripts

- 
pm start - Start the production server
- 
pm run dev - Start with nodemon (auto-restart on changes)

## API Endpoints

- GET /api/programs - Get all programs
- GET /api/scores - Get all scores
- GET /api/notices - Get all notices
- GET /api/gallery - Get gallery images
- POST /api/gallery/upload - Upload gallery image
- And more...

## Tech Stack

- Node.js
- Express
- Multer (file uploads)
- CORS
- TOML/JSON data storage

## Configuration

The server runs on **port 5000** by default.
CORS is configured to allow requests from the frontend.
