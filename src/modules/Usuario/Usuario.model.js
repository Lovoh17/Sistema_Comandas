import { getDB } from '../../config/database.js';

class UsuarioModel {
  static async crear(datos) {
    try {
      const pool = getDB(); // Obtener pool aquí
      const { nombre, email, telefono, password, rol = 'cliente' } = datos;
      
      if (!nombre || !email || !password) {
        throw new Error('Nombre, email y password son requeridos');
      }

      const query = `
        INSERT INTO usuarios (nombre, email, telefono, password, rol)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre, email, telefono, rol, activo, created_at
      `;
      
      const values = [nombre, email, telefono, password, rol];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  static async obtenerTodos(filtros = {}) {
    try {
      const pool = getDB(); // Obtener pool aquí
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
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  static async obtenerPorId(id) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

      const query = `
        SELECT id, nombre, email, telefono, rol, activo, created_at, updated_at
        FROM usuarios
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener usuario por ID: ${error.message}`);
    }
  }

  static async obtenerPorEmail(email) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!email) {
        throw new Error('Email es requerido');
      }

      const query = `
        SELECT id, nombre, email, telefono, password, rol, activo, created_at
        FROM usuarios
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  static async actualizar(id, datos) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

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
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  static async cambiarEstado(id, activo) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id || typeof activo !== 'boolean') {
        throw new Error('ID y estado (booleano) son requeridos');
      }

      const query = `
        UPDATE usuarios
        SET activo = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, activo, updated_at
      `;
      
      const result = await pool.query(query, [activo, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al cambiar estado de usuario: ${error.message}`);
    }
  }

  static async cambiarRol(id, rol) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id || !rol) {
        throw new Error('ID y rol son requeridos');
      }

      const query = `
        UPDATE usuarios
        SET rol = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, rol, updated_at
      `;
      
      const result = await pool.query(query, [rol, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al cambiar rol de usuario: ${error.message}`);
    }
  }

  static async cambiarPassword(id, nuevaPassword) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id || !nuevaPassword) {
        throw new Error('ID y nueva contraseña son requeridos');
      }

      const query = `
        UPDATE usuarios
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, updated_at
      `;
      
      const result = await pool.query(query, [nuevaPassword, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  static async eliminar(id) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

      const query = `
        UPDATE usuarios
        SET activo = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  static async eliminarPermanente(id) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

      const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar usuario permanentemente: ${error.message}`);
    }
  }

  static async emailExiste(email, excludeId = null) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!email) {
        throw new Error('Email es requerido');
      }

      let query = `SELECT id FROM usuarios WHERE email = $1`;
      const values = [email];
      
      if (excludeId) {
        query += ` AND id != $2`;
        values.push(excludeId);
      }
      
      const result = await pool.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar email: ${error.message}`);
    }
  }

  static async obtenerEstadisticas() {
    try {
      const pool = getDB(); // Obtener pool aquí
      const query = `
        SELECT 
          COUNT(*) as total_usuarios,
          COUNT(*) FILTER (WHERE rol = 'cliente') as total_clientes,
          COUNT(*) FILTER (WHERE rol = 'administrador') as total_administradores,
          COUNT(*) FILTER (WHERE rol = 'empleado') as total_empleados,
          COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
          COUNT(*) FILTER (WHERE activo = false) as usuarios_inactivos,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as registros_hoy,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as registros_ultima_semana
        FROM usuarios
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  static async obtenerReporteRegistros(fecha_desde, fecha_hasta) {
    try {
      const pool = getDB(); // Obtener pool aquí
      if (!fecha_desde || !fecha_hasta) {
        throw new Error('fecha_desde y fecha_hasta son requeridos');
      }

      const query = `
        SELECT 
          DATE(created_at) as fecha,
          COUNT(*) as total_registros,
          COUNT(*) FILTER (WHERE rol = 'cliente') as clientes,
          COUNT(*) FILTER (WHERE rol = 'administrador') as administradores,
          COUNT(*) FILTER (WHERE rol = 'empleado') as empleados
        FROM usuarios
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY fecha DESC
      `;
      
      const result = await pool.query(query, [fecha_desde, fecha_hasta]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener reporte de registros: ${error.message}`);
    }
  }

  static async contar(filtros = {}) {
    try {
      const pool = getDB(); // Obtener pool aquí
      let query = `SELECT COUNT(*) FROM usuarios WHERE 1=1`;
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
      }

      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error al contar usuarios: ${error.message}`);
    }
  }
}

export default UsuarioModel;