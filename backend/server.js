const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Vardayini Sweet Mart Minimal Auth API is running.' });
});

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/auth/register`);
  console.log(`================================================`);
});
