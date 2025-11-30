import { getDB } from '../../config/database.js';

class HistorialPedidosModel {
  // Crear registro en historial
  static async crear(datos) {
    const pool = getDB();
    const { pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario } = datos;
    
    const query = `
      INSERT INTO historial_pedidos (pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario, fecha_cambio
    `;
    
    const values = [pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener historial de un pedido
  static async obtenerPorPedido(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.id,
        hp.pedido_id,
        hp.usuario_id,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      WHERE hp.pedido_id = $1
      ORDER BY hp.fecha_cambio ASC
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows;
  }

  // Obtener todos los registros con filtros
  static async obtenerTodos(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        hp.id,
        hp.pedido_id,
        p.numero_pedido,
        hp.usuario_id,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      INNER JOIN pedidos p ON hp.pedido_id = p.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por pedido
    if (filtros.pedido_id) {
      query += ` AND hp.pedido_id = $${paramCount}`;
      values.push(filtros.pedido_id);
      paramCount++;
    }

    // Filtro por usuario que hizo el cambio
    if (filtros.usuario_id) {
      query += ` AND hp.usuario_id = $${paramCount}`;
      values.push(filtros.usuario_id);
      paramCount++;
    }

    // Filtro por estado
    if (filtros.estado_nuevo) {
      query += ` AND hp.estado_nuevo = $${paramCount}`;
      values.push(filtros.estado_nuevo);
      paramCount++;
    }

    // Filtro por rango de fechas
    if (filtros.fecha_desde) {
      query += ` AND DATE(hp.fecha_cambio) >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND DATE(hp.fecha_cambio) <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
      paramCount++;
    }

    query += ` ORDER BY hp.fecha_cambio DESC`;

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

  // Obtener registro por ID
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.id,
        hp.pedido_id,
        p.numero_pedido,
        p.numero_mesa,
        hp.usuario_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.rol as usuario_rol,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      INNER JOIN pedidos p ON hp.pedido_id = p.id
      WHERE hp.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener último cambio de un pedido
  static async obtenerUltimoCambio(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.id,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio,
        u.nombre as usuario_nombre
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      WHERE hp.pedido_id = $1
      ORDER BY hp.fecha_cambio DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows[0];
  }

  // Obtener estadísticas de cambios de estado
  static async obtenerEstadisticas(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        COUNT(*) as total_cambios,
        COUNT(DISTINCT pedido_id) as pedidos_afectados,
        COUNT(DISTINCT usuario_id) as usuarios_involucrados,
        estado_nuevo,
        COUNT(*) as cantidad_por_estado
      FROM historial_pedidos
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    if (filtros.fecha_desde) {
      query += ` AND DATE(fecha_cambio) >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND DATE(fecha_cambio) <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
    }

    query += ` GROUP BY estado_nuevo ORDER BY cantidad_por_estado DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Obtener tiempo promedio entre estados
  static async obtenerTiempoPromedioEstados() {
    const pool = getDB();
    const query = `
      WITH cambios_consecutivos AS (
        SELECT 
          pedido_id,
          estado_anterior,
          estado_nuevo,
          fecha_cambio,
          LAG(fecha_cambio) OVER (PARTITION BY pedido_id ORDER BY fecha_cambio) as fecha_anterior
        FROM historial_pedidos
      )
      SELECT 
        estado_anterior,
        estado_nuevo,
        COUNT(*) as cantidad_cambios,
        ROUND(AVG(EXTRACT(EPOCH FROM (fecha_cambio - fecha_anterior))/60), 2) as tiempo_promedio_minutos
      FROM cambios_consecutivos
      WHERE fecha_anterior IS NOT NULL
      GROUP BY estado_anterior, estado_nuevo
      ORDER BY cantidad_cambios DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener actividad por usuario
  static async obtenerActividadPorUsuario(fecha_desde, fecha_hasta) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.usuario_id,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol,
        COUNT(*) as total_cambios,
        COUNT(DISTINCT hp.pedido_id) as pedidos_modificados,
        MIN(hp.fecha_cambio) as primer_cambio,
        MAX(hp.fecha_cambio) as ultimo_cambio
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      WHERE DATE(hp.fecha_cambio) BETWEEN $1 AND $2
      GROUP BY hp.usuario_id, u.nombre, u.rol
      ORDER BY total_cambios DESC
    `;
    
    const result = await pool.query(query, [fecha_desde, fecha_hasta]);
    return result.rows;
  }

  // Obtener cambios recientes (últimos N registros)
  static async obtenerCambiosRecientes(limite = 20) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.id,
        hp.pedido_id,
        p.numero_pedido,
        u.nombre as usuario_nombre,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      INNER JOIN pedidos p ON hp.pedido_id = p.id
      ORDER BY hp.fecha_cambio DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limite]);
    return result.rows;
  }

  // Obtener línea de tiempo de un pedido
  static async obtenerLineaTiempo(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        hp.id,
        hp.estado_anterior,
        hp.estado_nuevo,
        hp.comentario,
        hp.fecha_cambio,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol,
        EXTRACT(EPOCH FROM (
          LEAD(hp.fecha_cambio) OVER (ORDER BY hp.fecha_cambio) - hp.fecha_cambio
        ))/60 as minutos_hasta_siguiente
      FROM historial_pedidos hp
      INNER JOIN usuarios u ON hp.usuario_id = u.id
      WHERE hp.pedido_id = $1
      ORDER BY hp.fecha_cambio ASC
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows;
  }

  // Verificar si existe
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id FROM historial_pedidos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Contar registros
  static async contar(filtros = {}) {
    const pool = getDB();
    let query = `SELECT COUNT(*) as total FROM historial_pedidos WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filtros.pedido_id) {
      query += ` AND pedido_id = $${paramCount}`;
      values.push(filtros.pedido_id);
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

export default HistorialPedidosModel;