// src/scripts/seed.js
import { executeQuery } from '../config/database.js';

class Seeder {
  constructor() {
    this.seeds = [
      this.seedCategorias,
      this.seedUsuarios,
      this.seedProductos,
      this.seedMenuDias,
      this.seedMenuDiasProductos,
      this.seedPedidos,
      this.seedPedidosProductos,
      this.seedHistorialPedidos,
      this.seedGanancias
    ];
  }

  // ============================================
  // FUNCIÓN DE LIMPIEZA DE BASE DE DATOS
  // ============================================

  async cleanupDatabase() {
    console.log('🧹 Iniciando limpieza de base de datos...');
    console.log('⚠️  ADVERTENCIA: Esto borrará TODOS los datos existentes\n');
    
    try {
      const tables = [
        'ganancias',
        'historial_pedidos',
        'pedidos_productos',
        'pedidos',
        'menu_dias_productos',
        'menu_dias',
        'productos',
        'usuarios',
        'categorias'
      ];

      for (const table of tables) {
        try {
          console.log(`   Limpiando tabla: ${table}...`);
          await executeQuery(`DELETE FROM ${table};`);
          console.log(`   ✅ ${table} limpiada`);
        } catch (error) {
          console.error(`   ❌ Error limpiando ${table}: ${error.message}`);
        }
      }

      console.log('\n🔄 Reiniciando secuencias...');
      const sequences = [
        'categorias_id_seq',
        'usuarios_id_seq',
        'productos_id_seq',
        'menu_dias_id_seq',
        'pedidos_id_seq',
        'ganancias_id_seq',
        'historial_pedidos_id_seq'
      ];

      for (const sequence of sequences) {
        try {
          await executeQuery(`SELECT setval('${sequence}', 1, false);`);
          console.log(`   ✅ Secuencia ${sequence} reiniciada`);
        } catch (error) {
          console.log(`   ℹ️  Secuencia ${sequence} no existe`);
        }
      }
      
      console.log('\n✅ Base de datos completamente limpiada');
      
    } catch (error) {
      console.error('💥 Error durante la limpieza:', error.message);
      throw error;
    }
  }

  // ============================================
  // SEED: CATEGORÍAS
  // ============================================

  async seedCategorias() {
    console.log('🌱 Insertando categorías...');
    
    const query = `
      INSERT INTO categorias (nombre, descripcion, activo) 
      VALUES 
        ('Bebidas', 'Bebidas frías, calientes y refrescantes', true),
        ('Platos Fuertes', 'Platos principales y especialidades', true),
        ('Entradas', 'Aperitivos y botanas', true),
        ('Ensaladas', 'Ensaladas frescas', true),
        ('Sopas', 'Sopas y cremas del día', true),
        ('Postres', 'Postres caseros', true),
        ('Especialidades', 'Platos especiales del chef', true),
        ('Mariscos', 'Platos con mariscos frescos', true),
        ('Carnes', 'Cortes de carne', true),
        ('Vegetariano', 'Opciones vegetarianas', true),
        ('Infantil', 'Menú para niños', true),
        ('Desayunos', 'Desayunos y brunch', true),
        ('Acompañamientos', 'Guarniciones', true),
        ('Panadería', 'Pan y repostería', true),
        ('Licores', 'Bebidas alcohólicas', true)
      ON CONFLICT (nombre) DO NOTHING
      RETURNING id, nombre;
    `;
    
    const result = await executeQuery(query);
    console.log(`✅ ${result.rowCount} categorías insertadas`);
    return result.rows;
  }

  // ============================================
  // SEED: USUARIOS
  // ============================================

  async seedUsuarios() {
    console.log('🌱 Insertando usuarios...');
    
    const query = `
      INSERT INTO usuarios (nombre, email, telefono, password, rol, activo) 
      VALUES 
        ('Admin Principal', 'admin@restaurante.com', '555-1001', '$2b$10$ExampleHash123456', 'administrador', true),
        ('María González', 'maria.g@email.com', '555-1002', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Carlos López', 'carlos.l@email.com', '555-1003', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Ana Martínez', 'ana.m@email.com', '555-1004', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Pedro Rodríguez', 'pedro.r@email.com', '555-1005', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Laura Hernández', 'laura.h@email.com', '555-1006', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Miguel Sánchez', 'miguel.s@email.com', '555-1007', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Sofía Díaz', 'sofia.d@email.com', '555-1008', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Jorge Ramírez', 'jorge.r@email.com', '555-1009', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Elena Castro', 'elena.c@email.com', '555-1010', '$2b$10$ExampleHash123456', 'cliente', true),
        ('Chef Principal', 'chef@restaurante.com', '555-1011', '$2b$10$ExampleHash123456', 'chef', true),
        ('Mesero 1', 'mesero1@restaurante.com', '555-1012', '$2b$10$ExampleHash123456', 'mesero', true),
        ('Mesero 2', 'mesero2@restaurante.com', '555-1013', '$2b$10$ExampleHash123456', 'mesero', true),
        ('Cajero', 'cajero@restaurante.com', '555-1014', '$2b$10$ExampleHash123456', 'cajero', true),
        ('Gerente', 'gerente@restaurante.com', '555-1015', '$2b$10$ExampleHash123456', 'gerente', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, nombre, rol;
    `;
    
    const result = await executeQuery(query);
    console.log(`✅ ${result.rowCount} usuarios insertados`);
    return result.rows;
  }

