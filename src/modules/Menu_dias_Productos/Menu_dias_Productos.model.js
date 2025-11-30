import { getDB } from '../../config/database.js';

class MenuDiasProductosModel {
  // Agregar producto al menú del día
  static async agregar(datos) {
    const pool = getDB();
    const { menu_dia_id, producto_id, disponible_hoy = true } = datos;
    
    const query = `
      INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy)
      VALUES ($1, $2, $3)
      ON CONFLICT (menu_dia_id, producto_id) 
      DO UPDATE SET disponible_hoy = EXCLUDED.disponible_hoy
      RETURNING id, menu_dia_id, producto_id, disponible_hoy, created_at
    `;
    
    const values = [menu_dia_id, producto_id, disponible_hoy];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Agregar múltiples productos al menú del día
  static async agregarMultiples(menu_dia_id, productos) {
    const pool = getDB();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const productosAgregados = [];
      
      for (const producto_id of productos) {
        const query = `
          INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy)
          VALUES ($1, $2, true)
          ON CONFLICT (menu_dia_id, producto_id) 
          DO UPDATE SET disponible_hoy = true
          RETURNING id, menu_dia_id, producto_id, disponible_hoy, created_at
        `;
        
        const result = await client.query(query, [menu_dia_id, producto_id]);
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

  // Obtener productos de un menú del día
  static async obtenerPorMenuDia(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        mdp.id,
        mdp.menu_dia_id,
        mdp.producto_id,
        p.nombre as producto_nombre,
        p.descripcion as producto_descripcion,
        p.precio as producto_precio,
        p.imagen_url as producto_imagen,
        c.nombre as categoria_nombre,
        c.id as categoria_id,
        mdp.disponible_hoy,
        mdp.created_at
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE mdp.menu_dia_id = $1
      ORDER BY c.nombre, p.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows;
  }

  // Obtener productos disponibles del menú del día
  static async obtenerDisponibles(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        mdp.id,
        mdp.producto_id,
        p.nombre as producto_nombre,
        p.descripcion as producto_descripcion,
        p.precio as producto_precio,
        p.imagen_url as producto_imagen,
        c.nombre as categoria_nombre
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE mdp.menu_dia_id = $1 
        AND mdp.disponible_hoy = true
        AND p.disponible = true
      ORDER BY c.nombre, p.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows;
  }

  // Obtener productos por categoría de un menú del día
  static async obtenerPorCategoria(menu_dia_id, categoria_id) {
    const pool = getDB();
    const query = `
      SELECT 
        mdp.id,
        mdp.producto_id,
        p.nombre as producto_nombre,
        p.descripcion as producto_descripcion,
        p.precio as producto_precio,
        p.imagen_url as producto_imagen,
        mdp.disponible_hoy
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      WHERE mdp.menu_dia_id = $1 
        AND p.categoria_id = $2
        AND mdp.disponible_hoy = true
      ORDER BY p.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id, categoria_id]);
    return result.rows;
  }

  // Cambiar disponibilidad de un producto en el menú
  static async cambiarDisponibilidad(id, disponible_hoy) {
    const pool = getDB();
    const query = `
      UPDATE menu_dias_productos
      SET disponible_hoy = $1
      WHERE id = $2
      RETURNING id, menu_dia_id, producto_id, disponible_hoy
    `;
    
    const result = await pool.query(query, [disponible_hoy, id]);
    return result.rows[0];
  }

  // Eliminar producto del menú del día
  static async eliminar(id) {
    const pool = getDB();
    const query = `
      DELETE FROM menu_dias_productos 
      WHERE id = $1 
      RETURNING id, menu_dia_id, producto_id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar todos los productos de un menú del día
  static async eliminarPorMenuDia(menu_dia_id) {
    const pool = getDB();
    const query = `DELETE FROM menu_dias_productos WHERE menu_dia_id = $1`;
    const result = await pool.query(query, [menu_dia_id]);
    return result.rowCount;
  }

  // Verificar si un producto existe en el menú
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id, menu_dia_id, producto_id FROM menu_dias_productos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si un producto ya está en el menú del día
  static async productoEnMenu(menu_dia_id, producto_id) {
    const pool = getDB();
    const query = `
      SELECT id, disponible_hoy 
      FROM menu_dias_productos 
      WHERE menu_dia_id = $1 AND producto_id = $2
    `;
    
    const result = await pool.query(query, [menu_dia_id, producto_id]);
    return result.rows[0];
  }

  // Obtener estadísticas del menú del día
  static async obtenerEstadisticas(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(*) FILTER (WHERE mdp.disponible_hoy = true) as productos_disponibles,
        COUNT(*) FILTER (WHERE mdp.disponible_hoy = false) as productos_no_disponibles,
        COALESCE(ROUND(AVG(p.precio), 2), 0) as precio_promedio
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      WHERE mdp.menu_dia_id = $1
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows[0];
  }

  // Obtener resumen por categoría
  static async obtenerResumenPorCategoria(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        COUNT(mdp.id) as total_productos,
        COUNT(mdp.id) FILTER (WHERE mdp.disponible_hoy = true) as productos_disponibles,
        COALESCE(ROUND(AVG(p.precio), 2), 0) as precio_promedio
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE mdp.menu_dia_id = $1
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows;
  }

  // Copiar menú de un día a otro
  static async copiarMenu(menu_dia_origen_id, menu_dia_destino_id) {
    const pool = getDB();
    const query = `
      INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy)
      SELECT $2, producto_id, disponible_hoy
      FROM menu_dias_productos
      WHERE menu_dia_id = $1
      ON CONFLICT (menu_dia_id, producto_id) DO NOTHING
      RETURNING id
    `;
    
    const result = await pool.query(query, [menu_dia_origen_id, menu_dia_destino_id]);
    return result.rowCount;
  }

  // Activar todos los productos del menú
  static async activarTodos(menu_dia_id) {
    const pool = getDB();
    const query = `
      UPDATE menu_dias_productos
      SET disponible_hoy = true
      WHERE menu_dia_id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rowCount;
  }

  // Desactivar todos los productos del menú
  static async desactivarTodos(menu_dia_id) {
    const pool = getDB();
    const query = `
      UPDATE menu_dias_productos
      SET disponible_hoy = false
      WHERE menu_dia_id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rowCount;
  }
}

export default MenuDiasProductosModel;