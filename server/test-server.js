const express = require('express');
const cors = require('cors');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Simple test endpoint for citizen login
app.post('/api/auth/citizen/login', (req, res) => {
    console.log('*** CITIZEN LOGIN REQUEST RECEIVED ***');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            msg: 'Email and password are required' 
        });
    }
    
    // Mock successful login for testing
    if (email === 'rajesh@example.com' && password === 'password123') {
        const mockToken = 'mock_jwt_token_12345';
        const mockUser = {
            _id: 'mock_user_id',
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            role: 'citizen',
            points: 2450
        };
        
        console.log('✅ Login successful for:', mockUser.name);
        return res.json({ 
            success: true,
            msg: 'Login successful',
            token: mockToken,
            user: mockUser
        });
    }
    
    return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
    });
});

// Test endpoint
app.get('/api/auth/test', (req, res) => {
    res.json({ success: true, message: 'Test endpoint working!' });
});

const PORT = 5002;

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server started on http://127.0.0.1:${PORT}`);
    console.log('MongoDB connection disabled for testing');
});