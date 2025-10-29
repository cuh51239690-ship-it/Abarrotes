const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Ruta no encontrada' 
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

// Agrega esta ruta en server.js después de las otras rutas
app.get('/api/debug/users', async (req, res) => {
    try {
        const { pool } = require('./config/database');
        const [users] = await pool.execute('SELECT * FROM usuarios');
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Error en debug:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});