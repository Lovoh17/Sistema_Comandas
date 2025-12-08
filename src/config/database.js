import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

let pool;
let isConnecting = false;

export async function connectDB() {
    try {
        if (isConnecting) {
            console.log("🟡 Conexión ya en progreso...");
            return;
        }

        if (pool) {
            console.log("🟢 Ya conectado a Neon PostgreSQL");
            return pool;
        }

        if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER) {
            throw new Error("Variables de entorno de PostgreSQL no definidas");
        }

        isConnecting = true;

        // ✅ CONFIGURACIÓN PARA NEON.TECH
        const poolConfig = {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            
            // ✅ SSL REQUERIDO PARA NEON
            ssl: {
                rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
            },
            
            // Configuración optimizada para Neon
            max: parseInt(process.env.DB_MAX_CONNECTIONS) || 10, // Neon Free tier: máximo 10-20
            min: 2, // Mantener 2 conexiones mínimas
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
            
            // ✅ IMPORTANTE: Mantener conexiones vivas (evita que Neon las cierre)
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
            
            // Statement timeout (30 segundos)
            statement_timeout: 30000,
            
            // Query timeout (30 segundos)
            query_timeout: 30000,
            
            allowExitOnIdle: false,
            
            // ✅ Application name para debugging en Neon
            application_name: 'sistema_comandas_app'
        };

        console.log("🔄 Conectando a Neon PostgreSQL...");
        console.log(`📍 Host: ${poolConfig.host}`);
        console.log(`📊 Database: ${poolConfig.database}`);
        console.log(`👤 User: ${poolConfig.user}`);
        console.log(`🔒 SSL: Habilitado`);
        
        pool = new Pool(poolConfig);

        // Test de conexión
        const client = await pool.connect();
        const result = await client.query('SELECT NOW(), version(), current_database(), current_user');
        client.release();

        console.log("✅ ¡Conectado exitosamente a Neon PostgreSQL!");
        console.log(`📊 Pool configurado: máximo ${pool.options.max} conexiones`);
        console.log(`⏰ Hora del servidor: ${result.rows[0].now}`);
        console.log(`📌 PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        console.log(`💾 Base de datos: ${result.rows[0].current_database}`);
        console.log(`👤 Usuario: ${result.rows[0].current_user}`);

        // Configurar eventos del pool
        setupPoolEvents();

        isConnecting = false;
        return pool;

    } catch (error) {
        isConnecting = false;
        console.error("❌ Error de conexión a Neon PostgreSQL");
        console.error("📋 Detalles del error:", error.message);
        
        // Errores comunes y soluciones
        if (error.message.includes('password authentication failed')) {
            console.error("🔑 Error de autenticación. Verifica DB_USER y DB_PASSWORD en .env");
        } else if (error.message.includes('ENOTFOUND')) {
            console.error("🌐 No se pudo resolver el host. Verifica DB_HOST en .env");
        } else if (error.message.includes('SSL')) {
            console.error("🔒 Error de SSL. Verifica que DB_SSL=true en .env");
        } else if (error.message.includes('timeout')) {
            console.error("⏱️ Timeout de conexión. Verifica tu conexión a internet");
        }

        if (process.env.NODE_ENV === 'development') {
            console.log("🔄 Reintentando conexión en 5 segundos...");
            setTimeout(() => {
                connectDB().catch(console.error);
            }, 5000);
        } else {
            process.exit(1);
        }
    }
}

function setupPoolEvents() {
    if (!pool) return;
    
    // Error en el pool
    pool.on('error', (err, client) => {
        console.error('❌ Error inesperado en el cliente del pool');
        console.error('📋 Detalles:', err.message);
        
        // Reconectar en caso de errores críticos
        if (err.message.includes('Connection terminated') || 
            err.message.includes('ECONNREFUSED') ||
            err.message.includes('ETIMEDOUT')) {
            console.log('🔄 Intentando reconectar a Neon...');
            pool = null;
            setTimeout(() => {
                connectDB().catch(console.error);
            }, 5000);
        }
    });

    // Nueva conexión establecida
    pool.on('connect', (client) => {
        console.log('💚 Nueva conexión establecida con Neon');
    });

    // Cliente adquirido del pool
    pool.on('acquire', (client) => {
        // Opcional: descomentar para debug detallado
        // console.log('🔵 Cliente adquirido del pool');
    });

    // Cliente removido del pool
    pool.on('remove', (client) => {
        console.log('🟡 Cliente removido del pool');
    });
}

export function getDB() {
    if (!pool) {
        throw new Error("Base de datos no conectada. Llama a connectDB() primero.");
    }
    return pool;
}

// Middleware para verificar conexión DB
export const checkDB = (req, res, next) => {
    if (!pool) {
        return res.status(500).json({
            exito: false,
            mensaje: "Base de datos no conectada",
            error: "DATABASE_NOT_CONNECTED"
        });
    }
    req.db = pool;
    next();
};

// Health check middleware
export const healthCheck = async (req, res, next) => {
    try {
        if (!pool) {
            throw new Error("Pool no disponible");
        }

        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        
        next();
    } catch (error) {
        console.error('❌ Health check falló:', error.message);
        return res.status(503).json({
            exito: false,
            mensaje: "Base de datos no disponible",
            error: "DATABASE_UNAVAILABLE"
        });
    }
};

export async function closeDB() {
    try {
        if (pool) {
            await pool.end();
            pool = null;
            console.log("🔴 Pool de conexiones Neon PostgreSQL cerrado limpiamente");
        }
    } catch (error) {
        console.error("❌ Error cerrando pool:", error.message);
    }
}

export function isConnected() {
    if (!pool) return false;
    
    try {
        return pool.totalCount !== undefined;
    } catch (error) {
        return false;
    }
}

export async function getConnectionStats() {
    if (!pool) {
        return { 
            connected: false,
            provider: 'Neon PostgreSQL'
        };
    }

    try {
        const client = await pool.connect();
        const result = await client.query(`
            SELECT 
                version() as version,
                current_database() as database,
                current_user as user,
                inet_server_addr() as server_ip,
                inet_server_port() as server_port,
                pg_postmaster_start_time() as start_time,
                (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections,
                pg_database_size(current_database()) as db_size
        `);
        client.release();

        const dbSizeGB = (parseInt(result.rows[0].db_size) / (1024 * 1024 * 1024)).toFixed(2);

        return {
            connected: true,
            provider: 'Neon PostgreSQL',
            version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
            database: result.rows[0].database,
            user: result.rows[0].user,
            server: `${result.rows[0].server_ip}:${result.rows[0].server_port}`,
            uptime: result.rows[0].start_time,
            activeConnections: parseInt(result.rows[0].active_connections),
            databaseSize: `${dbSizeGB} GB`,
            poolStats: {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount,
                max: pool.options.max
            }
        };
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error.message);
        return { 
            connected: false, 
            error: error.message,
            provider: 'Neon PostgreSQL'
        };
    }
}

export async function executeQuery(query, params = []) {
    if (!pool) {
        throw new Error("Base de datos no conectada");
    }

    const client = await pool.connect();
    try {
        const startTime = Date.now();
        const result = await client.query(query, params);
        const duration = Date.now() - startTime;
        
        // Log de queries lentas (más de 1 segundo)
        if (duration > 1000) {
            console.warn(`⚠️ Query lenta (${duration}ms):`, query.substring(0, 100));
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error ejecutando query:', error.message);
        console.error('📝 Query:', query.substring(0, 200));
        throw error;
    } finally {
        client.release();
    }
}

export async function executeTransaction(callback) {
    if (!pool) {
        throw new Error("Base de datos no conectada");
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🔄 Transacción iniciada');
        
        const result = await callback(client);
        
        await client.query('COMMIT');
        console.log('✅ Transacción confirmada');
        
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transacción revertida:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// ============================================
// MANEJO DE ERRORES Y SEÑALES DEL PROCESO
// ============================================

process.on("unhandledRejection", (err) => {
    console.error("❌ Promise no manejada:", err);
    if (process.env.NODE_ENV === 'production') {
        closeDB().finally(() => {
            process.exit(1);
        });
    }
});

process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err);
    closeDB().finally(() => {
        process.exit(1);
    });
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT recibido, cerrando conexión con Neon...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM recibido, cerrando conexión con Neon...');
    await closeDB();
    process.exit(0);
});

// ============================================
// HEALTH CHECK PERIÓDICO
// ============================================

// Verificar conexión cada 30 segundos
setInterval(async () => {
    if (!isConnected() && process.env.NODE_ENV !== 'test') {
        console.log('🔄 Verificando conexión con Neon...');
        try {
            if (!pool) {
                await connectDB();
            } else {
                const client = await pool.connect();
                await client.query('SELECT 1');
                client.release();
                console.log('✅ Conexión con Neon verificada');
            }
        } catch (error) {
            console.error('❌ Error en verificación de conexión:', error.message);
            pool = null;
            await connectDB();
        }
    }
}, 30000);

export default pool;