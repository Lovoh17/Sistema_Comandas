import express from 'express';
const router = express.Router();
import UsuarioController from './Usuario.controller.js';

// Rutas de autenticación
router.post('/registro', UsuarioController.registrar);
router.post('/login', UsuarioController.login);

// Rutas de reportes y estadísticas
router.get('/estadisticas', UsuarioController.obtenerEstadisticas);
router.get('/reportes/registros', UsuarioController.obtenerReporteRegistros);

// Rutas de gestión de usuarios
router.get('/', UsuarioController.listar);
router.get('/email/:email', UsuarioController.obtenerPorEmail);

// Rutas específicas por ID (deben ir después de las rutas específicas)
router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);
router.patch('/:id/estado', UsuarioController.cambiarEstado);
router.patch('/:id/rol', UsuarioController.cambiarRol);
router.delete('/:id', UsuarioController.eliminar);

export default router;