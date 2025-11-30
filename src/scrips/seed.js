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

  // Seed para categorías
  async seedCategorias() {
    const query = `
      INSERT INTO categorias (nombre, descripcion) 
      VALUES 
        ('Bebidas', 'Bebidas frías, calientes y refrescantes'),
        ('Platos Fuertes', 'Platos principales y especialidades de la casa'),
        ('Entradas', 'Aperitivos y botanas para comenzar'),
        ('Ensaladas', 'Ensaladas frescas y saludables'),
        ('Sopas', 'Sopas y cremas del día'),
        ('Postres', 'Postres caseros y delicias dulces'),
        ('Especialidades', 'Platos especiales del chef'),
        ('Mariscos', 'Platos con mariscos frescos'),
        ('Carnes', 'Cortes de carne y parrilladas'),
        ('Vegetariano', 'Opciones saludables sin carne')
      ON CONFLICT (nombre) DO NOTHING
    `;
    await executeQuery(query);
    console.log('✅ 10 categorías insertadas');
  }

  // Seed para usuarios
  async seedUsuarios() {
    const query = `
      INSERT INTO usuarios (nombre, email, telefono, password, rol) 
      VALUES 
        ('Admin Principal', 'admin@restaurante.com', '555-1001', '$2b$10$examplehashforadmin123', 'administrador'),
        ('María González', 'maria.g@email.com', '555-1002', '$2b$10$examplehashforuser', 'cliente'),
        ('Carlos López', 'carlos.l@email.com', '555-1003', '$2b$10$examplehashforuser', 'cliente'),
        ('Ana Martínez', 'ana.m@email.com', '555-1004', '$2b$10$examplehashforuser', 'cliente'),
        ('Pedro Rodríguez', 'pedro.r@email.com', '555-1005', '$2b$10$examplehashforuser', 'cliente'),
        ('Laura Hernández', 'laura.h@email.com', '555-1006', '$2b$10$examplehashforuser', 'cliente'),
        ('Miguel Sánchez', 'miguel.s@email.com', '555-1007', '$2b$10$examplehashforuser', 'cliente'),
        ('Sofía Díaz', 'sofia.d@email.com', '555-1008', '$2b$10$examplehashforuser', 'cliente'),
        ('Jorge Ramírez', 'jorge.r@email.com', '555-1009', '$2b$10$examplehashforuser', 'cliente'),
        ('Elena Castro', 'elena.c@email.com', '555-1010', '$2b$10$examplehashforuser', 'cliente')
      ON CONFLICT (email) DO NOTHING
    `;
    await executeQuery(query);
    console.log('✅ 10 usuarios insertados');
  }

  // Seed para productos
  async seedProductos() {
    const query = `
      INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, imagen_url) 
      VALUES 
        (1, 'Coca Cola 500ml', 'Refresco de cola en presentación de 500ml', 25.00, true, '/images/cocacola.jpg'),
        (1, 'Jugo de Naranja Natural', 'Jugo de naranja recién exprimido', 35.00, true, '/images/jugo-naranja.jpg'),
        (1, 'Café Americano', 'Café negro tradicional americano', 20.00, true, '/images/cafe-americano.jpg'),
        (1, 'Agua Mineral', 'Agua mineral sin gas 500ml', 18.00, true, '/images/agua-mineral.jpg'),
        (1, 'Té Helado', 'Té negro helado con limón', 22.00, true, '/images/te-helado.jpg'),
        (1, 'Limonada Natural', 'Limonada fresca con hierbabuena', 28.00, true, '/images/limonada.jpg'),
        (1, 'Chocolate Caliente', 'Chocolate caliente cremoso', 30.00, true, '/images/chocolate-caliente.jpg'),
        (1, 'Cerveza Corona', 'Cerveza corona 355ml', 45.00, true, '/images/corona.jpg'),
        (1, 'Vino Tinto Copa', 'Copa de vino tino de la casa', 60.00, true, '/images/vino-tinto.jpg'),
        (1, 'Smoothie de Frutas', 'Batido natural de frutas mixtas', 40.00, true, '/images/smoothie.jpg')
      ON CONFLICT DO NOTHING
    `;
    await executeQuery(query);
    console.log('✅ 10 productos de bebidas insertados');

    // Insertar más productos de otras categorías
    const otrosProductos = `
      INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, imagen_url) 
      VALUES 
        (2, 'Pollo Asado', 'Pollo asado con papas y ensalada', 120.00, true, '/images/pollo-asado.jpg'),
        (2, 'Carne Asada', 'Corte de res con guarnición', 180.00, true, '/images/carne-asada.jpg'),
        (2, 'Pescado a la Plancha', 'Filete de pescado con vegetales', 150.00, true, '/images/pescado-plancha.jpg'),
        (2, 'Pasta Alfredo', 'Pasta en salsa alfredo con pollo', 110.00, true, '/images/pasta-alfredo.jpg'),
        (2, 'Hamburguesa Especial', 'Hamburguesa con queso y tocino', 95.00, true, '/images/hamburguesa.jpg'),
        (3, 'Nachos Supreme', 'Nachos con queso, guacamole y crema', 85.00, true, '/images/nachos.jpg'),
        (3, 'Alitas BBQ', 'Alitas de pollo en salsa barbacoa', 90.00, true, '/images/alitas-bbq.jpg'),
        (4, 'Ensalada César', 'Ensalada césar con pollo y crutones', 75.00, true, '/images/ensalada-cesar.jpg'),
        (5, 'Sopa de Tortilla', 'Sopa de tortilla tradicional', 55.00, true, '/images/sopa-tortilla.jpg'),
        (6, 'Flan de Caramelo', 'Flan casero con caramelo', 45.00, true, '/images/flan.jpg'),
        (6, 'Pastel de Chocolate', 'Rebanada de pastel de chocolate', 50.00, true, '/images/pastel-chocolate.jpg'),
        (7, 'Especialidad del Chef', 'Plato especial recomendado por el chef', 200.00, true, '/images/especial-chef.jpg'),
        (8, 'Camarones al Ajillo', 'Camarones en salsa de ajo', 220.00, true, '/images/camarones-ajillo.jpg'),
        (9, 'Rib Eye', 'Corte rib eye 400g con guarnición', 280.00, true, '/images/rib-eye.jpg'),
        (10, 'Bowl Vegetariano', 'Bowl con quinoa y vegetales frescos', 90.00, true, '/images/bowl-vegetariano.jpg')
      ON CONFLICT DO NOTHING
    `;
    await executeQuery(otrosProductos);
    console.log('✅ 15 productos adicionales insertados');
  }

  // Seed para menú del día
  async seedMenuDias() {
    const today = new Date();
    const dates = [];
    
    // Generar fechas para los próximos 7 días
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    for (let i = 0; i < 7; i++) {
      const query = `
        INSERT INTO menu_dias (dia_semana, fecha, descripcion) 
        VALUES ($1, $2, $3)
        ON CONFLICT (fecha) DO NOTHING
      `;
      await executeQuery(query, [
        days[i],
        dates[i],
        `Menú especial del ${days[i]} con nuestras mejores ofertas`
      ]);
    }
    console.log('✅ 7 días de menú insertados');
  }

  // Seed para menú_dias_productos
  async seedMenuDiasProductos() {
    // Asociar productos aleatorios a cada día del menú
    for (let menu_dia_id = 1; menu_dia_id <= 7; menu_dia_id++) {
      // Seleccionar 5-8 productos aleatorios para cada día
      const productosCount = 5 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < productosCount; i++) {
        const producto_id = 1 + Math.floor(Math.random() * 25); // IDs del 1 al 25
        const query = `
          INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy) 
          VALUES ($1, $2, $3)
          ON CONFLICT (menu_dia_id, producto_id) DO NOTHING
        `;
        await executeQuery(query, [menu_dia_id, producto_id, true]);
      }
    }
    console.log('✅ Asociaciones menú-productos insertadas');
  }

  // Seed para pedidos
  async seedPedidos() {
    const query = `
      INSERT INTO pedidos (usuario_id, numero_pedido, numero_mesa, ubicacion, total, estado, notas) 
      VALUES 
        (2, 'PED-20241201-0001', 'MESA-01', 'Terraza', 185.00, 'entregado', 'Sin picante'),
        (3, 'PED-20241201-0002', 'MESA-05', 'Sala principal', 240.00, 'entregado', 'Extra queso'),
        (4, 'PED-20241201-0003', 'MESA-12', 'Jardín', 95.00, 'entregado', 'Para llevar'),
        (5, 'PED-20241201-0004', 'MESA-08', 'Sala principal', 320.00, 'en_preparacion', 'Celebración cumpleaños'),
        (6, 'PED-20241201-0005', 'MESA-03', 'Terraza', 150.00, 'listo', 'Alérgico a mariscos'),
        (7, 'PED-20241201-0006', 'MESA-15', 'Sala VIP', 275.00, 'pendiente', 'Sin sal'),
        (8, 'PED-20241201-0007', 'MESA-07', 'Jardín', 80.00, 'entregado', 'Urgente'),
        (9, 'PED-20241201-0008', 'MESA-11', 'Sala principal', 190.00, 'en_preparacion', 'Vegetariano'),
        (10, 'PED-20241201-0009', 'MESA-02', 'Terraza', 210.00, 'listo', 'Bien cocido'),
        (2, 'PED-20241201-0010', 'MESA-09', 'Sala principal', 130.00, 'cancelado', 'Cliente se fue')
      ON CONFLICT (numero_pedido) DO NOTHING
    `;
    await executeQuery(query);
    console.log('✅ 10 pedidos insertados');
  }

  // Seed para pedidos_productos
  async seedPedidosProductos() {
    const pedidosProductos = [
      // Pedido 1
      { pedido_id: 1, producto_id: 1, cantidad: 2, precio_unitario: 25.00, notas: 'Sin hielo' },
      { pedido_id: 1, producto_id: 12, cantidad: 1, precio_unitario: 120.00, notas: 'Bien cocido' },
      { pedido_id: 1, producto_id: 19, cantidad: 1, precio_unitario: 45.00, notas: '' },
      
      // Pedido 2
      { pedido_id: 2, producto_id: 13, cantidad: 1, precio_unitario: 180.00, notas: 'Término medio' },
      { pedido_id: 2, producto_id: 8, cantidad: 2, precio_unitario: 45.00, notas: 'Fría' },
      { pedido_id: 2, producto_id: 17, cantidad: 1, precio_unitario: 90.00, notas: 'Extra salsa' },
      
      // Pedido 3
      { pedido_id: 3, producto_id: 15, cantidad: 1, precio_unitario: 95.00, notas: 'Sin cebolla' },
      { pedido_id: 3, producto_id: 2, cantidad: 1, precio_unitario: 35.00, notas: '' },
      
      // Pedido 4
      { pedido_id: 4, producto_id: 14, cantidad: 2, precio_unitario: 150.00, notas: '' },
      { pedido_id: 4, producto_id: 9, cantidad: 2, precio_unitario: 60.00, notas: '' },
      { pedido_id: 4, producto_id: 20, cantidad: 2, precio_unitario: 50.00, notas: '' },
      
      // Pedido 5
      { pedido_id: 5, producto_id: 16, cantidad: 1, precio_unitario: 85.00, notas: 'Extra queso' },
      { pedido_id: 5, producto_id: 3, cantidad: 2, precio_unitario: 20.00, notas: '' },
      { pedido_id: 5, producto_id: 10, cantidad: 1, precio_unitario: 40.00, notas: '' },
      
      // Pedido 6
      { pedido_id: 6, producto_id: 21, cantidad: 1, precio_unitario: 200.00, notas: '' },
      { pedido_id: 6, producto_id: 22, cantidad: 1, precio_unitario: 220.00, notas: '' },
      { pedido_id: 6, producto_id: 6, cantidad: 1, precio_unitario: 28.00, notas: 'Poca azúcar' },
      
      // Pedido 7
      { pedido_id: 7, producto_id: 18, cantidad: 1, precio_unitario: 75.00, notas: 'Sin crutones' },
      { pedido_id: 7, producto_id: 4, cantidad: 1, precio_unitario: 18.00, notas: '' },
      
      // Pedido 8
      { pedido_id: 8, producto_id: 25, cantidad: 2, precio_unitario: 90.00, notas: '' },
      { pedido_id: 8, producto_id: 7, cantidad: 1, precio_unitario: 30.00, notas: '' },
      
      // Pedido 9
      { pedido_id: 9, producto_id: 23, cantidad: 1, precio_unitario: 280.00, notas: 'Término 3/4' },
      { pedido_id: 9, producto_id: 5, cantidad: 1, precio_unitario: 22.00, notas: '' },
      
      // Pedido 10
      { pedido_id: 10, producto_id: 11, cantidad: 1, precio_unitario: 110.00, notas: 'Sin crema' },
      { pedido_id: 10, producto_id: 1, cantidad: 1, precio_unitario: 25.00, notas: '' }
    ];

    for (const item of pedidosProductos) {
      const subtotal = item.cantidad * item.precio_unitario;
      const query = `
        INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `;
      await executeQuery(query, [
        item.pedido_id,
        item.producto_id,
        item.cantidad,
        item.precio_unitario,
        subtotal,
        item.notas
      ]);
    }
    console.log('✅ Productos de pedidos insertados');
  }

  // Seed para historial_pedidos
  async seedHistorialPedidos() {
    const historial = [
      { pedido_id: 1, usuario_id: 1, estado_anterior: null, estado_nuevo: 'pendiente', comentario: 'Pedido creado' },
      { pedido_id: 1, usuario_id: 1, estado_anterior: 'pendiente', estado_nuevo: 'en_preparacion', comentario: 'Cocina tomó el pedido' },
      { pedido_id: 1, usuario_id: 1, estado_anterior: 'en_preparacion', estado_nuevo: 'listo', comentario: 'Pedido listo para servir' },
      { pedido_id: 1, usuario_id: 1, estado_anterior: 'listo', estado_nuevo: 'entregado', comentario: 'Entregado al cliente' },
      
      { pedido_id: 4, usuario_id: 1, estado_anterior: null, estado_nuevo: 'pendiente', comentario: 'Pedido creado' },
      { pedido_id: 4, usuario_id: 1, estado_anterior: 'pendiente', estado_nuevo: 'en_preparacion', comentario: 'En preparación' },
      
      { pedido_id: 10, usuario_id: 1, estado_anterior: null, estado_nuevo: 'pendiente', comentario: 'Pedido creado' },
      { pedido_id: 10, usuario_id: 1, estado_anterior: 'pendiente', estado_nuevo: 'cancelado', comentario: 'Cliente canceló el pedido' }
    ];

    for (const item of historial) {
      const query = `
        INSERT INTO historial_pedidos (pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `;
      await executeQuery(query, [
        item.pedido_id,
        item.usuario_id,
        item.estado_anterior,
        item.estado_nuevo,
        item.comentario
      ]);
    }
    console.log('✅ Historial de pedidos insertado');
  }

  // Seed para ganancias
  async seedGanancias() {
    const query = `
      INSERT INTO ganancias (pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha) 
      VALUES 
        (1, 185.00, 92.50, 92.50, 50.00, '2024-12-01'),
        (2, 240.00, 120.00, 120.00, 50.00, '2024-12-01'),
        (3, 95.00, 47.50, 47.50, 50.00, '2024-12-01'),
        (7, 80.00, 40.00, 40.00, 50.00, '2024-12-01')
      ON CONFLICT DO NOTHING
    `;
    await executeQuery(query);
    console.log('✅ Registros de ganancias insertados');
  }

  // Ejecutar todos los seeds
  async runSeeds() {
    try {
      console.log('🚀 Iniciando inserción de datos de prueba...\n');
      
      for (const seed of this.seeds) {
        console.log(`🌱 Ejecutando: ${seed.name}`);
        await seed.call(this);
      }
      
      console.log('\n🎉 ¡Todos los datos de prueba insertados exitosamente!');
      console.log('📊 Resumen:');
      console.log('   • 10 categorías');
      console.log('   • 10 usuarios');
      console.log('   • 25 productos');
      console.log('   • 7 menús del día');
      console.log('   • Asociaciones menú-productos');
      console.log('   • 10 pedidos');
      console.log('   • Productos en pedidos');
      console.log('   • Historial de pedidos');
      console.log('   • Registros de ganancias');
      
    } catch (error) {
      console.error('💥 Error durante la inserción de datos:', error);
      throw error;
    }
  }
}

// Función principal
export async function runDatabaseSeeds() {
  const seeder = new Seeder();
  await seeder.runSeeds();
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(async ({ connectDB }) => {
    try {
      await connectDB();
      await runDatabaseSeeds();
      process.exit(0);
    } catch (error) {
      console.error('💥 Error:', error);
      process.exit(1);
    }
  });
}