require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB (kept for shopkeeper auth only)
connectDB();

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery-partners', deliveryRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), mode: 'Bunny Burger Integration' }));

// Serve frontend static files — fixes 404 on page refresh
const fs = require('fs');
const possiblePaths = [
  path.join(__dirname, '..', 'frontend', 'dist'),      // monorepo: backend/ + frontend/
  path.join(__dirname, '..', 'dist'),                    // if dist is at root
  path.join(__dirname, 'public'),                        // if copied into backend/public
  path.join(__dirname, '..', 'public'),                  // root public
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    frontendPath = p;
    break;
  }
}

if (frontendPath) {
  console.log(`✅ Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));

  // Catch-all: any non-API route serves index.html for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ No frontend dist found. Searched:', possiblePaths);
  // Catch-all: return a helpful message instead of 404
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(200).send(`
        <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f8fafc">
          <div style="text-align:center">
            <h1 style="color:#f97316">Shopkeepers API</h1>
            <p>Backend is running. Frontend dist not found.</p>
            <p style="color:#94a3b8;font-size:14px">Build the frontend first: <code>cd frontend && npm run build</code></p>
          </div>
        </body></html>
      `);
    }
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Shopkeepers server running on port ${PORT}`);
});
