const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Test route for debugging
app.post('/api/test/worker', (req, res) => {
    res.json({ message: 'Worker test route working', body: req.body });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
console.log('Loading reports routes...');
try {
    app.use('/api/reports', require('./routes/reports'));
    console.log('Reports routes loaded successfully');
} catch (error) {
    console.error('Error loading reports routes:', error);
}
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/departments', require('./routes/departments'));
app.use('/api/worker', require('./routes/worker'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));