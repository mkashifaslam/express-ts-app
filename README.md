# Express TypeScript Production App

A production-ready Express.js application built with TypeScript, following modern best practices for 2025. This project accompanies the YouTube tutorial ["How To Set Up Express 5 For Production In 2025"](https://www.youtube.com/watch?v=Wg2U_kZmJ0Q&lc=Ugyy4xpjEm-HfnvhojF4AaABAg).

## 📺 Tutorial Video

[![How To Set Up Express 5 For Production In 2025](https://img.youtube.com/vi/Wg2U_kZmJ0Q/maxresdefault.jpg)](https://www.youtube.com/watch?v=Wg2U_kZmJ0Q&lc=Ugyy4xpjEm-HfnvhojF4AaABAg)

*Click the thumbnail above to watch the full tutorial on YouTube*

## 🚀 Features

- **Modern TypeScript Setup**: Full TypeScript configuration with strict type checking
- **Express.js Backend**: RESTful API with modular architecture
- **Database Integration**: PostgreSQL with Prisma ORM
- **Authentication System**: JWT-based authentication with bcrypt password hashing
- **Testing Suite**: Comprehensive testing with Vitest and Supertest
- **Code Quality**: ESLint, Prettier, and TypeScript for code quality and consistency
- **Production Ready**: Optimized build process and deployment scripts

## 📁 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── database.ts           # Database connection setup
├── routes.ts             # Main API routes
├── features/             # Feature-based modules
│   ├── health-check/     # Health check endpoint
│   ├── user-authentication/  # Login, register, logout
│   └── user-profile/     # User profile management
├── middleware/           # Custom middleware
│   ├── require-authentication.ts
│   └── validate.ts
└── utils/               # Utility functions
    ├── async-handler.ts
    ├── get-error-message.ts
    └── types.ts
```

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Testing**: Vitest + Supertest
- **Code Quality**: ESLint + Prettier
- **Development**: tsx for hot reloading

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd express-ts-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
PORT=3000
```

### 4. Database Setup

```bash
# Generate Prisma client and run migrations
npm run prisma:setup

# Optional: Seed the database
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Health Check
- `GET /api/v1/health-check` - Check server status

### Authentication
- `POST /api/v1/register` - Register a new user
- `POST /api/v1/login` - Login user
- `POST /api/v1/logout` - Logout user

### User Profiles
- `GET /api/v1/user-profiles` - Get user profiles (authenticated)
- `POST /api/v1/user-profiles` - Create user profile
- `PUT /api/v1/user-profiles/:id` - Update user profile
- `DELETE /api/v1/user-profiles/:id` - Delete user profile

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode (development)
npm run test -- --watch
```

## 🏗 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Operations
```bash
# Create and run a new migration
npm run prisma:migrate "migration_name"

# Deploy migrations to production
npm run prisma:deploy

# Push schema changes (development)
npm run prisma:push

# Reset database (⚠️ destructive)
npm run prisma:wipe

# Open Prisma Studio
npm run prisma:studio
```

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests with Vitest

## 🏛 Architecture Patterns

This project follows several best practices:

- **Feature-Based Architecture**: Code organized by features rather than technical layers
- **Dependency Injection**: Modular design for better testability
- **Error Handling**: Centralized error handling with custom async handlers
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Testing Strategy**: Unit and integration tests for all features
- **Security**: JWT authentication, password hashing, input validation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS configuration
- Cookie parsing with security considerations
- Environment variable management

## 📖 Related Resources

- [YouTube Tutorial](https://www.youtube.com/watch?v=Wg2U_kZmJ0Q&lc=Ugyy4xpjEm-HfnvhojF4AaABAg) - "How To Set Up Express 5 For Production In 2025"
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

If you have any questions or run into issues, please check the [YouTube tutorial](https://www.youtube.com/watch?v=Wg2U_kZmJ0Q&lc=Ugyy4xpjEm-HfnvhojF4AaABAg) or open an issue in this repository.
