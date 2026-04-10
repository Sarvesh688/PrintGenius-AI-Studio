# 🎨 PrintGenius-AI-Studio

A full-stack AI-powered print-on-demand platform built with MERN stack, featuring intelligent artwork generation, real-time design customization, and seamless e-commerce integration.

## ✨ Features

### 🤖 AI-Powered Artwork Generation
- Generate custom artwork from text prompts using advanced AI models
- Automatic background removal for clean, professional designs
- High-quality image generation optimized for print production

### 🎨 Advanced Design Studio
- Real-time drag-and-drop design editor with Fabric.js
- Live preview on product mockups (t-shirts, hoodies, etc.)
- Customizable artwork placement and scaling
- Multiple product templates and color options

### 🛍️ E-commerce Platform
- User authentication with email and Google OAuth
- Product catalog with featured and catalog sections
- Custom listing creation with pricing control
- Stripe integration for secure payments
- Order management system

### 🔧 Technical Highlights
- **Backend**: Node.js, Express, MongoDB with TypeScript
- **Frontend**: React 19 with modern component architecture
- **AI Integration**: Claude Opus 4.5 for prompt engineering, Recraft V4 for image generation
- **Media Processing**: Cloudinary for storage, Remove.bg for background removal
- **Authentication**: Better Auth with secure session management
- **Real-time Features**: Live design preview and mockup generation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Express API   │    │   MongoDB       │
│   (Vite + TS)   │◄──►│   (Node.js)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Stripe        │    │   Cloudinary    │    │   AI Services   │
│   Payments      │    │   Media Storage │    │   (Claude,      │
│                 │    │                 │    │   Recraft,      │
└─────────────────┘    └─────────────────┘    │   Remove.bg)    │
                                              └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account for media storage
- Stripe account for payments
- Remove.bg API key for background removal

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarvesh688/PrintGenius-AI-Studio.git
   cd PrintGenius-AI-Studio
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create `.env` files in both `backend/` and `client/` directories:

   **Backend Environment Variables** (`.env` in backend folder):
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8000
   BASE_URL=http://localhost:8000
   
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # Authentication
   BETTER_AUTH_SECRET=your_better_auth_secret
   BETTER_AUTH_URL=http://localhost:8000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Cloud Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # AI Services
   REMOVE_BG_API_KEY=your_remove_bg_api_key
   
   # Payments
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Frontend
   FRONTEND_ORIGIN=http://localhost:5173
   ```

4. **Start the development servers**
   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in client directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/auth/docs

## 📖 API Documentation

The API is automatically documented using Better Auth's OpenAPI integration. Access the documentation at:
- **Development**: http://localhost:8000/api/auth/docs
- **Production**: [Your deployed URL]/api/auth/docs

### Key Endpoints

#### Authentication
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

#### Listings
- `POST /api/listing` - Create new listing
- `GET /api/listing/user` - Get user's listings
- `GET /api/listing/:slug` - Get listing by slug
- `POST /api/listing/generate` - Generate AI artwork

#### Orders
- `POST /api/order` - Create new order
- `GET /api/order/user` - Get user's orders
- `GET /api/order/:id` - Get order by ID

## 🐳 Docker Deployment

This project includes Docker support for easy deployment:

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🚀 Production Deployment

### Environment Variables for Production
Update your environment variables for production deployment:

```env
NODE_ENV=production
BASE_URL=https://your-domain.com
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

### Database Migration
Ensure your MongoDB Atlas cluster is configured for production with:
- Proper security settings
- IP whitelisting
- Backup configurations

### SSL/HTTPS
Configure SSL certificates for your domain to ensure secure connections.

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd client
npm test
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

## 🔧 Development

### Code Style
This project uses ESLint and Prettier for consistent code formatting:
```bash
# Format code
npm run format

# Check linting
npm run lint
```

### Adding New Features
1. Follow the existing folder structure
2. Add TypeScript interfaces for new models
3. Create service functions for business logic
4. Add appropriate middleware for validation
5. Write tests for new functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the MERN stack (MongoDB, Express, React, Node.js)
- AI integration powered by Claude and Recraft
- Design editor powered by Fabric.js
- Authentication by Better Auth
- Media processing by Cloudinary and Remove.bg

## 📞 Contact

Sarvesh Kumar - [@your-twitter](https://twitter.com/your-twitter) - your.email@example.com

Project Link: [https://github.com/Sarvesh688/PrintGenius-AI-Studio](https://github.com/Sarvesh688/PrintGenius-AI-Studio)