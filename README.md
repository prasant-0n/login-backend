# AuthX - Professional Authentication Backend

A comprehensive, production-ready authentication backend built with Node.js, Express, TypeScript, and MongoDB. AuthX provides a complete authentication solution with OAuth support, email verification, password reset, and role-based access control.

## 🚀 Features

### Core Authentication

- ✅ User registration with email verification
- ✅ Secure login with JWT tokens (access + refresh)
- ✅ Password hashing with bcrypt
- ✅ Logout with token invalidation
- ✅ Refresh token rotation
- ✅ Forgot/Reset password via email

### OAuth Integration

- ✅ Google OAuth 2.0
- ✅ GitHub OAuth
- ✅ Facebook OAuth
- ✅ LinkedIn OAuth
- ✅ Twitter OAuth

### Security & Performance

- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Input validation (express-validator)
- ✅ Error handling middleware
- ✅ Request logging
- ✅ TypeScript for type safety

### User Management

- ✅ Role-based access control (Admin/User)
- ✅ User profile management
- ✅ Email verification
- ✅ Account deletion
- ✅ Password change

### Admin Features

- ✅ User management dashboard
- ✅ User statistics and analytics
- ✅ Bulk user operations
- ✅ Data export (JSON/CSV)
- ✅ Search and filtering

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **OAuth**: Passport.js
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: ts-node-dev

## 📁 Project Structure

```
authx-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── app.ts       # App configuration
│   │   ├── database.ts  # Database configuration
│   │   └── oauth.ts     # OAuth configuration
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── adminController.ts
│   ├── middlewares/      # Custom middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── validation.ts # Validation middleware
│   │   └── errorHandler.ts # Error handling
│   ├── models/          # Database models
│   │   └── User.ts      # User model
│   ├── routes/          # API routes
│   │   ├── auth.ts      # Authentication routes
│   │   ├── user.ts      # User routes
│   │   └── admin.ts     # Admin routes
│   ├── services/        # Business logic services
│   │   ├── jwtService.ts # JWT token management
│   │   └── emailService.ts # Email service
│   ├── types/           # TypeScript interfaces
│   │   └── index.ts     # Type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd authx-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   BASE_URL=http://localhost:5000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/authx

   # JWT Configuration
   JWT_ACCESS_SECRET=your-super-secret-access-token-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-here

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # OAuth Configuration (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### Refresh Token

```http
GET /api/auth/refresh-token
```

#### Verify Email

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

### User Endpoints

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer <access-token>
```

#### Update Profile

```http
PUT /api/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Change Password

```http
PUT /api/user/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### Admin Endpoints

#### Get All Users

```http
GET /api/admin/users?page=1&limit=10&role=user&search=john
Authorization: Bearer <admin-access-token>
```

#### Update User

```http
PUT /api/admin/users/:id
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "role": "admin",
  "isEmailVerified": true
}
```

#### Get Dashboard Stats

```http
GET /api/admin/dashboard
Authorization: Bearer <admin-access-token>
```

## 🔐 OAuth Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/oauth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:5000/api/auth/oauth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Other OAuth Providers

Similar process for Facebook, LinkedIn, and Twitter. See their respective developer documentation.

## 🛡️ Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origins
- **Security Headers**: XSS protection, content type options, frame options
- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: No sensitive information leaked in errors

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `BASE_URL` | Base URL for callbacks | <http://localhost:5000> |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/authx |
| `JWT_ACCESS_SECRET` | JWT access token secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t authx-backend .

# Run with Docker
docker run -p 5000:5000 --env-file .env authx-backend
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors

# Testing
npm test            # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/authx-backend/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Version History

- **v1.0.0** - Initial release with core authentication features
- **v1.1.0** - Added OAuth support and admin dashboard
- **v1.2.0** - Enhanced security and performance optimizations

---

**AuthX** - Professional Authentication Backend for Modern Web Applications
