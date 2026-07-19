# 🍽️ Shopkeepers — Restaurant Admin Dashboard

A professional full-stack Restaurant Admin Dashboard built with React, Node.js, Express, MongoDB, and Socket.io. Manage food orders, menu, customers, payments, and deliveries — similar to Swiggy/Zomato restaurant partner panels.

## ✨ Features

- **JWT Authentication** — Secure signup/login with protected routes
- **Live Dashboard** — Real-time stats, charts, and analytics
- **Order Management** — Accept/reject orders, track status, real-time updates via Socket.io
- **Menu Management** — Add/edit/delete items with categories, veg/non-veg badges, availability toggle
- **Customer Management** — View customers, order history, spending stats
- **Payments & Earnings** — Revenue analytics, monthly charts, COD vs Online breakdown
- **Delivery Partners** — Manage delivery partners, assign to orders
- **Dark/Light Mode** — Full theme support with system preference detection
- **Export** — Download orders as PDF or Excel
- **Responsive** — Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS 3 |
| Routing | React Router v7 |
| State | React Context API |
| Charts | Recharts |
| Real-time | Socket.io |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Export | jsPDF + SheetJS |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB** running locally (or MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Backend `.env` file (already created with defaults):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopkeepers
JWT_SECRET=shopkeepers_jwt_secret_key_2024
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates sample data: 1 restaurant owner, 22 menu items, 15 customers, 50 orders, payments, and 5 delivery partners.

### 4. Start Development

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 5. Login

Open http://localhost:5173 and login with:
- **Email:** `admin@restaurant.com`
- **Password:** `password123`

## 📁 Project Structure

```
Shopkeepers/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers (7 files)
│   ├── middleware/            # Auth, error handler, rate limiter, validation
│   ├── models/               # Mongoose schemas (7 models)
│   ├── routes/               # API routes (7 files)
│   ├── seeds/seed.js         # Database seeder
│   ├── socket/               # Socket.io handler
│   ├── utils/                # JWT, email service
│   └── server.js             # Express entry point
│
├── frontend/
│   └── src/
│       ├── api/axios.js      # Axios instance with interceptors
│       ├── context/          # Auth, Theme, Socket, Order contexts
│       ├── hooks/            # Custom React hooks
│       ├── utils/            # Formatters, constants, export utilities
│       ├── components/layout/ # Layout, Sidebar, Header
│       ├── pages/            # 10 page components
│       ├── App.jsx           # React Router setup
│       └── main.jsx          # Entry point with providers
└── README.md
```

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Connect to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render
1. Push to GitHub
2. Create Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add env variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| GET | /api/dashboard/stats | Dashboard stats |
| GET | /api/dashboard/weekly-sales | Weekly chart data |
| GET | /api/orders | List orders (paginated) |
| GET | /api/orders/:id | Order details |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id/status | Update status |
| GET | /api/menu | List menu items |
| POST | /api/menu | Create item |
| PUT | /api/menu/:id | Update item |
| DELETE | /api/menu/:id | Delete item |
| GET | /api/customers | List customers |
| GET | /api/payments | List payments |
| GET | /api/payments/earnings | Earnings analytics |
| GET | /api/delivery-partners | List delivery partners |

---

Built with ❤️ for restaurant owners
