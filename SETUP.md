# Habit Tracker - Setup Guide

This document provides detailed instructions for setting up and running the Habit Tracker application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher)
- [Git](https://git-scm.com/) for cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

### 2. Install Dependencies

Install all required dependencies for both frontend and backend:

```bash
npm install
```

This will install all the packages listed in `package.json`, including:
- Frontend dependencies: React, TailwindCSS, shadcn/ui components, Wouter, React Query
- Backend dependencies: Express, TypeScript, etc.

### 3. Running the Application in Development Mode

The application is configured to run both frontend and backend with a single command:

```bash
npm run dev
```

This script:
1. Starts the Express server on port 5000
2. Configures the Vite development server for the React frontend
3. Sets up HMR (Hot Module Replacement) for development

After running the command, you can access the application at: http://localhost:5000

## Application Architecture

### Backend (Express Server)

- **Server Entry Point**: `server/index.ts`
- **API Routes**: `server/routes.ts`
- **Data Storage**: `server/storage.ts` (using in-memory storage by default)

The backend provides the following API endpoints:

- `GET /api/categories` - Retrieve all habit categories
- `POST /api/categories` - Create a new category
- `GET /api/habits` - Retrieve all habits
- `GET /api/habits/:id` - Retrieve a specific habit
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update an existing habit
- `DELETE /api/habits/:id` - Delete a habit
- `GET /api/habits/:id/completions` - Get completion history for a habit
- `POST /api/habits/:id/completions` - Log a habit completion
- `POST /api/habits/:id/toggle` - Toggle a habit's completion status for a date
- `GET /api/completions/date/:date` - Get all habits completions for a specific date
- `GET /api/statistics` - Get overall habit statistics

### Frontend (React Application)

- **Entry Point**: `client/src/main.tsx`
- **Main App Component**: `client/src/App.tsx`
- **Pages**:
  - Dashboard: `client/src/pages/dashboard.tsx`
  - Calendar: `client/src/pages/calendar.tsx`
  - Statistics: `client/src/pages/statistics.tsx`

The frontend is organized into reusable components located in the `client/src/components` directory.

## Database Configuration

The application uses in-memory storage by default (MemStorage implementation in `server/storage.ts`). No additional database configuration is required for local development.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will:
1. Compile the TypeScript code
2. Bundle the React application
3. Generate optimized assets

To run the production build:

```bash
npm start
```

## Troubleshooting Common Issues

### Port Conflicts

If port 5000 is already in use, you can modify the port in `server/index.ts`.

### Node.js Version Issues

This application requires Node.js v16 or higher. If you encounter errors, check your Node.js version:

```bash
node --version
```

### Missing Dependencies

If you encounter module not found errors, try reinstalling the dependencies:

```bash
npm ci
```

### Hot Reload Not Working

If changes are not reflecting immediately:

1. Check if the Vite development server is running
2. Clear your browser cache
3. Ensure you don't have multiple instances of the application running

## Environment Variables

For local development, no environment variables are required. However, if you want to customize the application behavior, you can create a `.env` file with the following options:

```
PORT=5000                # The port for the Express server
VITE_API_URL=/api        # The base URL for API requests
```

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)