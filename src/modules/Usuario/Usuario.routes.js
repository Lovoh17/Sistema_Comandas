import express from 'express';
const router = express.Router();
import UsuarioController from './Usuario.controller.js';

router.post('/registro', UsuarioController.registrar);
router.post('/login', UsuarioController.login);

router.get('/estadisticas', UsuarioController.obtenerEstadisticas);
router.get('/reportes/registros', UsuarioController.obtenerReporteRegistros);

router.get('/', UsuarioController.listar);
router.get('/email/:email', UsuarioController.obtenerPorEmail);

router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);
router.patch('/:id/estado', UsuarioController.cambiarEstado);
router.patch('/:id/rol', UsuarioController.cambiarRol);
router.delete('/:id', UsuarioController.eliminar);

export default router;