  // ============================================
  // SEED: PRODUCTOS
  // ============================================

  async seedProductos() {
    console.log('🌱 Insertando productos...');
    
    const productos = [
      // Bebidas (categoria_id: 1)
      [1, 'Coca Cola 500ml', 'Refresco de cola', 25.00, true, '/images/bebidas/cocacola.jpg'],
      [1, 'Jugo de Naranja', 'Jugo natural recién exprimido', 35.00, true, '/images/bebidas/jugo-naranja.jpg'],
      [1, 'Café Americano', 'Café negro preparado', 20.00, true, '/images/bebidas/cafe.jpg'],
      [1, 'Agua Mineral', 'Agua sin gas 500ml', 18.00, true, '/images/bebidas/agua.jpg'],
      [1, 'Té Helado', 'Té frío con limón', 22.00, true, '/images/bebidas/te.jpg'],
      
      // Platos Fuertes (categoria_id: 2)
      [2, 'Pollo Asado', 'Pollo al horno con papas', 120.00, true, '/images/platos/pollo.jpg'],
      [2, 'Carne Asada', 'Corte de res a la parrilla', 180.00, true, '/images/platos/carne.jpg'],
      [2, 'Pescado a la Plancha', 'Filete de pescado fresco', 150.00, true, '/images/platos/pescado.jpg'],
      [2, 'Pasta Alfredo', 'Pasta con salsa cremosa', 110.00, true, '/images/platos/pasta.jpg'],
      [2, 'Hamburguesa Especial', 'Hamburguesa con papas', 95.00, true, '/images/platos/hamburguesa.jpg'],
      
      // Entradas (categoria_id: 3)
      [3, 'Nachos con Queso', 'Nachos con queso fundido', 85.00, true, '/images/entradas/nachos.jpg'],
      [3, 'Alitas BBQ', 'Alitas de pollo en salsa', 90.00, true, '/images/entradas/alitas.jpg'],
      [3, 'Queso Fundido', 'Queso con chorizo', 75.00, true, '/images/entradas/queso.jpg'],
      
      // Ensaladas (categoria_id: 4)
      [4, 'Ensalada César', 'Ensalada con pollo', 75.00, true, '/images/ensaladas/cesar.jpg'],
      [4, 'Ensalada Mixta', 'Ensalada de la casa', 65.00, true, '/images/ensaladas/mixta.jpg'],
      
      // Sopas (categoria_id: 5)
      [5, 'Sopa de Tortilla', 'Sopa tradicional', 55.00, true, '/images/sopas/tortilla.jpg'],
      [5, 'Crema de Champiñones', 'Crema de hongos', 50.00, true, '/images/sopas/champiñones.jpg'],
      
      // Postres (categoria_id: 6)
      [6, 'Flan Napolitano', 'Flan de caramelo', 45.00, true, '/images/postres/flan.jpg'],
      [6, 'Pastel de Chocolate', 'Pastel húmedo de chocolate', 50.00, true, '/images/postres/chocolate.jpg'],
      [6, 'Helado de Vainilla', 'Helado artesanal', 35.00, true, '/images/postres/helado.jpg'],
      
      // Especialidades (categoria_id: 7)
      [7, 'Especial del Chef', 'Plato especial del día', 200.00, true, '/images/especiales/chef.jpg'],
      
      // Mariscos (categoria_id: 8)
      [8, 'Camarones al Ajillo', 'Camarones en salsa de ajo', 220.00, true, '/images/mariscos/camarones.jpg'],
      [8, 'Salmón a la Plancha', 'Filete de salmón fresco', 190.00, true, '/images/mariscos/salmon.jpg'],
      
      // Carnes (categoria_id: 9)
      [9, 'Rib Eye 400g', 'Corte rib eye premium', 280.00, true, '/images/carnes/ribeye.jpg'],
      [9, 'Costillas BBQ', 'Costillas de cerdo en salsa', 210.00, true, '/images/carnes/costillas.jpg'],
      
      // Vegetariano (categoria_id: 10)
      [10, 'Bowl Vegetariano', 'Bowl con quinoa y vegetales', 90.00, true, '/images/vegetariano/bowl.jpg'],
      [10, 'Lasagna Vegetal', 'Lasagna con verduras', 110.00, true, '/images/vegetariano/lasagna.jpg'],
      
      // Infantil (categoria_id: 11)
      [11, 'Nuggets de Pollo', 'Nuggets con papas', 65.00, true, '/images/infantil/nuggets.jpg'],
      
      // Desayunos (categoria_id: 12)
      [12, 'Huevos Rancheros', 'Huevos con salsa ranchera', 70.00, true, '/images/desayunos/huevos.jpg'],
      
      // Acompañamientos (categoria_id: 13)
      [13, 'Papas Fritas', 'Papas crujientes', 40.00, true, '/images/acompañamientos/papas.jpg'],
      
      // Panadería (categoria_id: 14)
      [14, 'Pan de Ajo', 'Pan con mantequilla de ajo', 30.00, true, '/images/panaderia/pan.jpg'],
      
      // Licores (categoria_id: 15)
      [15, 'Margarita', 'Margarita clásica', 80.00, true, '/images/licores/margarita.jpg'],
      [15, 'Mojito', 'Mojito cubano', 75.00, true, '/images/licores/mojito.jpg']
    ];

    let insertedCount = 0;
    for (const producto of productos) {
      try {
        const query = `
          INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, imagen_url) 
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `;
        const result = await executeQuery(query, producto);
        if (result.rowCount > 0) insertedCount++;
      } catch (error) {
        console.error(`   ❌ Error insertando producto ${producto[1]}: ${error.message}`);
      }
    }
    
    console.log(`✅ ${insertedCount} productos insertados`);
    return insertedCount;
  }

