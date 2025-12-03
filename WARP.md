# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a Node.js REST API built with Express.js for user acquisition and authentication. It uses Drizzle ORM with Neon PostgreSQL as the database, and follows a layered architecture pattern (routes → controllers → services → models).

## Development Commands

### Running the Application
```powershell
npm run dev
```
Starts the development server with Node's watch mode on port 3000 (or PORT from .env).

### Database Operations
```powershell
# Generate migration files from schema changes
npm run db:generate

# Run migrations (applies SQL files in drizzle/ folder)
npm run db:migrate

# Push schema changes directly to database (development only)
npm run db:push

# Open Drizzle Studio to view/edit database
npm run db:studio
```

Alternative: Run the migration script directly:
```powershell
node src/scripts/migrate.js
```

### Code Quality
```powershell
# Run ESLint to check for issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check
```

## Architecture

### Import Aliases
The project uses package.json `imports` field for path aliases. All imports use `#` prefix:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#scripts/*` → `./src/scripts/*`
- `#services/*` → `./src/services/*`
- `#validations/*` → `./src/validations/*`
- `#utils/*` → `./src/utils/*`

Always use these aliases instead of relative paths (e.g., `import logger from '#config/logger.js'`).

### Application Flow
1. **Entry Point**: `src/index.js` loads environment variables and imports `server.js`
2. **Server Setup**: `src/server.js` starts the Express app from `app.js` on configured PORT
3. **App Configuration**: `src/app.js` sets up middleware (helmet, cors, morgan, cookie-parser) and routes

### Request Flow Pattern
All API endpoints follow this layered architecture:
```
Route (routes/) 
  → Controller (controllers/) validates input with Zod schemas
    → Service (services/) contains business logic
      → Model (models/) Drizzle ORM schema definitions
        → Database (config/database.js) Neon PostgreSQL connection
```

### Database Architecture
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Connection**: HTTP-based connection via `@neondatabase/serverless`
- **Schema**: Defined in `src/models/*.js` using Drizzle's pgTable
- **Migrations**: Generated in `drizzle/` folder, applied via drizzle-kit or custom migrate script

### Key Utilities
- **Logger** (`#config/logger.js`): Winston logger with file transports (`logs/error.log`, `logs/combined.log`) and console in non-production
- **JWT** (`#utils/jwt.js`): Token signing/verification with 1-day expiration
- **Cookies** (`#utils/cookies.js`): Secure cookie management (httpOnly, sameSite:strict, 15min maxAge)
- **Validation** (`#validations/*.js`): Zod schemas for request validation
- **Format** (`#utils/format.js`): Formats Zod validation errors for API responses

### Current Implementation Status
Authentication module is partially implemented:
- ✅ Sign-up endpoint (`POST /api/auth/sign-up`) with full validation, user creation, JWT, and cookie handling
- ⚠️ Sign-in endpoint (`POST /api/auth/sign-in`) - stub only
- ⚠️ Sign-out endpoint (`POST /api/auth/sign-out`) - stub only
- 📝 User model includes: id, name, email, password (hashed with bcrypt), role, timestamps

### Environment Variables
Required variables (see `.env.example`):
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Winston log level (default: info)
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://user:password@host:port/database?sslmode=require`)
- `JWT_SECRET`: Secret for JWT signing (has fallback but should be set in production)

## Code Style Conventions
- **Module System**: ES modules (type: "module" in package.json)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line endings**: Unix (LF)
- **Arrow Functions**: Preferred over function expressions
- **Const/Let**: Use const by default, no var allowed
- **Unused Variables**: Prefix with underscore (e.g., `_req`)
- **Object Shorthand**: Required

## Adding New Features

### Adding a New Model
1. Create model file in `src/models/` using Drizzle's pgTable
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration
4. Import and use model in services

### Adding a New API Endpoint
1. Create validation schema in `src/validations/`
2. Create service functions in `src/services/`
3. Create controller in `src/controllers/` (validate → call service → respond)
4. Add route in `src/routes/` or create new route file
5. Mount route in `src/app.js` if new route file

### Error Handling Pattern
- Controllers catch errors, log with Winston logger, and return appropriate HTTP status
- Services throw errors with descriptive messages
- Use custom error messages to distinguish error types (e.g., "User already exists" → 409 Conflict)
- Validation errors return 400 with formatted Zod error details
