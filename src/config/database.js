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
            console.log("🟢 Ya conectado a PostgreSQL");
            return pool;
        }

        if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER) {
            throw new Error("Variables de entorno de PostgreSQL no definidas");
        }

        isConnecting = true;

        pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'sistema_comandas',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20, 
            idleTimeoutMillis: 30000, 
            connectionTimeoutMillis: 5000, 
            allowExitOnIdle: false, 
        });

        const client = await pool.connect();
        const result = await client.query('SELECT NOW(), version()');
        client.release();

        console.log("🟢 Conectado a PostgreSQL");
        console.log(`📊 Pool de conexiones: máximo ${pool.options.max}`);
        console.log(`⏰ Hora del servidor: ${result.rows[0].now}`);
        console.log(`📌 Versión: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);

        // Configurar eventos del pool
        setupPoolEvents();

        isConnecting = false;
        return pool;

    } catch (error) {
        isConnecting = false;
        console.error("🔴 Error de conexión a PostgreSQL:", error.message);

        if (process.env.NODE_ENV === 'development') {
            console.log("🟡 Reintentando conexión en 5 segundos...");
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
    pool.on('error', (err, client) => {
        console.error('🔴 Error inesperado en el cliente del pool:', err.message);
        if (err.message.includes('Connection terminated') || 
            err.message.includes('ECONNREFUSED')) {
            console.log('🔄 Intentando reconectar...');
            pool = null;
            setTimeout(() => {
                connectDB().catch(console.error);
            }, 5000);
        }
    });

    pool.on('connect', (client) => {
        console.log('💚 Nueva conexión al pool establecida');
    });

    pool.on('acquire', (client) => {
        // console.log('🔵 Cliente adquirido del pool');
    });

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

export const checkDB = (req, res, next) => {
    if (!pool) {
        return res.status(500).json({
            success: false,
            mensaje: "Base de datos no conectada",
            error: "DATABASE_NOT_CONNECTED"
        });
    }
    req.db = pool;
    next();
};

export const healthCheck = async (req, res, next) => {
    try {
        if (!pool) {
            throw new Error("Pool no disponible");
        }

        // Query rápido para verificar conexión
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        
        next();
    } catch (error) {
        console.error('🔴 Health check falló:', error.message);
        return res.status(503).json({
            success: false,
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
            console.log("🔴 Pool de conexiones PostgreSQL cerrado limpiamente");
        }
    } catch (error) {
        console.error("🔴 Error cerrando pool:", error.message);
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
        return { connected: false };
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
                (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections
        `);
        client.release();

        return {
            connected: true,
            version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
            database: result.rows[0].database,
            user: result.rows[0].user,
            server: `${result.rows[0].server_ip}:${result.rows[0].server_port}`,
            uptime: result.rows[0].start_time,
            activeConnections: parseInt(result.rows[0].active_connections),
            poolStats: {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount
            }
        };
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error.message);
        return { connected: false, error: error.message };
    }
}

export async function executeQuery(query, params = []) {
    if (!pool) {
        throw new Error("Base de datos no conectada");
    }

    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } catch (error) {
        console.error('🔴 Error ejecutando query:', error.message);
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
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('🔴 Error en transacción:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

process.on("unhandledRejection", (err) => {
    console.error("🔴 Error no manejado:", err);
    if (process.env.NODE_ENV === 'production') {
        closeDB().finally(() => {
            process.exit(1);
        });
    }
});

process.on('uncaughtException', (err) => {
    console.error('🔴 Excepción no capturada:', err);
    closeDB().finally(() => {
        process.exit(1);
    });
});

process.on('SIGINT', async () => {
    console.log('\n🟡 Cerrando aplicación...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🟡 SIGTERM recibido, cerrando aplicación...');
    await closeDB();
    process.exit(0);
});

setInterval(async () => {
    if (!isConnected() && process.env.NODE_ENV !== 'test') {
        console.log('🔄 Verificando conexión al pool...');
        try {
            if (!pool) {
                await connectDB();
            } else {
                // Verificar que el pool esté realmente conectado
                const client = await pool.connect();
                await client.query('SELECT 1');
                client.release();
            }
        } catch (error) {
            console.error('🔴 Error en verificación de conexión:', error.message);
            pool = null;
            await connectDB();
        }
    }
}, 30000); 

export default pool;