  // ============================================
  // SEED: MENÚ DEL DÍA
  // ============================================

  async seedMenuDias() {
    console.log('🌱 Insertando menús del día...');
    
    const today = new Date();
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const descriptions = [
      'Menú del lunes: Especialidades mediterráneas',
      'Martes de tacos y comida mexicana',
      'Miércoles de pasta italiana',
      'Jueves de mariscos frescos',
      'Viernes de parrillada y carnes',
      'Sábado especial familiar',
      'Domingo brunch y comida tradicional'
    ];
    
    let insertedCount = 0;
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(today);
      fecha.setDate(today.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      try {
        const query = `
          INSERT INTO menu_dias (dia_semana, fecha, activo, descripcion) 
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `;
        
        const result = await executeQuery(query, [days[i], fechaStr, true, descriptions[i]]);
        if (result.rowCount > 0) insertedCount++;
      } catch (error) {
        console.error(`   ❌ Error insertando menú ${days[i]}: ${error.message}`);
      }
    }
    
    console.log(`✅ ${insertedCount} menús del día insertados`);
    return insertedCount;
  }

  // ============================================
  // SEED: MENÚ_DÍAS_PRODUCTOS
  // ============================================

  async seedMenuDiasProductos() {
    console.log('🌱 Asociando productos a menús...');
    
    try {
      const menus = await executeQuery('SELECT id FROM menu_dias ORDER BY id;');
      const productos = await executeQuery('SELECT id FROM productos WHERE disponible = true ORDER BY id LIMIT 20;');
      
      if (menus.rowCount === 0 || productos.rowCount === 0) {
        console.log('⚠️  No hay menús o productos para asociar');
        return 0;
      }
      
      const productIds = productos.rows.map(p => p.id);
      let associationsCount = 0;
      
      for (const menu of menus.rows) {
        const productsPerMenu = 3 + Math.floor(Math.random() * 3);
        const shuffled = [...productIds].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, productsPerMenu);
        
        for (const productId of selected) {
          try {
            const query = `
              INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy) 
              VALUES ($1, $2, $3)
            `;
            const result = await executeQuery(query, [menu.id, productId, true]);
            if (result.rowCount > 0) associationsCount++;
          } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ ${associationsCount} asociaciones creadas`);
      return associationsCount;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return 0;
    }
  }

  // ============================================
  // SEED: PEDIDOS
  // ============================================

  async seedPedidos() {
    console.log('🌱 Insertando pedidos...');
    
    try {
      const usuarios = await executeQuery("SELECT id FROM usuarios WHERE rol = 'cliente' ORDER BY id LIMIT 5;");
      
      if (usuarios.rowCount === 0) {
        console.log('⚠️  No hay usuarios cliente');
        return 0;
      }
      
      const userIds = usuarios.rows.map(u => u.id);
      const estados = ['pendiente', 'en_preparacion', 'listo', 'entregado'];
      const ubicaciones = ['Terraza', 'Sala Principal', 'Jardín'];
      const mesas = ['MESA-01', 'MESA-02', 'MESA-03', 'MESA-04', 'MESA-05'];
      
      const today = new Date();
      let insertedCount = 0;
      
      for (let i = 1; i <= 10; i++) {
        const usuarioId = userIds[Math.floor(Math.random() * userIds.length)];
        const fecha = new Date(today);
        fecha.setDate(today.getDate() - Math.floor(Math.random() * 7));
        fecha.setHours(8 + Math.floor(Math.random() * 12));
        fecha.setMinutes(Math.floor(Math.random() * 60));
        
        const total = 80 + Math.floor(Math.random() * 300);
        const estado = estados[Math.floor(Math.random() * estados.length)];
        const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
        const mesa = mesas[Math.floor(Math.random() * mesas.length)];
        const numeroPedido = `PED-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${String(i).padStart(4, '0')}`;
        
        try {
          const query = `
            INSERT INTO pedidos 
              (usuario_id, numero_pedido, numero_mesa, ubicacion, total, estado, notas, fecha_pedido) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (numero_pedido) DO NOTHING
            RETURNING id;
          `;
          
          const result = await executeQuery(query, [
            usuarioId, numeroPedido, mesa, ubicacion, total, estado,
            Math.random() > 0.7 ? 'Sin cebolla' : null,
            fecha.toISOString()
          ]);
          
          if (result.rowCount > 0) insertedCount++;
        } catch (error) {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
      
      console.log(`✅ ${insertedCount} pedidos insertados`);
      return insertedCount;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return 0;
    }
  }

  // ============================================
  // SEED: PEDIDOS_PRODUCTOS
  // ============================================

  async seedPedidosProductos() {
    console.log('🌱 Insertando productos en pedidos...');
    
    try {
      const pedidos = await executeQuery('SELECT id FROM pedidos ORDER BY id;');
      const productos = await executeQuery('SELECT id, precio FROM productos WHERE disponible = true ORDER BY id LIMIT 15;');
      
      if (pedidos.rowCount === 0 || productos.rowCount === 0) {
        console.log('⚠️  No hay pedidos o productos');
        return 0;
      }
      
      const productList = productos.rows;
      let insertedCount = 0;
      
      for (const pedido of pedidos.rows) {
        const numProductos = 1 + Math.floor(Math.random() * 3);
        const selectedProducts = [];
        
        while (selectedProducts.length < numProductos) {
          const randomProduct = productList[Math.floor(Math.random() * productList.length)];
          if (!selectedProducts.some(p => p.id === randomProduct.id)) {
            selectedProducts.push(randomProduct);
          }
        }
        
        for (const producto of selectedProducts) {
          const cantidad = 1 + Math.floor(Math.random() * 2);
          const subtotal = cantidad * producto.precio;
          
          try {
            const query = `
              INSERT INTO pedidos_productos 
                (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas) 
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT DO NOTHING
            `;
            
            const result = await executeQuery(query, [
              pedido.id, producto.id, cantidad, producto.precio, subtotal, null
            ]);
            if (result.rowCount > 0) insertedCount++;
          } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ ${insertedCount} productos de pedidos insertados`);
      return insertedCount;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return 0;
    }
  }

