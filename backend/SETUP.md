# Backend Setup Instructions

## Database Configuration

The application is currently configured to use SQLite for development. If you want to use PostgreSQL instead:

1. Create a `.env` file in the backend directory with:
```
DATABASE_URL="postgresql://username:password@localhost:5432/itpartner_ecommerce"
```

2. Update `prisma/schema.prisma` to use PostgreSQL:
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run the following commands:
```bash
npx prisma generate
npx prisma db push
```

## Current Setup (SQLite)

The application is currently using SQLite with the database file at `prisma/dev.db`. To set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

## Running the Server

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build and run in production
npm run build
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email Configuration (for notifications)
RESEND_API_KEY="your-resend-api-key"
```
