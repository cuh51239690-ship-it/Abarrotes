const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de acceso requerido' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
};

module.exports = authMiddleware;