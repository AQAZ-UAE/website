const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'aqaz_secret_key_123!';

// Middleware to parse JSON and allow frontend communication
app.use(express.json());
app.use(cors());

// --- Database Configuration ---
// Make sure to match this with your XAMPP or local MySQL setup
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',       // Default XAMPP has no password
    database: 'aqaz_db' // We will create this database automatically if it doesn't exist
};

let db;

// --- Initialize Database & Tables ---
async function initDB() {
    try {
        // Connect without database first to ensure it gets created
        const con = await mysql.createConnection({
            host: '127.0.0.1',
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        await con.query(`CREATE DATABASE IF NOT EXISTS aqaz_db`);
        console.log('✅ Database "aqaz_db" ensured.');
        await con.end();

        // Now connect to the actual database
        db = await mysql.createPool(dbConfig);
        
        // Create necessary tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id VARCHAR(100) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id VARCHAR(100) NOT NULL,
                quantity INT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        `);

        console.log('✅ Database connected and tables validated!');
        
    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}


// --- Routes: User Authentication ---

// Registration Route
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!db) {
            console.error('Registration failed: Database connection not established.');
            return res.status(500).json({ message: 'Database connection error. Please restart the server.' });
        }

        // Check if user exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email address already in use' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error('REGISTRATION ERROR:', err);
        res.status(500).json({ message: 'Server Registration Error: ' + err.message });
    }
});


// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Compare password safely
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token linking to their user ID
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Login Error' });
    }
});

// --- Middleware: Verify Token ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- Routes: Cart Operations ---

app.post('/api/cart/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        // Use INSERT ... ON DUPLICATE KEY UPDATE for efficiency
        await db.query(
            `INSERT INTO cart (user_id, product_id, quantity) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [userId, productId, quantity || 1, quantity || 1]
        );

        // Get updated cart count
        const [[{ count }]] = await db.query('SELECT SUM(quantity) as count FROM cart WHERE user_id = ?', [userId]);

        res.json({ message: 'Added to cart', cartCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Cart Update Error' });
    }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Fetch Cart Error' });
    }
});

// --- Routes: Wishlist Operations ---

app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        // Check if exists
        const [rows] = await db.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);

        if (rows.length > 0) {
            // Remove
            await db.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
            res.json({ action: 'removed' });
        } else {
            // Add
            await db.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            res.json({ action: 'added' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Wishlist Toggle Error' });
    }
});

app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        const [items] = await db.query('SELECT product_id FROM wishlist WHERE user_id = ?', [req.user.id]);
        res.json(items.map(i => i.product_id));
    } catch (err) {
        res.status(500).json({ message: 'Fetch Wishlist Error' });
    }
});

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 API Server running intensely on http://localhost:${PORT}`);
    await initDB();
});
