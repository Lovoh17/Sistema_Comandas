import { getDB } from '../../config/database.js';

class ProductoModel {
  // Crear un nuevo producto
  static async crear(datos) {
    const pool = getDB();
    const { categoria_id, nombre, descripcion, precio, disponible = true, imagen_url } = datos;
    
    const query = `
      INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, imagen_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, categoria_id, nombre, descripcion, precio, disponible, imagen_url, created_at
    `;
    
    const values = [categoria_id, nombre, descripcion, precio, disponible, imagen_url];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todos los productos con filtros
  static async obtenerTodos(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        p.id,
        p.categoria_id,
        c.nombre as categoria_nombre,
        p.nombre,
        p.descripcion,
        p.precio,
        p.disponible,
        p.imagen_url,
        p.created_at,
        p.updated_at
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por categoría
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = $${paramCount}`;
      values.push(filtros.categoria_id);
      paramCount++;
    }

    // Filtro por disponibilidad
    if (filtros.disponible !== undefined) {
      query += ` AND p.disponible = $${paramCount}`;
      values.push(filtros.disponible);
      paramCount++;
    }

    // Filtro por búsqueda de nombre
    if (filtros.busqueda) {
      query += ` AND p.nombre ILIKE $${paramCount}`;
      values.push(`%${filtros.busqueda}%`);
      paramCount++;
    }

    // Filtro por rango de precio
    if (filtros.precio_min) {
      query += ` AND p.precio >= $${paramCount}`;
      values.push(filtros.precio_min);
      paramCount++;
    }

    if (filtros.precio_max) {
      query += ` AND p.precio <= $${paramCount}`;
      values.push(filtros.precio_max);
      paramCount++;
    }

    query += ` ORDER BY p.nombre ASC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Obtener productos por categoría
  static async obtenerPorCategoria(categoria_id) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.categoria_id,
        c.nombre as categoria_nombre,
        p.nombre,
        p.descripcion,
        p.precio,
        p.disponible,
        p.imagen_url,
        p.created_at
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.categoria_id = $1 AND p.disponible = true
      ORDER BY p.nombre ASC
    `;
    
    const result = await pool.query(query, [categoria_id]);
    return result.rows;
  }

  // Obtener producto por ID
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.categoria_id,
        c.nombre as categoria_nombre,
        p.nombre,
        p.descripcion,
        p.precio,
        p.disponible,
        p.imagen_url,
        p.created_at,
        p.updated_at
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar producto
  static async actualizar(id, datos) {
    const pool = getDB();
    const { categoria_id, nombre, descripcion, precio, disponible, imagen_url } = datos;
    
    const query = `
      UPDATE productos
      SET categoria_id = COALESCE($1, categoria_id),
          nombre = COALESCE($2, nombre),
          descripcion = COALESCE($3, descripcion),
          precio = COALESCE($4, precio),
          disponible = COALESCE($5, disponible),
          imagen_url = COALESCE($6, imagen_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, categoria_id, nombre, descripcion, precio, disponible, imagen_url, updated_at
    `;
    
    const values = [categoria_id, nombre, descripcion, precio, disponible, imagen_url, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Cambiar disponibilidad
  static async cambiarDisponibilidad(id, disponible) {
    const pool = getDB();
    const query = `
      UPDATE productos
      SET disponible = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nombre, disponible
    `;
    
    const result = await pool.query(query, [disponible, id]);
    return result.rows[0];
  }

  // Eliminar producto
  static async eliminar(id) {
    const pool = getDB();
    const query = `DELETE FROM productos WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener productos más vendidos
  static async obtenerMasVendidos(limite = 10) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.imagen_url,
        c.nombre as categoria_nombre,
        COUNT(pp.id) as veces_pedido,
        SUM(pp.cantidad) as cantidad_total,
        SUM(pp.subtotal) as ventas_totales
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN pedidos_productos pp ON p.id = pp.producto_id
      LEFT JOIN pedidos ped ON pp.pedido_id = ped.id
      WHERE ped.estado != 'cancelado' OR ped.estado IS NULL
      GROUP BY p.id, p.nombre, p.precio, p.imagen_url, c.nombre
      ORDER BY cantidad_total DESC NULLS LAST
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limite]);
    return result.rows;
  }

  // Obtener productos disponibles para menú del día
  static async obtenerDisponiblesParaMenu(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        c.nombre as categoria_nombre,
        CASE 
          WHEN mdp.id IS NOT NULL THEN true 
          ELSE false 
        END as en_menu
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN menu_dias_productos mdp ON p.id = mdp.producto_id AND mdp.menu_dia_id = $1
      WHERE p.disponible = true
      ORDER BY c.nombre, p.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows;
  }

  // Verificar si producto existe
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id FROM productos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  // Obtener estadísticas de productos
  static async obtenerEstadisticas() {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(*) FILTER (WHERE disponible = true) as productos_disponibles,
        COUNT(*) FILTER (WHERE disponible = false) as productos_no_disponibles,
        ROUND(AVG(precio), 2) as precio_promedio,
        MIN(precio) as precio_minimo,
        MAX(precio) as precio_maximo,
        (SELECT COUNT(*) FROM categorias) as total_categorias
      FROM productos
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Obtener productos por categoría con conteo
  static async obtenerPorCategoriaConConteo() {
    const pool = getDB();
    const query = `
      SELECT 
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        COUNT(p.id) as total_productos,
        COUNT(p.id) FILTER (WHERE p.disponible = true) as productos_disponibles
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export default ProductoModel;