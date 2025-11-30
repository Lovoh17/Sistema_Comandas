import { getDB } from '../../config/database.js';

class GananciasModel {
  // Crear registro de ganancia
  static async crear(datos) {
    const pool = getDB();
    const { pedido_id, total_venta, costos = 0, ganancia_neta, porcentaje_ganancia, fecha } = datos;
    
    const query = `
      INSERT INTO ganancias (pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha, created_at
    `;
    
    const values = [pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Registrar ganancia automáticamente desde pedido
  static async registrarDesdePedido(pedido_id) {
    const pool = getDB();
    const query = `
      WITH pedido_data AS (
        SELECT 
          id,
          total,
          DATE(fecha_pedido) as fecha
        FROM pedidos
        WHERE id = $1 AND estado = 'entregado'
      )
      INSERT INTO ganancias (pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia, fecha)
      SELECT 
        id,
        total,
        0 as costos,
        total as ganancia_neta,
        100 as porcentaje_ganancia,
        fecha
      FROM pedido_data
      ON CONFLICT (pedido_id) DO UPDATE 
      SET total_venta = EXCLUDED.total_venta,
          ganancia_neta = EXCLUDED.ganancia_neta
      RETURNING id, pedido_id, total_venta, ganancia_neta, fecha
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows[0];
  }

  // Obtener todas las ganancias con filtros
  static async obtenerTodas(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        g.id,
        g.pedido_id,
        p.numero_pedido,
        p.numero_mesa,
        u.nombre as cliente_nombre,
        g.total_venta,
        g.costos,
        g.ganancia_neta,
        g.porcentaje_ganancia,
        g.fecha,
        g.created_at
      FROM ganancias g
      INNER JOIN pedidos p ON g.pedido_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por fecha
    if (filtros.fecha) {
      query += ` AND g.fecha = $${paramCount}`;
      values.push(filtros.fecha);
      paramCount++;
    }

    // Filtro por rango de fechas
    if (filtros.fecha_desde) {
      query += ` AND g.fecha >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND g.fecha <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
      paramCount++;
    }

    // Filtro por pedido
    if (filtros.pedido_id) {
      query += ` AND g.pedido_id = $${paramCount}`;
      values.push(filtros.pedido_id);
      paramCount++;
    }

    query += ` ORDER BY g.fecha DESC, g.created_at DESC`;

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

  // Obtener ganancia por ID
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        g.id,
        g.pedido_id,
        p.numero_pedido,
        p.numero_mesa,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        g.total_venta,
        g.costos,
        g.ganancia_neta,
        g.porcentaje_ganancia,
        g.fecha,
        g.created_at
      FROM ganancias g
      INNER JOIN pedidos p ON g.pedido_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE g.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener ganancia por pedido
  static async obtenerPorPedido(pedido_id) {
    const pool = getDB();
    const query = `
      SELECT 
        id, pedido_id, total_venta, costos, ganancia_neta, 
        porcentaje_ganancia, fecha, created_at
      FROM ganancias
      WHERE pedido_id = $1
    `;
    
    const result = await pool.query(query, [pedido_id]);
    return result.rows[0];
  }

  // Actualizar ganancia
  static async actualizar(id, datos) {
    const pool = getDB();
    const { total_venta, costos, ganancia_neta, porcentaje_ganancia } = datos;
    
    const query = `
      UPDATE ganancias
      SET total_venta = COALESCE($1, total_venta),
          costos = COALESCE($2, costos),
          ganancia_neta = COALESCE($3, ganancia_neta),
          porcentaje_ganancia = COALESCE($4, porcentaje_ganancia)
      WHERE id = $5
      RETURNING id, pedido_id, total_venta, costos, ganancia_neta, porcentaje_ganancia
    `;
    
    const values = [total_venta, costos, ganancia_neta, porcentaje_ganancia, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Actualizar costos y recalcular ganancia
  static async actualizarCostos(id, costos) {
    const pool = getDB();
    const query = `
      UPDATE ganancias
      SET costos = $1,
          ganancia_neta = total_venta - $1,
          porcentaje_ganancia = CASE 
            WHEN total_venta > 0 THEN ROUND(((total_venta - $1) / total_venta * 100)::numeric, 2)
            ELSE 0
          END
      WHERE id = $2
      RETURNING id, total_venta, costos, ganancia_neta, porcentaje_ganancia
    `;
    
    const result = await pool.query(query, [costos, id]);
    return result.rows[0];
  }

  // Eliminar ganancia
  static async eliminar(id) {
    const pool = getDB();
    const query = `DELETE FROM ganancias WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id FROM ganancias WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener resumen del día
  static async obtenerResumenDia(fecha) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_totales,
        COALESCE(SUM(costos), 0) as costos_totales,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_total,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio,
        COALESCE(ROUND(AVG(total_venta), 2), 0) as ticket_promedio
      FROM ganancias
      WHERE fecha = $1
    `;
    
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  }

  // Obtener resumen por período
  static async obtenerResumenPeriodo(fecha_desde, fecha_hasta) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_totales,
        COALESCE(SUM(costos), 0) as costos_totales,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_total,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio,
        COALESCE(ROUND(AVG(total_venta), 2), 0) as ticket_promedio,
        MIN(fecha) as fecha_inicio,
        MAX(fecha) as fecha_fin
      FROM ganancias
      WHERE fecha BETWEEN $1 AND $2
    `;
    
    const result = await pool.query(query, [fecha_desde, fecha_hasta]);
    return result.rows[0];
  }

  // Obtener ganancias por día en un período
  static async obtenerPorDia(fecha_desde, fecha_hasta) {
    const pool = getDB();
    const query = `
      SELECT 
        fecha,
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total_venta), 0) as ventas_dia,
        COALESCE(SUM(costos), 0) as costos_dia,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_dia,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio,
        COALESCE(ROUND(AVG(total_venta), 2), 0) as ticket_promedio
      FROM ganancias
      WHERE fecha BETWEEN $1 AND $2
      GROUP BY fecha
      ORDER BY fecha DESC
    `;
    
    const result = await pool.query(query, [fecha_desde, fecha_hasta]);
    return result.rows;
  }

  // Obtener top días con más ganancias
  static async obtenerTopDias(limite = 10) {
    const pool = getDB();
    const query = `
      SELECT 
        fecha,
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total_venta), 0) as ventas_dia,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_dia,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio
      FROM ganancias
      GROUP BY fecha
      ORDER BY ganancia_dia DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limite]);
    return result.rows;
  }

  // Obtener estadísticas mensuales
  static async obtenerEstadisticasMensuales(anio, mes) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_totales,
        COALESCE(SUM(costos), 0) as costos_totales,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_total,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio,
        COALESCE(ROUND(AVG(total_venta), 2), 0) as ticket_promedio,
        MAX(ganancia_neta) as mejor_dia_ganancia,
        MIN(ganancia_neta) as peor_dia_ganancia
      FROM ganancias
      WHERE EXTRACT(YEAR FROM fecha) = $1
        AND EXTRACT(MONTH FROM fecha) = $2
    `;
    
    const result = await pool.query(query, [anio, mes]);
    return result.rows[0];
  }

  // Obtener estadísticas anuales
  static async obtenerEstadisticasAnuales(anio) {
    const pool = getDB();
    const query = `
      SELECT 
        EXTRACT(MONTH FROM fecha) as mes,
        TO_CHAR(fecha, 'Month') as nombre_mes,
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_mes,
        COALESCE(SUM(costos), 0) as costos_mes,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_mes,
        COALESCE(ROUND(AVG(porcentaje_ganancia), 2), 0) as porcentaje_promedio
      FROM ganancias
      WHERE EXTRACT(YEAR FROM fecha) = $1
      GROUP BY EXTRACT(MONTH FROM fecha), TO_CHAR(fecha, 'Month')
      ORDER BY mes
    `;
    
    const result = await pool.query(query, [anio]);
    return result.rows;
  }

  // Comparar períodos
  static async compararPeriodos(periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin) {
    const pool = getDB();
    const query = `
      SELECT 
        'Período 1' as periodo,
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_totales,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_total
      FROM ganancias
      WHERE fecha BETWEEN $1 AND $2
      UNION ALL
      SELECT 
        'Período 2' as periodo,
        COUNT(*) as total_registros,
        COALESCE(SUM(total_venta), 0) as ventas_totales,
        COALESCE(SUM(ganancia_neta), 0) as ganancia_total
      FROM ganancias
      WHERE fecha BETWEEN $3 AND $4
    `;
    
    const result = await pool.query(query, [periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin]);
    return result.rows;
  }

  // Contar registros
  static async contar(filtros = {}) {
    const pool = getDB();
    let query = `SELECT COUNT(*) as total FROM ganancias WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filtros.fecha_desde) {
      query += ` AND fecha >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND fecha <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

export default GananciasModel;
