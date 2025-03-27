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
- **Data Storage**: PostgreSQL with Drizzle ORM
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
│   ├── db.ts              # Database connection setup
│   ├── auth.ts            # Authentication management
│   ├── migrate.ts         # Database migration helpers
│   ├── schema-push.ts     # Schema push utility
│   └── vite.ts            # Vite server configuration
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite bundler configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Screenshots

(Screenshots would be placed here)

## Getting Started

See the [SETUP.md](SETUP.md) file for detailed instructions on how to set up and run the application locally.

## Database Management

The application uses PostgreSQL with Drizzle ORM for database management. Here are some important operations:

### Running Migrations

When you make changes to the database schema in `shared/schema.ts`, you need to run migrations to update the database:

```bash
# Push schema changes directly to the database
npm run db:push
```

### Adding Mutations or Queries

When adding new database operations:

1. Update `shared/schema.ts` with any new models or fields
2. Run migrations to update the database:
   ```bash
   npm run db:push
   ```
3. Implement the new storage operations in `server/storage.ts`
4. Add any new API endpoints in `server/routes.ts`
5. Use `queryClient` to invalidate relevant queries after mutations:
   ```typescript
   // After a successful mutation
   queryClient.invalidateQueries({ queryKey: ['/api/yourEndpoint'] });
   ```

### Type Generation

The Drizzle ORM automatically generates TypeScript types from your schema. After updating your schema:

1. Use `typeof yourtable.$inferSelect` to generate select types
2. Use `z.infer<typeof insertYourTableSchema>` to generate insert types
3. Remember to export these types for use throughout the application

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.