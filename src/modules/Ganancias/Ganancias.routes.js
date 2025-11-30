import express from 'express';
const router = express.Router();
import GananciasController from './Ganancias.controller.js';

// Rutas de consulta (orden específico)
router.get('/resumen/dia', GananciasController.obtenerResumenDia);
router.get('/resumen/periodo', GananciasController.obtenerResumenPeriodo);
router.get('/estadisticas/mensual', GananciasController.obtenerEstadisticasMensuales);
router.get('/estadisticas/anual', GananciasController.obtenerEstadisticasAnuales);
router.get('/top-dias', GananciasController.obtenerTopDias);
router.post('/comparar-periodos', GananciasController.compararPeriodos);
router.get('/:id', GananciasController.obtenerPorId);
router.get('/', GananciasController.listar);

// Rutas de modificación
router.post('/registrar-pedido/:pedido_id', GananciasController.registrarDesdePedido);
router.post('/', GananciasController.crear);
router.put('/:id', GananciasController.actualizar);
router.patch('/:id/costos', GananciasController.actualizarCostos);
router.delete('/:id', GananciasController.eliminar);

export default router;