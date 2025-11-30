// middleware/errorHandler.js
import { ObjectId } from 'mongodb';

export class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = errorCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}

export class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}

const handleMongoError = (err) => {
    if (err.code === 11000) {
        // Error de clave duplicada
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return new ConflictError(`Ya existe un registro con ${field}: ${value}`);
    }

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return new ValidationError('ID inválido proporcionado');
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return new ValidationError('Datos inválidos', errors);
    }

    return new DatabaseError('Error en la base de datos', err);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: {
            status: err.status,
            message: err.message,
            code: err.errorCode,
            stack: err.stack,
            ...(err.errors && { errors: err.errors }),
            ...(err.originalError && { originalError: err.originalError.message })
        }
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        const response = {
            success: false,
            message: err.message,
            ...(err.errorCode && { code: err.errorCode }),
            ...(err.errors && { errors: err.errors })
        };

        res.status(err.statusCode).json(response);
    } else {
        console.error('ERROR 💥', err);

        res.status(500).json({
            success: false,
            message: 'Algo salió mal en el servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.message}`);

    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError' || err.code === 11000 || err.name === 'ValidationError') {
        error = handleMongoError(err);
    }

    if (err.message?.includes('Invalid ObjectId')) {
        error = new ValidationError('ID de recurso inválido');
    }

    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
        error = new DatabaseError('Error de conexión con la base de datos');
    }

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
    const err = new NotFoundError(`Ruta ${req.originalUrl} no encontrada en este servidor`);
    next(err);
};

// Función helper para async error handling
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Función helper para validar ObjectId
export const validateObjectId = (id, fieldName = 'ID') => {
    if (!ObjectId.isValid(id)) {
        throw new ValidationError(`${fieldName} inválido`);
    }
};

// Función helper para crear errores de validación
export const createValidationError = (message, errors = []) => {
    return new ValidationError(message, errors);
};

// Función helper para crear errores 404
export const createNotFoundError = (resource) => {
    return new NotFoundError(resource);
};

// Función helper para crear errores de conflicto
export const createConflictError = (message) => {
    return new ConflictError(message);
};

export default {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    validateObjectId,
    createValidationError,
    createNotFoundError,
    createConflictError
};