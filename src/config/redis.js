import { createClient } from 'redis';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.initialize();
    }

    async initialize() {
        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.log('Demasiados intentos de reconexión. Cerrando...');
                            return new Error('Demasiados intentos de reconexión');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            // Event handlers
            this.client.on('error', (err) => console.error('Redis Client Error:', err));
            this.client.on('connect', () => console.log('Redis Client Connecting...'));
            this.client.on('ready', () => {
                console.log('✅ Redis Client Connected and Ready');
                this.isConnected = true;
            });
            this.client.on('end', () => {
                console.log('Redis Client Disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            throw error;
        }
    }

    async get(key) {
        if (!this.isConnected) {
            console.log(`🔴 Redis no conectado - Key: ${key}`);
            throw new Error('Redis not connected');
        }

        try {
            const value = await this.client.get(key);
            if (value !== null) {
                console.log(`🟢 CACHE HIT - Data from Redis - Key: ${key}`);
            } else {
                console.log(`🔴 CACHE MISS - Key not found in Redis - Key: ${key}`);
            }
            return value;
        } catch (error) {
            console.error(`❌ Redis get error for key ${key}:`, error.message);
            throw error;
        }
    }

    async set(key, value, options = {}) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            const { EX = 3600 } = options;
            console.log(`💾 Saving to Redis - Key: ${key}, TTL: ${EX}s`);
            return await this.client.set(key, value, { EX });
        } catch (error) {
            console.error(`❌ Redis set error for key ${key}:`, error.message);
            throw error;
        }
    }

    async del(key) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            console.log(`🗑️  Deleting from Redis - Key: ${key}`);
            return await this.client.del(key);
        } catch (error) {
            console.error(`❌ Redis del error for key ${key}:`, error.message);
            throw error;
        }
    }

    async exists(key) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            const exists = await this.client.exists(key);
            console.log(`🔍 Check existence - Key: ${key}, Exists: ${exists}`);
            return exists;
        } catch (error) {
            console.error(`❌ Redis exists error for key ${key}:`, error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.client && this.isConnected) {
            try {
                console.log('🔌 Disconnecting from Redis...');
                await this.client.quit();
                this.isConnected = false;
                console.log('✅ Redis disconnected successfully');
            } catch (error) {
                console.error('❌ Redis disconnect error:', error.message);
                throw error;
            }
        }
    }

    // Métodos adicionales con logging
    async hSet(key, field, value) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            console.log(`💾 HSET - Key: ${key}, Field: ${field}`);
            return await this.client.hSet(key, field, value);
        } catch (error) {
            console.error(`❌ Redis hSet error for key ${key}:`, error.message);
            throw error;
        }
    }

    async hGet(key, field) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            const value = await this.client.hGet(key, field);
            if (value !== null) {
                console.log(`🟢 HGET CACHE HIT - Key: ${key}, Field: ${field}`);
            } else {
                console.log(`🔴 HGET CACHE MISS - Key: ${key}, Field: ${field}`);
            }
            return value;
        } catch (error) {
            console.error(`❌ Redis hGet error for key ${key}:`, error.message);
            throw error;
        }
    }

    async expire(key, seconds) {
        if (!this.isConnected) throw new Error('Redis not connected');

        try {
            console.log(`⏰ Setting expiration - Key: ${key}, Seconds: ${seconds}`);
            return await this.client.expire(key, seconds);
        } catch (error) {
            console.error(`❌ Redis expire error for key ${key}:`, error.message);
            throw error;
        }
    }
}

const redisService = new RedisService();

export default redisService;