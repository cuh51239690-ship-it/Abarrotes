// server/routes/products.js
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const [products] = await pool.execute(
            'SELECT * FROM productos WHERE activo = TRUE ORDER BY nombre'
        );
        
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const [products] = await pool.execute(
            'SELECT * FROM productos WHERE id = ? AND activo = TRUE',
            [productId]
        );
        
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            product: products[0]
        });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;