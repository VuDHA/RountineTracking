# Habit Tracker

A modern habit tracker application with visualization tools to monitor and analyze personal routines and habits.

## Features

- **Track Daily Habits**: Create and monitor your daily, weekly, or monthly habits
- **Customizable Categories**: Organize habits by categories with custom colors
- **Visualize Progress**: View your habit streaks and completion rates
- **Statistics Dashboard**: Get insights into your habit performance
- **Calendar View**: See your habit completion history in a calendar format
- **Weekly Heatmap**: Visualize your consistency with a weekly habit heatmap
- **Mobile Responsive**: Use on any device with a fully responsive design

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, TypeScript 
- **Data Storage**: In-memory storage (can be easily replaced with PostgreSQL)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layout/        # Layout components
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Application entry point
├── server/                # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage implementation
│   └── vite.ts            # Vite server configuration
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
└── package.json           # Project dependencies and scripts
```

## Screenshots

(Screenshots would be placed here)

## Getting Started

See the [SETUP.md](SETUP.md) file for detailed instructions on how to set up and run the application locally.

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.