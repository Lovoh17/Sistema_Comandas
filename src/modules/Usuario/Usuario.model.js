import  pool from '../../config/database.js';

class UsuarioModel {
  static async crear(datos) {
    const { nombre, email, telefono, password, rol = 'cliente' } = datos;
    
    const query = `
      INSERT INTO usuarios (nombre, email, telefono, password, rol)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, telefono, rol, activo, created_at
    `;
    
    const values = [nombre, email, telefono, password, rol];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async obtenerTodos(filtros = {}) {
    let query = `
      SELECT id, nombre, email, telefono, rol, activo, created_at, updated_at
      FROM usuarios
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    if (filtros.rol) {
      query += ` AND rol = $${paramCount}`;
      values.push(filtros.rol);
      paramCount++;
    }

    if (filtros.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      values.push(filtros.activo);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT id, nombre, email, telefono, rol, activo, created_at, updated_at
      FROM usuarios
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener usuario por email (para login)
  static async obtenerPorEmail(email) {
    const query = `
      SELECT id, nombre, email, telefono, password, rol, activo, created_at
      FROM usuarios
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Actualizar usuario
  static async actualizar(id, datos) {
    const { nombre, email, telefono, rol, activo } = datos;
    
    const query = `
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          telefono = COALESCE($3, telefono),
          rol = COALESCE($4, rol),
          activo = COALESCE($5, activo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, nombre, email, telefono, rol, activo, updated_at
    `;
    
    const values = [nombre, email, telefono, rol, activo, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar usuario (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE usuarios
      SET activo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si email existe
  static async emailExiste(email, excludeId = null) {
    let query = `SELECT id FROM usuarios WHERE email = $1`;
    const values = [email];
    
    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  // Obtener estadísticas de usuarios
  static async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(*) FILTER (WHERE rol = 'cliente') as total_clientes,
        COUNT(*) FILTER (WHERE rol = 'administrador') as total_administradores,
        COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
        COUNT(*) FILTER (WHERE activo = false) as usuarios_inactivos
      FROM usuarios
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default UsuarioModel;