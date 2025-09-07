# IT Partner E-commerce Backend

Backend API for the IT Partner E-commerce application built with Node.js, Express, TypeScript, and Prisma.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management (Admin & Regular Users)
- 📦 Product Management
- 🛒 Shopping Cart
- 💳 Order Processing with Razorpay Integration
- 📧 Contact Form Handling
- 📊 Visitor Tracking
- ✅ Input Validation with Zod
- 🛡️ Security with Helmet & CORS
- 📝 Request Logging with Morgan

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, bcryptjs
- **Payment**: Razorpay
- **Development**: Nodemon, ts-node

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd itpartner_ecommerce/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/itpartner_ecommerce?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/users` - Get all users (Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `POST /api/cart/multiple` - Add multiple items to cart
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/create` - Create order
- `POST /api/orders/razorpay/create` - Create Razorpay order
- `POST /api/orders/razorpay/verify` - Verify Razorpay payment

### Contact
- `POST /api/contact` - Submit contact form

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard data

### Visitors
- `GET /api/visitors` - Get visitor statistics

## Database Schema

The application uses the following main entities:
- **Users**: User accounts with roles (ADMIN/USER)
- **Products**: Product catalog
- **CartItems**: Shopping cart items
- **Orders**: Order information
- **OrderItems**: Individual items in orders
- **Payments**: Payment records
- **ContactForms**: Contact form submissions
- **Admins**: Admin accounts
- **Visitors**: Visitor tracking data

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # TypeScript type definitions
│   ├── lib/           # Utility libraries
│   └── index.ts       # Application entry point
├── prisma/
│   ├── migrations/    # Database migrations
│   └── schema.prisma  # Database schema
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with Zod
- CORS protection
- Helmet security headers
- SQL injection protection with Prisma
- Rate limiting (can be added)

## Error Handling

The application includes comprehensive error handling:
- Global error handler middleware
- Validation error responses
- Database error handling
- HTTP status code management
- Detailed error logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
