import express from 'express';
const router = express.Router();
import  UsuarioController from './Usuario.controller.js';


router.post('/registro', UsuarioController.registrar);
router.post('/login', UsuarioController.login);


router.get('/usuarios', UsuarioController.listar);
router.get('/estadisticas', UsuarioController.obtenerEstadisticas);
router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);
router.delete('/:id', UsuarioController.eliminar);

export default router;
