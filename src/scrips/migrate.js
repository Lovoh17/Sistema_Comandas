// scripts/migrate.js
import { getDB, executeQuery } from '../config/database.js';

class MigrationManager {
  constructor() {
    this.migrations = [
      this.createMigrationsTable,
      this.createCategoriasTable,
      this.createUsuariosTable,
      this.createProductosTable,
      this.createPedidosTable,
      this.createPedidosProductosTable,
      this.createMenuDiasTable,
      this.createMenuDiasProductosTable,
      this.createHistorialPedidosTable,
      this.createGananciasTable,
      this.insertInitialData
    ];
  }

  // Tabla para control de migraciones
  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla de migraciones creada/verificada');
  }

  // Crear tabla categorias
  async createCategoriasTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla categorias creada/verificada');
  }

  // Crear tabla usuarios
  async createUsuariosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('cliente', 'administrador')),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla usuarios creada/verificada');
  }

  // Crear tabla productos
  async createProductosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        categoria_id INTEGER NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
        disponible BOOLEAN DEFAULT TRUE,
        imagen_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla productos creada/verificada');
  }

  // Crear tabla pedidos
  async createPedidosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        numero_pedido VARCHAR(20) UNIQUE NOT NULL,
        numero_mesa VARCHAR(10),
        ubicacion VARCHAR(100),
        total DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
        notas TEXT,
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla pedidos creada/verificada');
  }

  // Crear tabla pedidos_productos
  async createPedidosProductosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS pedidos_productos (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
        subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla pedidos_productos creada/verificada');
  }

  // Crear tabla menu_dias
  async createMenuDiasTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS menu_dias (
        id SERIAL PRIMARY KEY,
        dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
        fecha DATE NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla menu_dias creada/verificada');
  }

  // Crear tabla menu_dias_productos
  async createMenuDiasProductosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS menu_dias_productos (
        id SERIAL PRIMARY KEY,
        menu_dia_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        disponible_hoy BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_dia_id) REFERENCES menu_dias(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        UNIQUE(menu_dia_id, producto_id)
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla menu_dias_productos creada/verificada');
  }

  // Crear tabla historial_pedidos
  async createHistorialPedidosTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS historial_pedidos (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        estado_anterior VARCHAR(20) CHECK (estado_anterior IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
        estado_nuevo VARCHAR(20) NOT NULL CHECK (estado_nuevo IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
        comentario TEXT,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla historial_pedidos creada/verificada');
  }

  // Crear tabla ganancias
  async createGananciasTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ganancias (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        total_venta DECIMAL(10, 2) NOT NULL CHECK (total_venta >= 0),
        costos DECIMAL(10, 2) DEFAULT 0 CHECK (costos >= 0),
        ganancia_neta DECIMAL(10, 2) NOT NULL CHECK (ganancia_neta >= 0),
        porcentaje_ganancia DECIMAL(5, 2),
        fecha DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
      )
    `;
    await executeQuery(query);
    console.log('✅ Tabla ganancias creada/verificada');
  }

  // Insertar datos iniciales
  async insertInitialData() {
    // Insertar categorías
    const categoriasQuery = `
      INSERT INTO categorias (nombre, descripcion) 
      VALUES 
        ('Bebidas', 'Bebidas frías y calientes'),
        ('Platos Fuertes', 'Platos principales del menú'),
        ('Entradas', 'Aperitivos y entradas'),
        ('Postres', 'Postres y dulces')
      ON CONFLICT (nombre) DO NOTHING
    `;
    await executeQuery(categoriasQuery);
    console.log('✅ Datos iniciales de categorías insertados');

    // Insertar usuario administrador (password: admin123)
    const adminQuery = `
      INSERT INTO usuarios (nombre, email, telefono, password, rol) 
      VALUES (
        'Administrador', 
        'admin@restaurante.com', 
        '1234-5678', 
        '$2b$10$examplehashforadmin123', 
        'administrador'
      ) ON CONFLICT (email) DO NOTHING
    `;
    await executeQuery(adminQuery);
    console.log('✅ Usuario administrador creado');
  }

  // Verificar si migración ya fue ejecutada
  async isMigrationExecuted(migrationName) {
    try {
      const result = await executeQuery(
        'SELECT id FROM migrations WHERE name = $1',
        [migrationName]
      );
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Marcar migración como ejecutada
  async markMigrationExecuted(migrationName) {
    await executeQuery(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migrationName]
    );
  }

  // Ejecutar todas las migraciones
  async runMigrations() {
    try {
      console.log('🚀 Iniciando migraciones de base de datos...\n');

      for (const migration of this.migrations) {
        const migrationName = migration.name;

        // Verificar si ya se ejecutó
        if (await this.isMigrationExecuted(migrationName)) {
          console.log(`⏭️  Migración ${migrationName} ya ejecutada, omitiendo...`);
          continue;
        }

        console.log(`🔄 Ejecutando migración: ${migrationName}`);
        await migration.call(this);
        await this.markMigrationExecuted(migrationName);
        console.log(`✅ Migración ${migrationName} completada\n`);
      }

      console.log('🎉 ¡Todas las migraciones completadas exitosamente!');
    } catch (error) {
      console.error('💥 Error durante las migraciones:', error);
      throw error;
    }
  }

  // Verificar estado de migraciones
  async checkMigrationsStatus() {
    try {
      const result = await executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM migrations) as executed_migrations,
          (SELECT COUNT(*) FROM information_schema.tables 
           WHERE table_schema = 'public') as total_tables
      `);

      const executed = result.rows[0].executed_migrations;
      const totalTables = result.rows[0].total_tables;

      console.log('📊 Estado de migraciones:');
      console.log(`   • Migraciones ejecutadas: ${executed}`);
      console.log(`   • Tablas en la base de datos: ${totalTables}`);
      console.log(`   • Migraciones pendientes: ${this.migrations.length - executed}`);

      return { executed, totalTables, pending: this.migrations.length - executed };
    } catch (error) {
      console.error('Error verificando estado:', error);
      return { executed: 0, totalTables: 0, pending: this.migrations.length };
    }
  }
}

// Función principal para ejecutar migraciones
export async function runDatabaseMigrations() {
  const migrationManager = new MigrationManager();
  await migrationManager.runMigrations();
}

export async function checkDatabaseStatus() {
  const migrationManager = new MigrationManager();
  return await migrationManager.checkMigrationsStatus();
}