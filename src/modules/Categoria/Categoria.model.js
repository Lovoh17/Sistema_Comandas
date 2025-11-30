import { getDB } from '../../config/database.js';

class CategoriaModel {
  // Crear nueva categoría
  static async crear(datos) {
    const pool = getDB();
    const { nombre, descripcion } = datos;
    
    const query = `
      INSERT INTO categorias (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING id, nombre, descripcion, activo, created_at
    `;
    
    const values = [nombre.trim(), descripcion?.trim() || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todas las categorías
  static async obtenerTodas(soloActivas = false) {
    const pool = getDB();
    let query = `
      SELECT id, nombre, descripcion, activo, created_at
      FROM categorias
    `;
    
    if (soloActivas) {
      query += ' WHERE activo = true';
    }
    
    query += ' ORDER BY nombre ASC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener categoría por ID
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT id, nombre, descripcion, activo, created_at
      FROM categorias
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener categoría por nombre
  static async obtenerPorNombre(nombre) {
    const pool = getDB();
    const query = `
      SELECT id, nombre, descripcion, activo, created_at
      FROM categorias
      WHERE nombre = $1
    `;
    
    const result = await pool.query(query, [nombre.trim()]);
    return result.rows[0];
  }

  // Actualizar categoría
  static async actualizar(id, datos) {
    const pool = getDB();
    const { nombre, descripcion, activo } = datos;
    
    const query = `
      UPDATE categorias
      SET nombre = $1, descripcion = $2, activo = $3
      WHERE id = $4
      RETURNING id, nombre, descripcion, activo, created_at
    `;
    
    const values = [
      nombre?.trim() || null,
      descripcion?.trim() || null,
      activo,
      id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar categoría (lógico - desactivar)
  static async eliminar(id) {
    const pool = getDB();
    const query = `
      UPDATE categorias
      SET activo = false
      WHERE id = $1
      RETURNING id, nombre
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Reactivar categoría
  static async reactivar(id) {
    const pool = getDB();
    const query = `
      UPDATE categorias
      SET activo = true
      WHERE id = $1
      RETURNING id, nombre, activo
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe categoría
  static async existe(id) {
    const pool = getDB();
    const query = 'SELECT id, nombre FROM categorias WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si nombre ya existe (excluyendo un ID específico)
  static async nombreExiste(nombre, excluirId = null) {
    const pool = getDB();
    let query = 'SELECT id, nombre FROM categorias WHERE nombre = $1';
    const values = [nombre.trim()];
    
    if (excluirId) {
      query += ' AND id != $2';
      values.push(excluirId);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener estadísticas de categorías
  static async obtenerEstadisticas() {
    const pool = getDB();
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.activo,
        COUNT(p.id) as total_productos,
        COUNT(CASE WHEN p.disponible = true THEN 1 END) as productos_activos,
        COALESCE(SUM(pp.cantidad), 0) as veces_pedida,
        COALESCE(SUM(pp.subtotal), 0) as ventas_totales
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id
      LEFT JOIN pedidos_productos pp ON p.id = pp.producto_id
      GROUP BY c.id, c.nombre, c.activo
      ORDER BY ventas_totales DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener categorías con productos
  static async obtenerConProductos(soloActivas = true) {
    const pool = getDB();
    const query = `
      SELECT 
        c.id,
        c.nombre as categoria_nombre,
        c.descripcion as categoria_descripcion,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio', p.precio,
            'disponible', p.disponible,
            'imagen_url', p.imagen_url
          ) ORDER BY p.nombre
        ) as productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.disponible = true
      WHERE c.activo = $1
      GROUP BY c.id, c.nombre, c.descripcion
      ORDER BY c.nombre
    `;
    
    const result = await pool.query(query, [soloActivas]);
    return result.rows;
  }

  // Contar categorías activas
  static async contar(soloActivas = false) {
    const pool = getDB();
    let query = 'SELECT COUNT(*) as total FROM categorias';
    
    if (soloActivas) {
      query += ' WHERE activo = true';
    }
    
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
}

export default CategoriaModel;