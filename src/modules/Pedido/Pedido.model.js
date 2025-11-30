import { getDB } from '../../config/database.js';

class PedidoModel {
  // Crear un nuevo pedido
  static async crear(datos) {
    const pool = getDB();
    const { usuario_id, numero_pedido, numero_mesa, ubicacion, total = 0, estado = 'pendiente', notas } = datos;
    
    const query = `
      INSERT INTO pedidos (usuario_id, numero_pedido, numero_mesa, ubicacion, total, estado, notas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, usuario_id, numero_pedido, numero_mesa, ubicacion, total, estado, notas, fecha_pedido, created_at
    `;
    
    const values = [usuario_id, numero_pedido, numero_mesa, ubicacion, total, estado, notas];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todos los pedidos con filtros
  static async obtenerTodos(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        p.id,
        p.usuario_id,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        p.numero_pedido,
        p.numero_mesa,
        p.ubicacion,
        p.total,
        p.estado,
        p.notas,
        p.fecha_pedido,
        p.created_at,
        p.updated_at,
        COUNT(pp.id) as total_productos
      FROM pedidos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedidos_productos pp ON p.id = pp.pedido_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por estado
    if (filtros.estado) {
      query += ` AND p.estado = $${paramCount}`;
      values.push(filtros.estado);
      paramCount++;
    }

    // Filtro por usuario
    if (filtros.usuario_id) {
      query += ` AND p.usuario_id = $${paramCount}`;
      values.push(filtros.usuario_id);
      paramCount++;
    }

    // Filtro por número de mesa
    if (filtros.numero_mesa) {
      query += ` AND p.numero_mesa = $${paramCount}`;
      values.push(filtros.numero_mesa);
      paramCount++;
    }

    // Filtro por fecha (rango)
    if (filtros.fecha_desde) {
      query += ` AND DATE(p.fecha_pedido) >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND DATE(p.fecha_pedido) <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
      paramCount++;
    }

    query += ` GROUP BY p.id, u.nombre, u.email`;
    query += ` ORDER BY p.fecha_pedido DESC`;

    // Paginación
    if (filtros.limite) {
      query += ` LIMIT $${paramCount}`;
      values.push(filtros.limite);
      paramCount++;
    }

    if (filtros.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filtros.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Obtener pedido por ID con detalles completos
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.usuario_id,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        u.telefono as cliente_telefono,
        p.numero_pedido,
        p.numero_mesa,
        p.ubicacion,
        p.total,
        p.estado,
        p.notas,
        p.fecha_pedido,
        p.created_at,
        p.updated_at
      FROM pedidos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener pedido por número de pedido
  static async obtenerPorNumeroPedido(numero_pedido) {
    const pool = getDB();
    const query = `
      SELECT 
        p.*,
        u.nombre as cliente_nombre,
        u.email as cliente_email
      FROM pedidos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.numero_pedido = $1
    `;
    
    const result = await pool.query(query, [numero_pedido]);
    return result.rows[0];
  }

  // Actualizar pedido
  static async actualizar(id, datos) {
    const pool = getDB();
    const { numero_mesa, ubicacion, total, estado, notas } = datos;
    
    const query = `
      UPDATE pedidos
      SET numero_mesa = COALESCE($1, numero_mesa),
          ubicacion = COALESCE($2, ubicacion),
          total = COALESCE($3, total),
          estado = COALESCE($4, estado),
          notas = COALESCE($5, notas),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, numero_pedido, numero_mesa, ubicacion, total, estado, notas, updated_at
    `;
    
    const values = [numero_mesa, ubicacion, total, estado, notas, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Actualizar estado del pedido
  static async actualizarEstado(id, estado) {
    const pool = getDB();
    const query = `
      UPDATE pedidos
      SET estado = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, numero_pedido, estado, updated_at
    `;
    
    const result = await pool.query(query, [estado, id]);
    return result.rows[0];
  }

  // Actualizar total del pedido
  static async actualizarTotal(id, total) {
    const pool = getDB();
    const query = `
      UPDATE pedidos
      SET total = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, total
    `;
    
    const result = await pool.query(query, [total, id]);
    return result.rows[0];
  }

  // Cancelar pedido
  static async cancelar(id) {
    const pool = getDB();
    const query = `
      UPDATE pedidos
      SET estado = 'cancelado', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, numero_pedido, estado
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar pedido
  static async eliminar(id) {
    const pool = getDB();
    const query = `DELETE FROM pedidos WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id, estado FROM pedidos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Generar número de pedido único
  static async generarNumeroPedido() {
    const pool = getDB();
    const query = `SELECT generar_numero_pedido() as numero`;
    const result = await pool.query(query);
    return result.rows[0].numero;
  }

  // Obtener pedidos activos (no entregados ni cancelados)
  static async obtenerActivos() {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.numero_pedido,
        p.numero_mesa,
        p.ubicacion,
        u.nombre as cliente_nombre,
        p.total,
        p.estado,
        p.fecha_pedido,
        COUNT(pp.id) as total_productos
      FROM pedidos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedidos_productos pp ON p.id = pp.pedido_id
      WHERE p.estado NOT IN ('entregado', 'cancelado')
      GROUP BY p.id, u.nombre
      ORDER BY 
        CASE p.estado
          WHEN 'pendiente' THEN 1
          WHEN 'en_preparacion' THEN 2
          WHEN 'listo' THEN 3
        END,
        p.fecha_pedido ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener estadísticas de pedidos
  static async obtenerEstadisticas(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_preparacion') as en_preparacion,
        COUNT(*) FILTER (WHERE estado = 'listo') as listos,
        COUNT(*) FILTER (WHERE estado = 'entregado') as entregados,
        COUNT(*) FILTER (WHERE estado = 'cancelado') as cancelados,
        COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0) as total_ventas,
        COALESCE(ROUND(AVG(total) FILTER (WHERE estado != 'cancelado'), 2), 0) as ticket_promedio
      FROM pedidos
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filtros.fecha_desde) {
      query += ` AND DATE(fecha_pedido) >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND DATE(fecha_pedido) <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener pedidos por cliente
  static async obtenerPorCliente(usuario_id, limite = 10) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.numero_pedido,
        p.numero_mesa,
        p.ubicacion,
        p.total,
        p.estado,
        p.fecha_pedido,
        COUNT(pp.id) as total_productos
      FROM pedidos p
      LEFT JOIN pedidos_productos pp ON p.id = pp.pedido_id
      WHERE p.usuario_id = $1
      GROUP BY p.id
      ORDER BY p.fecha_pedido DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [usuario_id, limite]);
    return result.rows;
  }

  // Obtener mesas ocupadas
  static async obtenerMesasOcupadas() {
    const pool = getDB();
    const query = `
      SELECT DISTINCT 
        numero_mesa,
        COUNT(*) as pedidos_activos
      FROM pedidos
      WHERE estado NOT IN ('entregado', 'cancelado')
        AND numero_mesa IS NOT NULL
      GROUP BY numero_mesa
      ORDER BY numero_mesa
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener ventas por período
  static async obtenerVentasPorPeriodo(fecha_desde, fecha_hasta) {
    const pool = getDB();
    const query = `
      SELECT 
        DATE(fecha_pedido) as fecha,
        COUNT(*) as total_pedidos,
        SUM(total) as ventas_dia,
        ROUND(AVG(total), 2) as ticket_promedio
      FROM pedidos
      WHERE estado != 'cancelado'
        AND DATE(fecha_pedido) BETWEEN $1 AND $2
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha DESC
    `;
    
    const result = await pool.query(query, [fecha_desde, fecha_hasta]);
    return result.rows;
  }

  // Contar pedidos
  static async contar(filtros = {}) {
    const pool = getDB();
    let query = `SELECT COUNT(*) as total FROM pedidos WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filtros.estado) {
      query += ` AND estado = $${paramCount}`;
      values.push(filtros.estado);
      paramCount++;
    }

    if (filtros.usuario_id) {
      query += ` AND usuario_id = $${paramCount}`;
      values.push(filtros.usuario_id);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

export default PedidoModel;