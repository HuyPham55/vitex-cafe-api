process.env.TZ = 'Asia/Ho_Chi_Minh';
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const variantRoutes = require('./routes/variantRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const asmrRoutes = require('./routes/asmrRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discountRoutes = require('./routes/discountRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim().replace(/^"(.*)"$/, '$1')) 
    : ['*'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow if no origin (mobile/curl), matches allowed list, matches localhost, or allowedOrigins is '*'
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
}));

// Robust preflight handler - explicit to avoid any middleware confusion
app.options('*', (req, res) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.includes('localhost')) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
});

// Increase JSON and URL-encoded body limits to 10MB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/asmr', asmrRoutes);
app.use('/api/discounts', discountRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Vitex Cafe API is running');
});

// Export for Vercel
module.exports = app;

// Start Server conditionally
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}