  // ============================================
  // SEED: HISTORIAL_PEDIDOS
  // ============================================

  async seedHistorialPedidos() {
    console.log('🌱 Insertando historial de pedidos...');
    
    try {
      const pedidos = await executeQuery(`
        SELECT p.id, p.estado, p.fecha_pedido 
        FROM pedidos p 
        ORDER BY p.id LIMIT 5
      `);
      
      const usuarios = await executeQuery(`
        SELECT id FROM usuarios 
        WHERE rol IN ('administrador', 'chef', 'mesero') 
        ORDER BY id
      `);
      
      if (pedidos.rowCount === 0 || usuarios.rowCount === 0) {
        console.log('⚠️  No hay datos para historial');
        return 0;
      }
      
      const adminIds = usuarios.rows.map(u => u.id);
      const estados = ['pendiente', 'en_preparacion', 'listo', 'entregado'];
      const comentarios = {
        'pendiente': 'Pedido creado',
        'en_preparacion': 'En preparación',
        'listo': 'Listo para servir',
        'entregado': 'Entregado al cliente'
      };
      
      let insertedCount = 0;
      
      for (const pedido of pedidos.rows) {
        const estadoIndex = estados.indexOf(pedido.estado);
        if (estadoIndex === -1) continue;
        
        for (let i = 0; i <= estadoIndex; i++) {
          const estadoAnterior = i === 0 ? null : estados[i - 1];
          const estadoNuevo = estados[i];
          const adminId = adminIds[Math.floor(Math.random() * adminIds.length)];
          
          const fechaCambio = new Date(pedido.fecha_pedido);
          fechaCambio.setMinutes(fechaCambio.getMinutes() + (i * 15));
          
          try {
            const query = `
              INSERT INTO historial_pedidos 
                (pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario, fecha_cambio) 
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT DO NOTHING
            `;
            
            const result = await executeQuery(query, [
              pedido.id, adminId, estadoAnterior, estadoNuevo,
              comentarios[estadoNuevo], fechaCambio.toISOString()
            ]);
            
            if (result.rowCount > 0) insertedCount++;
          } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ ${insertedCount} registros de historial insertados`);
      return insertedCount;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return 0;
    }
  }

  // ============================================
  // SEED: GANANCIAS
  // ============================================

  async seedGanancias() {
    console.log('🌱 Insertando registros de ganancias...');
    
    try {
      const pedidosEntregados = await executeQuery(`
        SELECT p.id, p.total, p.fecha_pedido 
        FROM pedidos p 
        WHERE p.estado = 'entregado' 
        ORDER BY p.id LIMIT 5
      `);
      
      if (pedidosEntregados.rowCount === 0) {
        console.log('⚠️  No hay pedidos entregados');
        return 0;
      }
      
      let insertedCount = 0;
      
      for (const pedido of pedidosEntregados.rows) {
        const costos = pedido.total * 0.5;
        const gananciaNeta = pedido.total - costos;
        const porcentajeGanancia = 50;
        
        try {
          const query = `
            INSERT INTO ganancias 
              (pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha) 
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
          `;
          
          const result = await executeQuery(query, [
            pedido.id, pedido.total, costos, gananciaNeta,
            porcentajeGanancia, pedido.fecha_pedido.split('T')[0]
          ]);
          
          if (result.rowCount > 0) insertedCount++;
        } catch (error) {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
      
      console.log(`✅ ${insertedCount} registros de ganancias insertados`);
      return insertedCount;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return 0;
    }
  }

  // ============================================
  // EJECUTAR TODOS LOS SEEDS
  // ============================================

   async runSeeds() {
    try {
      console.log('\n🚀 Iniciando proceso de seeding...\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const startTime = Date.now();
      const results = {};
      
      for (const seed of this.seeds) {
        const seedName = seed.name.replace('seed', '');
        console.log(`📦 Ejecutando: ${seedName}`);
        const seedStart = Date.now();
        
        try {
          const result = await seed.call(this);
          results[seedName] = result || 'OK';
          const seedDuration = ((Date.now() - seedStart) / 1000).toFixed(2);
          console.log(`   ✅ Completado en ${seedDuration}s\n`);
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
          results[seedName] = `ERROR: ${error.message}`;
        }
      }
      
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎉 ¡Proceso de seeding completado!');
      console.log(`⏱️  Tiempo total: ${totalDuration}s`);
      console.log('\n📊 RESUMEN:');
      
      for (const [key, value] of Object.entries(results)) {
        console.log(`   📍 ${key}: ${value}`);
      }
      
      console.log('\n✅ Base de datos lista para uso!\n');
      
    } catch (error) {
      console.error('\n💥 ERROR durante la inserción de datos:');
      console.error('📋 Mensaje:', error.message);
      throw error;
    }
  }
}

// ============================================
// FUNCIONES DE EXPORTACIÓN
// ============================================

export async function runDatabaseSeeds() {
  const seeder = new Seeder();
  await seeder.runSeeds();
}

export async function cleanupDatabase() {
  const seeder = new Seeder();
  await seeder.cleanupDatabase();
}

export async function cleanAndSeed() {
  const seeder = new Seeder();
  await seeder.cleanupDatabase();
  await seeder.runSeeds();
}

// Manejar ejecución directa
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const { connectDB } = await import('../config/database.js');
      await connectDB();
      
      const seeder = new Seeder();
      
      if (process.argv.includes('--cleanup-only')) {
        await seeder.cleanupDatabase();
      } else if (process.argv.includes('--seed-only')) {
        await seeder.runSeeds();
      } else {
        await seeder.cleanupDatabase();
        await seeder.runSeeds();
      }
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Error:', error);
      process.exit(1);
    }
  })();
}