import express from "express";
import dotenv from "dotenv";
import { connectDB, getDB } from "./config/database.js";
import corsMiddleware from "./config/cors.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { runDatabaseMigrations, checkDatabaseStatus } from './scrips/migrate.js';


import CategoriaRoutes from "./modules/Categoria/Categoria.routes.js";
import UsuarioRoutes from "./modules/Usuario/Usuario.routes.js";
import {Menu_Dias_ProductosRoutes, pedidosProductosRoutes, PedidoRoutes, GananciasRoutes, Menu_DiasRoutes, ProductosRoutes, Historial_Pedidos } from "./modules/index.js";


dotenv.config();
const app = express();

await connectDB();
    
    console.log('🟢 Conectado a PostgreSQL');

    // ✅ EJECUTAR MIGRACIONES AUTOMÁTICAMENTE
    await runDatabaseMigrations();
    
    // Verificar estado
    await checkDatabaseStatus();

// Middlewares básicos
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static("uploads"));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check básico
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Sistema de Comandas API'
  });
});

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 API del Sistema de Comandas',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    console.log('🟢 Conectado a PostgreSQL');

    // Configurar rutas de la API (sin pasar db como parámetro)
    app.use('/api/categorias', CategoriaRoutes);
    app.use('/api/usuarios', UsuarioRoutes);
    app.use('/api/ganancias', GananciasRoutes);
    app.use('/api/productos',ProductosRoutes);
    app.use('/api/historial_pedidos', Historial_Pedidos);
    app.use('/api/Menu_Dias', Menu_DiasRoutes);
    app.use('/api/Menu_Dias_Productos', Menu_Dias_ProductosRoutes);
    app.use('/api/Pedidos', PedidoRoutes);
    app.use('/api/Pedidos_Productos', pedidosProductosRoutes )
    // Agrega las demás rutas aquí...
    // app.use('/api/productos', ProductosRoutes);
    // app.use('/api/pedidos', PedidoRoutes);

    

    // Manejo de errores global
    app.use(errorHandler);

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔌 API disponible en: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("💥 Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

startServer();