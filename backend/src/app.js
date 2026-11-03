const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth.routes');
const bookRoutes    = require('./routes/book.routes');
const sessionRoutes = require('./routes/session.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes   = require('./routes/admin.routes');
const userRoutes   = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');

const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'] }));
app.use(express.json({ limit: '1mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (_req, res) => res.json({ status: 'ReadRise API' }));

app.use('/api/auth',            authRoutes);
app.use('/api/books',           bookRoutes);
app.use('/api/reading-sessions', sessionRoutes);
app.use('/api/dashboard',       dashboardRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/user',            userRoutes);
app.use('/api/payment',         paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
