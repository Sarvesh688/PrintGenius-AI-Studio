# 🎨 PrintGenius-AI-Studio

A full-stack AI-powered print-on-demand platform built with MERN stack, featuring intelligent artwork generation, real-time 3D design customization, and seamless e-commerce integration.

## 🌐 Live Demo

**[https://print-genius-ai-studio.vercel.app](https://print-genius-ai-studio.vercel.app)**

## ✨ Features

### 🤖 AI-Powered Artwork Generation
- Generate custom artwork from text prompts using **Groq (Llama 3.3)** for prompt engineering
- High-quality image generation via **Pollinations.ai** — completely free, no API key required
- Automatic background removal for clean, professional designs — background sent **directly** to Remove.bg (no intermediate upload), saving several seconds per generation
- Optimized output for print production

### 🧊 Interactive 3D Product Preview
- **True 3D product viewer** powered by [Three.js](https://threejs.org) / [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- Realistic front **and** back design rendering on a 3D model
- Smooth camera rotation via `OrbitControls` — drag to inspect any angle
- **Front / Back toggle buttons** synchronized with the 3D model rotation in the design studio, listing page, and checkout dialog
- **Hoodie detection**: when a hoodie product is selected, a dynamic hood, long sleeves, and front pocket are automatically added to the 3D model
- **Auto-rotating 3D thumbnail** displayed inside the checkout dialog so customers can inspect both sides of their order without any interaction

### 🎨 Advanced Design Studio
- Real-time drag-and-drop design editor with Fabric.js
- **Dual-side canvas**: independently design the front and back of every product
- Synchronized "Front / Back" tab controls across the 2D canvas and the 3D preview
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
- **3D Rendering**: Three.js, @react-three/fiber, @react-three/drei
- **AI Integration**: Groq (Llama 3.3-70b) for prompt engineering, Pollinations.ai for fast image generation
- **Media Processing**: Cloudinary for storage, Remove.bg for background removal
- **Authentication**: Better Auth with secure session management
- **Real-time Features**: Live design preview and mockup generation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Express API   │    │   MongoDB       │
│   (Vite + TS)   │◄──►│   (Node.js)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌──────────────────────────────────────┐
│   Stripe        │    │   AI Services                        │
│   Payments      │    │   ├── Groq (Llama 3.3) — Text  FREE  │
│                 │    │   ├── Pollinations.ai  — Image FREE   │
└─────────────────┘    │   ├── Cloudinary       — Storage     │
                       │   └── Remove.bg        — BG Removal  │
                       └──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│   3D Rendering                                              │
│   ├── Three.js / @react-three/fiber — 3D scene             │
│   ├── @react-three/drei — Decals, OrbitControls, GLTF      │
│   └── shirt_baked.glb — Base product 3D model              │
└─────────────────────────────────────────────────────────────┘
```

## 🤖 AI Pipeline (100% Free, Optimized)

```
User types a prompt
        ↓
Groq / Llama 3.3-70b (FREE)
→ Rewrites prompt into a detailed art prompt using SYSTEM_PROMPT
        ↓
Pollinations.ai fast model (FREE — no API key needed)
→ Generates a 1024×1024 image from the engineered prompt
        ↓
Remove.bg  ← raw image buffer sent DIRECTLY (no intermediate upload!)
→ Removes background for clean print-ready artwork
        ↓
Cloudinary
→ Stores the final transparent PNG
        ↓
Final artwork URL returned to frontend ✅
```

> **Performance Note**: The intermediate Cloudinary upload step has been eliminated. The generated image buffer is now streamed directly to Remove.bg, cutting generation time significantly.

## 🧊 3D Product Viewer

The 3D viewer (`ThreeDProductViewer.tsx`) renders your design on an actual 3D product model using Three.js decals.

| Feature | Details |
|---------|---------|
| Model | `shirt_baked.glb` GLTF model served from `/public` |
| Textures | Design canvases exported as PNG and applied as `<Decal>` on the front (`Z+`) and back (`Z-`) of the model |
| Color | Base color applied dynamically via `THREE.MeshStandardMaterial` |
| Hoodie Mode | Dynamic hood (sphere), long sleeves (cylinder), and pocket (box) meshes added when `productType === "HOODIE"` |
| Controls | `OrbitControls` — drag/pinch to rotate; `autoRotate` mode for the checkout thumbnail |
| Flip Toggle | `ModelGroup` uses `useFrame` to lerp `rotation.y` between `0` and `Math.PI` for smooth front/back switching |

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account for media storage
- Stripe account for payments
- Remove.bg API key for background removal
- **Groq API key** (free) — get it at [console.groq.com](https://console.groq.com)

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

   Create a `.env` file inside the `backend/` directory:

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

   # AI — Text (Free)
   GROQ_API_KEY=your_groq_api_key

   # AI — Image (Pollinations.ai — NO KEY NEEDED, leave blank)
   # Pollinations.ai is called directly via URL, no env variable required

   # Background Removal
   REMOVE_BG_API_KEY=your_remove_bg_api_key

   # Payments
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Frontend
   FRONTEND_ORIGIN=http://localhost:5173
   ```

   Create a `.env` file inside the `client/` directory:

   ```env
   VITE_API_URL=http://localhost:8000
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
   - API Docs: http://localhost:8000/api/auth/docs

## 🔑 Getting Your Free API Keys

| Service | Purpose | How to Get | Cost |
|---------|---------|-----------|------|
| [Groq](https://console.groq.com) | Prompt engineering (text) | Sign up → Create API Key | **Free** (14,400 req/day) |
| Pollinations.ai | Image generation | No signup needed — just works | **Free** (unlimited) |
| [Cloudinary](https://cloudinary.com) | Image storage | Sign up → Dashboard | Free tier available |
| [Remove.bg](https://remove.bg/api) | Background removal | Sign up → API Keys | Free tier available |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database | Sign up → Create cluster | Free tier (512MB) |
| [Stripe](https://stripe.com) | Payments | Sign up → Developer keys | Free for testing |

## 📖 API Documentation

The API is automatically documented using Better Auth's OpenAPI integration:
- **Development**: http://localhost:8000/api/auth/docs

### Key Endpoints

#### Authentication
- `POST /api/auth/sign-in` — User login
- `POST /api/auth/sign-up` — User registration
- `POST /api/auth/sign-out` — User logout

#### Products
- `GET /api/products` — Get all products
- `GET /api/products/:id` — Get product by ID

#### Listings
- `POST /api/listing` — Create new listing
- `GET /api/listing/user` — Get user's listings
- `GET /api/listing/:slug` — Get listing by slug (includes `templateType` for 3D viewer)
- `GET /api/listing/mockup/:slug/:color.jpg` — Get composited front mockup image
- `GET /api/listing/mockup/:slug/:color/back.jpg` — Get composited back mockup image
- `POST /api/listing/generate-artwork` — **Generate AI artwork (Groq + Pollinations)**

#### Orders
- `POST /api/order` — Create new order
- `GET /api/order/user` — Get user's orders
- `GET /api/order/:id` — Get order by ID

## 🔄 Changelog

### Latest Updates
- ✅ **3D Product Viewer**: Replaced all 2D flip-card previews with an interactive Three.js 3D viewer
- ✅ **Dual-Side Design**: Front and back canvases are fully independent; the 3D viewer shows both sides accurately
- ✅ **Hoodie Shape**: Dynamic hoodie geometry (hood, sleeves, pocket) rendered when product type is `HOODIE`
- ✅ **Synchronized Controls**: Front/Back toggle buttons in the design studio, listing page, and checkout dialog all sync with the 3D model rotation
- ✅ **Auto-rotating Checkout Thumbnail**: 3D product shown in checkout dialog with auto-rotation so customers see both sides
- ✅ **AI Generation Speed**: Removed intermediate Cloudinary upload; raw buffer sent directly to Remove.bg — generation is significantly faster
- ✅ **API Enhancement**: `templateType` now returned from listing endpoint to enable per-product 3D shape selection

## 🚀 Production Deployment

Update your environment variables for production:

```env
NODE_ENV=production
BASE_URL=https://your-domain.com
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the MERN stack (MongoDB, Express, React, Node.js)
- AI text powered by [Groq](https://groq.com) — Llama 3.3-70b
- AI images powered by [Pollinations.ai](https://pollinations.ai)
- 3D rendering by [Three.js](https://threejs.org) / [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)
- Design editor powered by [Fabric.js](http://fabricjs.com)
- Authentication by [Better Auth](https://better-auth.com)
- Media processing by [Cloudinary](https://cloudinary.com) and [Remove.bg](https://remove.bg)

## 📞 Contact

Sarvesh Kumar — your.email@example.com

Project Link: [https://github.com/Sarvesh688/PrintGenius-AI-Studio](https://github.com/Sarvesh688/PrintGenius-AI-Studio)