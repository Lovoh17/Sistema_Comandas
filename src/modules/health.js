import {  getDB } from "../config/database.js";

export const setupHealthChecks = (app) => {
    // Ruta principal con health check mejorado
    app.get("/", async (req, res) => {
        try {
            const db = getDB();
            await db.admin().ping();

            res.json({
                success: true,
                message: "API funcionando correctamente",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                status: "healthy",
                database: "connected",
                endpoints: {
                    categorias: '/api/categorias',
                    carrito: '/api/carrito',
                    usuario:  '/api/usuarios',
                    productos: '/api/productos',
                    pagos: '/api/pago',
                    pedido: '/api/pedido',
                    health: '/api/health'
                }
            });
        } catch (error) {
            res.status(503).json({
                success: false,
                message: "Servicio no disponible",
                status: "unhealthy",
                database: "disconnected",
                timestamp: new Date().toISOString()
            });
        }
    });

    // Ruta específica de health check
    app.get("/api/health", async (req, res) => {
        try {
            const db = getDB();
            const startTime = Date.now();
            await db.admin().ping();
            const responseTime = Date.now() - startTime;

            let dbStats = null;
            try {
                const stats = await db.admin().serverStatus();
                dbStats = {
                    connections: stats.connections,
                    uptime: stats.uptime,
                    version: stats.version
                };
            } catch (statsError) {
                dbStats = { error: "No se pudieron obtener estadísticas" };
            }

            res.json({
                success: true,
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                database: {
                    status: "connected",
                    responseTime: `${responseTime}ms`,
                    stats: dbStats
                },
                environment: process.env.NODE_ENV || 'development'
            });
        } catch (error) {
            res.status(503).json({
                success: false,
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                database: {
                    status: "disconnected",
                    error: error.message
                }
            });
        }
    });
};