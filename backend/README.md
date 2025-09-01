# IT Partner Backend

A TypeScript-based Express.js backend with Prisma ORM.

## Features

- 🚀 Express.js server with TypeScript
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Logging with Morgan
- 🗄️ Database with Prisma ORM
- 🔧 Development with Nodemon and ts-node

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp env.example .env
   ```

3. Update `.env` with your database credentials

4. Initialize Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Development

Start development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Start Production

Start production server:
```bash
npm start
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check

## Project Structure

```
src/
├── index.ts          # Main server file
├── routes/           # API routes
├── middleware/       # Custom middleware
├── controllers/      # Route controllers
├── services/         # Business logic
└── utils/            # Utility functions
```
