import { getDB } from '../../config/database.js';

class PedidosProductosModel {
  // Agregar producto a un pedido
  static async agregar(datos) {
    const pool = getDB();
    const { pedido_id, producto_id, cantidad, precio_unitario, notas } = datos;
    
    const subtotal = cantidad * precio_unitario;
    
    const query = `
      INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas, created_at
    `;
    
    const values = [pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Agregar múltiples productos a un pedido (transacción)
  static async agregarMultiples(pedido_id, productos) {
    const pool = getDB();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const productosAgregados = [];
      
      for (const prod of productos) {
        const subtotal = prod.cantidad * prod.precio_unitario;
        
        const query = `
          INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas, created_at
        `;
        
        const values = [pedido_id, prod.producto_id, prod.cantidad, prod.precio_unitario, subtotal, prod.notas];
        const result = await client.query(query, values);
        productosAgregados.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return productosAgregados;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener productos de un pedido
  static async obtenerPorPedido(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        pp.id,
        pp.pedido_id,
        pp.producto_id,
        p.nombre as producto_nombre,
        p.descripcion as producto_descripcion,
        p.imagen_url as producto_imagen,
        c.nombre as categoria_nombre,
        pp.cantidad,
        pp.precio_unitario,
        pp.subtotal,
        pp.notas,
        pp.created_at
      FROM pedidos_productos pp
      INNER JOIN productos p ON pp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE pp.pedido_id = $1
      ORDER BY pp.created_at ASC
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows;
  }

  // Obtener detalle de un producto específico en un pedido
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        pp.id,
        pp.pedido_id,
        pp.producto_id,
        p.nombre as producto_nombre,
        p.descripcion as producto_descripcion,
        p.imagen_url as producto_imagen,
        pp.cantidad,
        pp.precio_unitario,
        pp.subtotal,
        pp.notas,
        pp.created_at
      FROM pedidos_productos pp
      INNER JOIN productos p ON pp.producto_id = p.id
      WHERE pp.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar cantidad y recalcular subtotal
  static async actualizarCantidad(id, cantidad) {
    const pool = getDB();
    const query = `
      UPDATE pedidos_productos
      SET cantidad = $1,
          subtotal = cantidad * precio_unitario
      WHERE id = $2
      RETURNING id, pedido_id, producto_id, cantidad, precio_unitario, subtotal
    `;
    
    const result = await pool.query(query, [cantidad, id]);
    return result.rows[0];
  }

  // Actualizar notas de un producto en el pedido
  static async actualizarNotas(id, notas) {
    const pool = getDB();
    const query = `
      UPDATE pedidos_productos
      SET notas = $1
      WHERE id = $2
      RETURNING id, notas
    `;
    
    const result = await pool.query(query, [notas, id]);
    return result.rows[0];
  }

  // Eliminar producto de un pedido
  static async eliminar(id) {
    const pool = getDB();
    const query = `
      DELETE FROM pedidos_productos 
      WHERE id = $1 
      RETURNING id, pedido_id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar todos los productos de un pedido
  static async eliminarPorPedido(pedido_id) {
    const pool = getDB();
    const query = `DELETE FROM pedidos_productos WHERE pedido_id = $1`;
    const result = await pool.query(query, [pedido_id]);
    return result.rowCount;
  }

  // Calcular total de un pedido
  static async calcularTotal(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT COALESCE(SUM(subtotal), 0) as total
      FROM pedidos_productos
      WHERE pedido_id = $1
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return parseFloat(result.rows[0].total);
  }

  // Verificar si existe un producto en un pedido
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id, pedido_id FROM pedidos_productos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si un producto ya está en el pedido
  static async productoEnPedido(pedido_id, producto_id) {
    const pool = getDB();
    const query = `
      SELECT id, cantidad 
      FROM pedidos_productos 
      WHERE pedido_id = $1 AND producto_id = $2
    `;
    
    const result = await pool.query(query, [pedido_id, producto_id]);
    return result.rows[0];
  }

  // Obtener estadísticas de productos en pedidos
  static async obtenerEstadisticas(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_items,
        SUM(cantidad) as cantidad_total,
        SUM(subtotal) as total_pedido,
        ROUND(AVG(precio_unitario), 2) as precio_promedio
      FROM pedidos_productos
      WHERE pedido_id = $1
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows[0];
  }

  // Obtener resumen por categoría de un pedido
  static async obtenerResumenPorCategoria(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        c.nombre as categoria,
        COUNT(pp.id) as cantidad_items,
        SUM(pp.cantidad) as cantidad_productos,
        SUM(pp.subtotal) as subtotal_categoria
      FROM pedidos_productos pp
      INNER JOIN productos p ON pp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE pp.pedido_id = $1
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows;
  }
}

export default PedidosProductosModel;
