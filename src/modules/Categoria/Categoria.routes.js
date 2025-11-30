import express from 'express';
const router = express.Router();
import CategoriaController from './Categoria.controller.js';

// Rutas para categorías
router.post('/', CategoriaController.crear);
router.get('/', CategoriaController.listar);
router.get('/estadisticas', CategoriaController.obtenerEstadisticas);
router.get('/con-productos', CategoriaController.obtenerConProductos);
router.get('/:id', CategoriaController.obtenerPorId);
router.put('/:id', CategoriaController.actualizar);
router.delete('/:id', CategoriaController.eliminar);
router.patch('/:id/reactivar', CategoriaController.reactivar);

export default router;