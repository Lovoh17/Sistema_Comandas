import express from 'express';

// Este módulo maneja la relación entre menu_dias y productos
// Nota: La mayoría de operaciones ya están en Menu_Dias.routes.js
// Este archivo es opcional si ya manejas todo desde Menu_Dias

const Menu_Dias_ProductosRoutes = (db) => {
  const router = express.Router();

  /**
   * @route   GET /api/menu-dias-productos
   * @desc    Obtener todas las relaciones menu-producto
   * @query   menu_dia_id, producto_id, disponible_hoy
   * @access  Public
   */
  router.get('/api/menu-dias-productos', async (req, res) => {
    try {
      const { menu_dia_id, producto_id, disponible_hoy } = req.query;
      
      let query = `
        SELECT 
          mdp.id,
          mdp.menu_dia_id,
          mdp.producto_id,
          mdp.disponible_hoy,
          mdp.created_at,
          md.fecha,
          md.dia_semana,
          p.nombre as producto_nombre,
          p.precio
        FROM menu_dias_productos mdp
        INNER JOIN menu_dias md ON mdp.menu_dia_id = md.id
        INNER JOIN productos p ON mdp.producto_id = p.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;

      if (menu_dia_id) {
        query += ` AND mdp.menu_dia_id = $${paramCount}`;
        values.push(menu_dia_id);
        paramCount++;
      }

      if (producto_id) {
        query += ` AND mdp.producto_id = $${paramCount}`;
        values.push(producto_id);
        paramCount++;
      }

      if (disponible_hoy !== undefined) {
        query += ` AND mdp.disponible_hoy = $${paramCount}`;
        values.push(disponible_hoy === 'true');
        paramCount++;
      }

      query += ` ORDER BY md.fecha DESC, p.nombre ASC`;

      const result = await db.query(query, values);

      res.status(200).json({
        exito: true,
        cantidad: result.rows.length,
        datos: result.rows
      });
    } catch (error) {
      console.error('Error al obtener relaciones:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener las relaciones menú-producto',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/menu-dias-productos/:id
   * @desc    Obtener una relación específica por ID
   * @access  Public
   */
  router.get('/api/menu-dias-productos/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          mdp.id,
          mdp.menu_dia_id,
          mdp.producto_id,
          mdp.disponible_hoy,
          mdp.created_at,
          md.fecha,
          md.dia_semana,
          md.descripcion as menu_descripcion,
          p.nombre as producto_nombre,
          p.descripcion as producto_descripcion,
          p.precio,
          c.nombre as categoria_nombre
        FROM menu_dias_productos mdp
        INNER JOIN menu_dias md ON mdp.menu_dia_id = md.id
        INNER JOIN productos p ON mdp.producto_id = p.id
        INNER JOIN categorias c ON p.categoria_id = c.id
        WHERE mdp.id = $1
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Relación no encontrada'
        });
      }

      res.status(200).json({
        exito: true,
        datos: result.rows[0]
      });
    } catch (error) {
      console.error('Error al obtener relación:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener la relación',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/menu-dias-productos/stats/resumen
   * @desc    Obtener estadísticas de las relaciones
   * @access  Public
   */
  router.get('/api/menu-dias-productos/stats/resumen', async (req, res) => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_relaciones,
          COUNT(DISTINCT menu_dia_id) as menus_con_productos,
          COUNT(DISTINCT producto_id) as productos_utilizados,
          COUNT(CASE WHEN disponible_hoy = true THEN 1 END) as productos_disponibles,
          COUNT(CASE WHEN disponible_hoy = false THEN 1 END) as productos_no_disponibles
        FROM menu_dias_productos
      `;

      const result = await db.query(query);

      res.status(200).json({
        exito: true,
        datos: result.rows[0]
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  });

  return router;
};

export default Menu_Dias_ProductosRoutes;