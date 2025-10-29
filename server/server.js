// server-completo.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Almacenamiento temporal en memoria
let users = [];
let nextId = 1;
let carts = {};

// Productos
const products = [
    {
        id: 1,
        nombre: 'Canasta de Frutas',
        precio: 12.99,
        descripcion: 'Selección variada de frutas frescas de temporada',
        stock: 50,
        imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        nombre: 'Variedad de Enlatados',
        precio: 8.50,
        descripcion: 'Diferentes productos enlatados: verduras, frutas y legumbres',
        stock: 100,
        imagen: 'https://fanser.com/wp-content/uploads/2022/01/proceso-de-enlatado.jpg'
    },
    {
        id: 3,
        nombre: 'Granos y Semillas',
        precio: 6.75,
        descripcion: 'Mezcla de granos y semillas nutritivas',
        stock: 75,
        imagen: 'https://static.wixstatic.com/media/7d0865_7b79ab5e9a8442fbad9291d98219287c~mv2.jpg/v1/fill/w_1000,h_667,al_c,q_85,usm_0.66_1.00_0.01/7d0865_7b79ab5e9a8442fbad9291d98219287c~mv2.jpg'
    },
    {
        id: 4,
        nombre: 'Productos Lácteos',
        precio: 10.25,
        descripcion: 'Variedad de productos lácteos frescos',
        stock: 30,
        imagen: 'https://www.webconsultas.com/sites/default/files/styles/wch_image_schema/public/media/0d/articulos/productos-lacteos.jpg'
    }
];

// ========== RUTAS DE AUTH ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, email, password, direccion, telefono } = req.body;

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: nextId++,
            nombre,
            email,
            password: hashedPassword,
            direccion: direccion || '',
            telefono: telefono || '',
            fecha_registro: new Date().toISOString()
        };

        users.push(newUser);

        const token = jwt.sign(
            { userId: newUser.id },
            'clave_temporal',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                direccion: newUser.direccion,
                telefono: newUser.telefono
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            'clave_temporal',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                direccion: user.direccion,
                telefono: user.telefono,
                fecha_registro: user.fecha_registro
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ========== RUTAS DEL CARRITO ==========
app.post('/api/cart/add', async (req, res) => {
    try {
        console.log('🛒 Agregando al carrito:', req.body);
        const { userId, productId, quantity = 1 } = req.body;
        
        if (!carts[userId]) {
            carts[userId] = [];
        }

        const product = products.find(p => p.id === parseInt(productId));
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const existingItem = carts[userId].find(item => item.productId === parseInt(productId));
        
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            carts[userId].push({
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen
            });
        }

        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            cart: carts[userId],
            total: calculateTotal(carts[userId])
        });

    } catch (error) {
        console.error('Error en cart/add:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

app.get('/api/cart/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const userCart = carts[userId] || [];

        res.json({
            success: true,
            cart: userCart,
            total: calculateTotal(userCart)
        });

    } catch (error) {
        console.error('Error en cart/:userId:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

app.put('/api/cart/update', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!carts[userId]) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        const itemIndex = carts[userId].findIndex(item => item.productId === parseInt(productId));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado en el carrito'
            });
        }

        if (quantity <= 0) {
            carts[userId].splice(itemIndex, 1);
        } else {
            carts[userId][itemIndex].quantity = parseInt(quantity);
        }

        res.json({
            success: true,
            message: 'Carrito actualizado',
            cart: carts[userId],
            total: calculateTotal(carts[userId])
        });

    } catch (error) {
        console.error('Error en cart/update:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

app.delete('/api/cart/remove', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!carts[userId]) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        carts[userId] = carts[userId].filter(item => item.productId !== parseInt(productId));

        res.json({
            success: true,
            message: 'Producto eliminado del carrito',
            cart: carts[userId],
            total: calculateTotal(carts[userId])
        });

    } catch (error) {
        console.error('Error en cart/remove:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

app.delete('/api/cart/clear/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        carts[userId] = [];

        res.json({
            success: true,
            message: 'Carrito vaciado',
            cart: []
        });

    } catch (error) {
        console.error('Error en cart/clear:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ========== OTRAS RUTAS ==========
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        products: products
    });
});

app.get('/api/debug', (req, res) => {
    res.json({
        success: true,
        message: '✅ Servidor funcionando',
        users_count: users.length,
        products_count: products.length,
        carts_count: Object.keys(carts).length
    });
});

app.get('/api/debug/routes', (req, res) => {
    res.json({
        success: true,
        message: 'Rutas disponibles',
        routes: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/cart/add',
            'GET  /api/cart/:userId',
            'PUT  /api/cart/update',
            'DELETE /api/cart/remove',
            'DELETE /api/cart/clear/:userId',
            'GET  /api/products',
            'GET  /api/debug',
            'GET  /api/debug/routes'
        ]
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Función auxiliar
function calculateTotal(cart) {
    return cart.reduce((total, item) => {
        return total + (item.precio * item.quantity);
    }, 0).toFixed(2);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log('🚀 Servidor COMPLETO funcionando en http://localhost:3000');
    console.log('📊 Diagnóstico: http://localhost:3000/api/debug');
    console.log('🛒 Carrito habilitado');
});