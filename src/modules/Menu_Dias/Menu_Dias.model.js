import { getDB } from '../../config/database.js';

class MenuDiasModel {
  // Crear un nuevo menú del día
  static async crear(datos) {
    const pool = getDB();
    const { dia_semana, fecha, descripcion, activo = true } = datos;
    
    const query = `
      INSERT INTO menu_dias (dia_semana, fecha, descripcion, activo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, dia_semana, fecha, descripcion, activo, created_at
    `;
    
    const values = [dia_semana.toLowerCase(), fecha, descripcion, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todos los menús con filtros
  static async obtenerTodos(filtros = {}) {
    const pool = getDB();
    let query = `
      SELECT 
        md.id,
        md.dia_semana,
        md.fecha,
        md.descripcion,
        md.activo,
        md.created_at,
        COUNT(mdp.id) as cantidad_productos
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por activo
    if (filtros.activo !== undefined) {
      query += ` AND md.activo = $${paramCount}`;
      values.push(filtros.activo);
      paramCount++;
    }

    // Filtro por día de la semana
    if (filtros.dia_semana) {
      query += ` AND md.dia_semana = $${paramCount}`;
      values.push(filtros.dia_semana.toLowerCase());
      paramCount++;
    }

    // Filtro por fecha específica
    if (filtros.fecha) {
      query += ` AND md.fecha = $${paramCount}`;
      values.push(filtros.fecha);
      paramCount++;
    }

    // Filtro por rango de fechas
    if (filtros.fecha_desde) {
      query += ` AND md.fecha >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND md.fecha <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
      paramCount++;
    }

    query += ` GROUP BY md.id, md.dia_semana, md.fecha, md.descripcion, md.activo, md.created_at`;
    query += ` ORDER BY md.fecha DESC`;

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

  // Obtener menú por ID con sus productos
  static async obtenerPorId(id) {
    const pool = getDB();
    const query = `
      SELECT 
        md.id,
        md.dia_semana,
        md.fecha,
        md.descripcion,
        md.activo,
        md.created_at,
        json_agg(
          json_build_object(
            'producto_id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio', p.precio,
            'categoria_id', p.categoria_id,
            'categoria_nombre', c.nombre,
            'disponible', p.disponible,
            'disponible_hoy', mdp.disponible_hoy,
            'imagen_url', p.imagen_url
          ) ORDER BY c.id, p.nombre
        ) FILTER (WHERE p.id IS NOT NULL) as productos
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      LEFT JOIN productos p ON mdp.producto_id = p.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE md.id = $1
      GROUP BY md.id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener menú por fecha
  static async obtenerPorFecha(fecha) {
    const pool = getDB();
    const query = `
      SELECT 
        md.id,
        md.dia_semana,
        md.fecha,
        md.descripcion,
        md.activo,
        md.created_at,
        json_agg(
          json_build_object(
            'producto_id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio', p.precio,
            'categoria_id', p.categoria_id,
            'categoria_nombre', c.nombre,
            'disponible', p.disponible,
            'disponible_hoy', mdp.disponible_hoy,
            'imagen_url', p.imagen_url
          ) ORDER BY c.id, p.nombre
        ) FILTER (WHERE p.id IS NOT NULL) as productos
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      LEFT JOIN productos p ON mdp.producto_id = p.id AND p.disponible = true
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE md.fecha = $1 AND md.activo = true
      GROUP BY md.id
    `;
    
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  }

  // Obtener menú de hoy
  static async obtenerMenuHoy() {
    const pool = getDB();
    const query = `
      SELECT 
        md.id,
        md.dia_semana,
        md.fecha,
        md.descripcion,
        md.activo,
        md.created_at,
        json_agg(
          json_build_object(
            'producto_id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio', p.precio,
            'categoria_id', p.categoria_id,
            'categoria_nombre', c.nombre,
            'disponible', p.disponible,
            'disponible_hoy', mdp.disponible_hoy,
            'imagen_url', p.imagen_url
          ) ORDER BY c.id, p.nombre
        ) FILTER (WHERE p.id IS NOT NULL AND mdp.disponible_hoy = true) as productos
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      LEFT JOIN productos p ON mdp.producto_id = p.id AND p.disponible = true
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE md.fecha = CURRENT_DATE AND md.activo = true
      GROUP BY md.id
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Actualizar un menú del día
  static async actualizar(id, datos) {
    const pool = getDB();
    const { dia_semana, fecha, descripcion, activo } = datos;
    
    const campos = [];
    const values = [];
    let paramCount = 1;

    if (dia_semana !== undefined) {
      campos.push(`dia_semana = $${paramCount}`);
      values.push(dia_semana.toLowerCase());
      paramCount++;
    }

    if (fecha !== undefined) {
      campos.push(`fecha = $${paramCount}`);
      values.push(fecha);
      paramCount++;
    }

    if (descripcion !== undefined) {
      campos.push(`descripcion = $${paramCount}`);
      values.push(descripcion);
      paramCount++;
    }

    if (activo !== undefined) {
      campos.push(`activo = $${paramCount}`);
      values.push(activo);
      paramCount++;
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE menu_dias 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, dia_semana, fecha, descripcion, activo, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar un menú del día
  static async eliminar(id) {
    const pool = getDB();
    const query = `DELETE FROM menu_dias WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe un menú
  static async existe(id) {
    const pool = getDB();
    const query = `SELECT id FROM menu_dias WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si ya existe menú para una fecha
  static async existePorFecha(fecha, excludeId = null) {
    const pool = getDB();
    let query = `SELECT id FROM menu_dias WHERE fecha = $1`;
    const values = [fecha];
    
    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Agregar productos al menú
  static async agregarProductos(menu_dia_id, productos) {
    const pool = getDB();
    
    if (!Array.isArray(productos) || productos.length === 0) {
      throw new Error('Debe proporcionar un array de productos');
    }

    const values = [];
    const placeholders = [];
    let paramCount = 1;

    productos.forEach((producto) => {
      const disponible_hoy = producto.disponible_hoy !== undefined ? producto.disponible_hoy : true;
      placeholders.push(`($${paramCount}, $${paramCount + 1}, $${paramCount + 2})`);
      values.push(menu_dia_id, producto.producto_id, disponible_hoy);
      paramCount += 3;
    });

    const query = `
      INSERT INTO menu_dias_productos (menu_dia_id, producto_id, disponible_hoy)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (menu_dia_id, producto_id) DO NOTHING
      RETURNING id, menu_dia_id, producto_id, disponible_hoy, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Eliminar un producto del menú
  static async eliminarProducto(menu_dia_id, producto_id) {
    const pool = getDB();
    const query = `
      DELETE FROM menu_dias_productos 
      WHERE menu_dia_id = $1 AND producto_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [menu_dia_id, producto_id]);
    return result.rows[0];
  }

  // Actualizar disponibilidad de un producto en el menú
  static async actualizarDisponibilidadProducto(menu_dia_id, producto_id, disponible_hoy) {
    const pool = getDB();
    const query = `
      UPDATE menu_dias_productos 
      SET disponible_hoy = $1
      WHERE menu_dia_id = $2 AND producto_id = $3
      RETURNING id, menu_dia_id, producto_id, disponible_hoy
    `;
    
    const result = await pool.query(query, [disponible_hoy, menu_dia_id, producto_id]);
    return result.rows[0];
  }

  // Obtener productos del menú
  static async obtenerProductos(menu_dia_id) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.disponible,
        p.imagen_url,
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        mdp.disponible_hoy,
        mdp.created_at as agregado_al_menu
      FROM menu_dias_productos mdp
      INNER JOIN productos p ON mdp.producto_id = p.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE mdp.menu_dia_id = $1
      ORDER BY c.id, p.nombre
    `;
    
    const result = await pool.query(query, [menu_dia_id]);
    return result.rows;
  }

  // Contar menús
  static async contar(filtros = {}) {
    const pool = getDB();
    let query = `SELECT COUNT(*) as total FROM menu_dias WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filtros.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      values.push(filtros.activo);
      paramCount++;
    }

    if (filtros.dia_semana) {
      query += ` AND dia_semana = $${paramCount}`;
      values.push(filtros.dia_semana.toLowerCase());
      paramCount++;
    }

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

  // Obtener estadísticas de menús
  static async obtenerEstadisticas(fecha_desde, fecha_hasta) {
    const pool = getDB();
    const query = `
      SELECT 
        COUNT(DISTINCT md.id) as total_menus,
        COUNT(DISTINCT CASE WHEN md.activo = true THEN md.id END) as menus_activos,
        COUNT(DISTINCT mdp.producto_id) as productos_diferentes,
        COUNT(mdp.id) as total_asignaciones,
        ROUND(AVG(productos_por_menu.cantidad), 2) as promedio_productos_por_menu
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      LEFT JOIN (
        SELECT menu_dia_id, COUNT(*) as cantidad
        FROM menu_dias_productos
        GROUP BY menu_dia_id
      ) productos_por_menu ON md.id = productos_por_menu.menu_dia_id
      WHERE md.fecha BETWEEN $1 AND $2
    `;
    
    const result = await pool.query(query, [fecha_desde, fecha_hasta]);
    return result.rows[0];
  }

  // Obtener productos más usados en menús
  static async obtenerProductosMasUsados(limite = 10) {
    const pool = getDB();
    const query = `
      SELECT 
        p.id,
        p.nombre,
        c.nombre as categoria,
        COUNT(mdp.id) as veces_en_menu,
        COUNT(CASE WHEN mdp.disponible_hoy = true THEN 1 END) as veces_disponible
      FROM productos p
      INNER JOIN menu_dias_productos mdp ON p.id = mdp.producto_id
      INNER JOIN categorias c ON p.categoria_id = c.id
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY veces_en_menu DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limite]);
    return result.rows;
  }

  // Obtener menús próximos
  static async obtenerMenusProximos(dias = 7) {
    const pool = getDB();
    const query = `
      SELECT 
        md.id,
        md.dia_semana,
        md.fecha,
        md.descripcion,
        md.activo,
        COUNT(mdp.id) as cantidad_productos
      FROM menu_dias md
      LEFT JOIN menu_dias_productos mdp ON md.id = mdp.menu_dia_id
      WHERE md.fecha >= CURRENT_DATE 
        AND md.fecha <= CURRENT_DATE + $1 * INTERVAL '1 day'
        AND md.activo = true
      GROUP BY md.id
      ORDER BY md.fecha ASC
    `;
    
    const result = await pool.query(query, [dias]);
    return result.rows;
  }
}

export default MenuDiasModel;