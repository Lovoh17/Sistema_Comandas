import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}

const autenticar = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Token de autorización requerido',
                code: 'MISSING_TOKEN' 
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        if (!token || token.trim() === '') {
            return res.status(401).json({ 
                error: 'Token vacío',
                code: 'EMPTY_TOKEN' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.id || !decoded.email) {
            return res.status(401).json({ 
                error: 'Token con estructura inválida',
                code: 'INVALID_TOKEN_STRUCTURE' 
            });
        }
        
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
            console.log('=== MIDDLEWARE DEBUG ===');
            console.log('Token completo decodificado:', decoded);
            console.log('decoded.id:', decoded.id);
            console.log('Tipo de decoded.id:', typeof decoded.id);
            console.log('decoded tiene _id?:', decoded._id);
            console.log('ObjectId.isValid(decoded.id):', ObjectId.isValid(decoded.id));
        }
        
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            nombre: decoded.nombre,
            authenticatedAt: new Date()
        };
        
        next();
    } catch (error) {
        console.error('Error en middleware auth:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido',
                code: 'INVALID_TOKEN' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno de servidor',
            code: 'INTERNAL_ERROR' 
        });
    }
};

function requerirRol(rolesPermitidos = []) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ 
                success: false,
                message: "Autenticación requerida",
                code: "AUTH_REQUIRED"
            });
        }
        next();
    };
}

function generarToken(payload) {
    if (!payload.id || !payload.email) {
        throw new Error('Payload debe contener id y email');
    }
    
    const tokenPayload = {
        id: payload.id,
        email: payload.email,
        nombre: payload.nombre,
        iat: Math.floor(Date.now() / 1000),
    };
    
    return jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'tu-app',
        audience: 'users' 
    });
}

async function verificarToken(token) {
    try {
        if (!token) {
            throw new Error('Token requerido');
        }
        
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });
        
        if (!decoded.id || !decoded.email) {
            throw new Error('Token con estructura inválida');
        }
        
        return decoded;
    } catch (error) {
        throw error;
    }
}

export default autenticar;
export { 
    autenticar, 
    requerirRol, 
    generarToken, 
    verificarToken 
};