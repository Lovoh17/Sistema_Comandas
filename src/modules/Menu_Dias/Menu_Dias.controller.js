import MenuDiasModel from './Menu_Dias.model.js';

class MenuDiasController {
  // ============================================
  // MÉTODOS DE CONSULTA (GET)
  // ============================================

  // Obtener todos los menús con filtros
  async obtenerTodos(req, res) {
    try {
      const { activo, dia_semana, fecha, fecha_desde, fecha_hasta, limite, offset } = req.query;
      
      const filtros = {};
      
      if (activo !== undefined) {
        filtros.activo = activo === 'true';
      }
      
      if (dia_semana) filtros.dia_semana = dia_semana;
      if (fecha) filtros.fecha = fecha;
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (limite) filtros.limite = parseInt(limite);
      if (offset) filtros.offset = parseInt(offset);
      
      const menus = await MenuDiasModel.obtenerTodos(filtros);
      const total = await MenuDiasModel.contar(filtros);
      
      res.status(200).json({
        exito: true,
        total,
        cantidad: menus.length,
        datos: menus
      });
    } catch (error) {
      console.error('Error al obtener menús:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los menús del día',
        error: error.message
      });
    }
  }

  // Obtener menú por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const menu = await MenuDiasModel.obtenerPorId(id);
      
      if (!menu) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Menú del día no encontrado'
        });
      }
      
      res.status(200).json({
        exito: true,
        datos: menu
      });
    } catch (error) {
      console.error('Error al obtener menú:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener el menú del día',
        error: error.message
      });
    }
  }

  // Obtener menú de hoy
  async obtenerMenuHoy(req, res) {
    try {
      const menuHoy = await MenuDiasModel.obtenerMenuHoy();
      
      if (!menuHoy) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No hay menú disponible para hoy'
        });
      }
      
      res.status(200).json({
        exito: true,
        datos: menuHoy
      });
    } catch (error) {
      console.error('Error al obtener menú de hoy:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener el menú de hoy',
        error: error.message
      });
    }
  }

  // Obtener menú por fecha específica
  async obtenerPorFecha(req, res) {
    try {
      const { fecha } = req.params;
      
      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
      
      const menu = await MenuDiasModel.obtenerPorFecha(fecha);
      
      if (!menu) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No hay menú disponible para esta fecha'
        });
      }
      
      res.status(200).json({
        exito: true,
        datos: menu
      });
    } catch (error) {
      console.error('Error al obtener menú por fecha:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener el menú',
        error: error.message
      });
    }
  }

  // Obtener productos de un menú específico
  async obtenerProductos(req, res) {
    try {
      const { id } = req.params;
      
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Menú del día no encontrado'
        });
      }
      
      const productos = await MenuDiasModel.obtenerProductos(id);
      
      res.status(200).json({
        exito: true,
        cantidad: productos.length,
        datos: productos
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los productos del menú',
        error: error.message
      });
    }
  }

  // Obtener menús próximos
  async obtenerMenusProximos(req, res) {
    try {
      const { dias = 7 } = req.query;
      
      const diasNum = parseInt(dias);
      if (isNaN(diasNum) || diasNum < 1 || diasNum > 30) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El parámetro dias debe ser un número entre 1 y 30'
        });
      }
      
      const menus = await MenuDiasModel.obtenerMenusProximos(diasNum);
      
      res.status(200).json({
        exito: true,
        cantidad: menus.length,
        dias_consultados: diasNum,
        datos: menus
      });
    } catch (error) {
      console.error('Error al obtener menús próximos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los menús próximos',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de menús
  async obtenerEstadisticas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Los parámetros fecha_desde y fecha_hasta son requeridos'
        });
      }
      
      // Validar formato de fechas
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha_desde) || !fechaRegex.test(fecha_hasta)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
      
      const estadisticas = await MenuDiasModel.obtenerEstadisticas(fecha_desde, fecha_hasta);
      
      res.status(200).json({
        exito: true,
        periodo: {
          desde: fecha_desde,
          hasta: fecha_hasta
        },
        datos: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // Obtener productos más usados en menús
  async obtenerProductosMasUsados(req, res) {
    try {
      const { limite = 10 } = req.query;
      
      const limiteNum = parseInt(limite);
      if (isNaN(limiteNum) || limiteNum < 1 || limiteNum > 50) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El parámetro limite debe ser un número entre 1 y 50'
        });
      }
      
      const productos = await MenuDiasModel.obtenerProductosMasUsados(limiteNum);
      
      res.status(200).json({
        exito: true,
        cantidad: productos.length,
        datos: productos
      });
    } catch (error) {
      console.error('Error al obtener productos más usados:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los productos más usados',
        error: error.message
      });
    }
  }

  // ============================================
  // MÉTODOS DE CREACIÓN (POST)
  // ============================================

  // Crear un nuevo menú del día
  async crear(req, res) {
    try {
      const { dia_semana, fecha, descripcion, activo, productos } = req.body;
      
      // Validar campos requeridos
      if (!dia_semana || !fecha) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Los campos dia_semana y fecha son requeridos'
        });
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }

      // Validar día de la semana
      const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      if (!diasValidos.includes(dia_semana.toLowerCase())) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Día de la semana inválido. Use: lunes, martes, miercoles, jueves, viernes, sabado, domingo'
        });
      }

      // Validar que el día de la semana coincida con la fecha
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const fechaObj = new Date(fecha + 'T00:00:00');
      const diaSemanaFecha = diasSemana[fechaObj.getDay()];
      
      if (dia_semana.toLowerCase() !== diaSemanaFecha) {
        return res.status(400).json({
          exito: false,
          mensaje: `El día de la semana no coincide con la fecha. La fecha ${fecha} es ${diaSemanaFecha}`
        });
      }
      
      // Verificar si ya existe un menú para esa fecha
      const menuExistente = await MenuDiasModel.existePorFecha(fecha);
      if (menuExistente) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Ya existe un menú para esta fecha',
          menu_existente_id: menuExistente.id
        });
      }
      
      // Crear el menú
      const nuevoMenu = await MenuDiasModel.crear({
        dia_semana,
        fecha,
        descripcion,
        activo
      });
      
      // Si se proporcionaron productos, asociarlos
      if (productos && Array.isArray(productos) && productos.length > 0) {
        // Validar estructura de productos
        const productosValidos = productos.every(p => 
          p.producto_id && typeof p.producto_id === 'number'
        );
        
        if (!productosValidos) {
          // Si hay error, eliminar el menú creado
          await MenuDiasModel.eliminar(nuevoMenu.id);
          return res.status(400).json({
            exito: false,
            mensaje: 'Formato de productos inválido. Cada producto debe tener producto_id'
          });
        }
        
        await MenuDiasModel.agregarProductos(nuevoMenu.id, productos);
      }
      
      // Obtener el menú completo con productos
      const menuCompleto = await MenuDiasModel.obtenerPorId(nuevoMenu.id);
      
      res.status(201).json({
        exito: true,
        mensaje: 'Menú del día creado exitosamente',
        datos: menuCompleto
      });
    } catch (error) {
      console.error('Error al crear menú:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al crear el menú del día',
        error: error.message
      });
    }
  }

  // Agregar productos a un menú existente
  async agregarProductos(req, res) {
    try {
      const { id } = req.params;
      const { productos } = req.body;
      
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Debe proporcionar un array de productos válido'
        });
      }
      
      // Validar estructura de productos
      const productosValidos = productos.every(p => 
        p.producto_id && typeof p.producto_id === 'number'
      );
      
      if (!productosValidos) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Formato de productos inválido. Cada producto debe tener producto_id (número)'
        });
      }
      
      // Verificar que el menú existe
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Menú del día no encontrado'
        });
      }
      
      const productosAgregados = await MenuDiasModel.agregarProductos(id, productos);
      
      const menuActualizado = await MenuDiasModel.obtenerPorId(id);
      
      res.status(200).json({
        exito: true,
        mensaje: 'Productos agregados al menú del día',
        productos_agregados: productosAgregados.length,
        datos: menuActualizado
      });
    } catch (error) {
      console.error('Error al agregar productos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al agregar productos al menú',
        error: error.message
      });
    }
  }

  // ============================================
  // MÉTODOS DE ACTUALIZACIÓN (PUT/PATCH)
  // ============================================

  // Actualizar un menú del día
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { dia_semana, fecha, descripcion, activo } = req.body;
      
      // Verificar que el menú existe
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Menú del día no encontrado'
        });
      }

      // Validar día de la semana si se proporciona
      if (dia_semana) {
        const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        if (!diasValidos.includes(dia_semana.toLowerCase())) {
          return res.status(400).json({
            exito: false,
            mensaje: 'Día de la semana inválido'
          });
        }
      }

      // Validar formato de fecha si se proporciona
      if (fecha) {
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) {
          return res.status(400).json({
            exito: false,
            mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD'
          });
        }
      }

      // Si se actualiza fecha y día, validar coincidencia
      if (fecha && dia_semana) {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const fechaObj = new Date(fecha + 'T00:00:00');
        const diaSemanaFecha = diasSemana[fechaObj.getDay()];
        
        if (dia_semana.toLowerCase() !== diaSemanaFecha) {
          return res.status(400).json({
            exito: false,
            mensaje: `El día de la semana no coincide con la fecha`
          });
        }
      }

      // Si se actualiza la fecha, verificar que no exista otro menú en esa fecha
      if (fecha) {
        const menuEnFecha = await MenuDiasModel.existePorFecha(fecha, id);
        if (menuEnFecha) {
          return res.status(400).json({
            exito: false,
            mensaje: 'Ya existe otro menú para esta fecha',
            menu_existente_id: menuEnFecha.id
          });
        }
      }

      // Verificar que hay al menos un campo para actualizar
      if (!dia_semana && !fecha && descripcion === undefined && activo === undefined) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Debe proporcionar al menos un campo para actualizar'
        });
      }
      
      const menuActualizado = await MenuDiasModel.actualizar(id, {
        dia_semana,
        fecha,
        descripcion,
        activo
      });
      
      res.status(200).json({
        exito: true,
        mensaje: 'Menú del día actualizado exitosamente',
        datos: menuActualizado
      });
    } catch (error) {
      console.error('Error al actualizar menú:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al actualizar el menú del día',
        error: error.message
      });
    }
  }

  // Actualizar disponibilidad de un producto en el menú
  async actualizarDisponibilidadProducto(req, res) {
    try {
      const { id, producto_id } = req.params;
      const { disponible_hoy } = req.body;
      
      if (disponible_hoy === undefined) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El campo disponible_hoy es requerido'
        });
      }

      if (typeof disponible_hoy !== 'boolean') {
        return res.status(400).json({
          exito: false,
          mensaje: 'El campo disponible_hoy debe ser un booleano (true o false)'
        });
      }
      
      const resultado = await MenuDiasModel.actualizarDisponibilidadProducto(
        id,
        producto_id,
        disponible_hoy
      );
      
      if (!resultado) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado en este menú'
        });
      }
      
      res.status(200).json({
        exito: true,
        mensaje: 'Disponibilidad del producto actualizada',
        datos: resultado
      });
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al actualizar disponibilidad del producto',
        error: error.message
      });
    }
  }

  // ============================================
  // MÉTODOS DE ELIMINACIÓN (DELETE)
  // ============================================

  // Eliminar un producto del menú
  async eliminarProducto(req, res) {
    try {
      const { id, producto_id } = req.params;
      
      // Validar que los parámetros sean números
      if (isNaN(id) || isNaN(producto_id)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Los parámetros id y producto_id deben ser números válidos'
        });
      }
      
      const resultado = await MenuDiasModel.eliminarProducto(id, producto_id);
      
      if (!resultado) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado en este menú'
        });
      }
      
      res.status(200).json({
        exito: true,
        mensaje: 'Producto eliminado del menú del día'
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al eliminar producto del menú',
        error: error.message
      });
    }
  }

  // Eliminar un menú del día completo
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      // Validar que el id sea un número
      if (isNaN(id)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El id debe ser un número válido'
        });
      }
      
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Menú del día no encontrado'
        });
      }
      
      await MenuDiasModel.eliminar(id);
      
      res.status(200).json({
        exito: true,
        mensaje: 'Menú del día eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar menú:', error);
      
      // Verificar si el error es por restricción de clave foránea
      if (error.message.includes('foreign key') || error.code === '23503') {
        return res.status(409).json({
          exito: false,
          mensaje: 'No se puede eliminar el menú porque tiene relaciones activas'
        });
      }
      
      res.status(500).json({
        exito: false,
        mensaje: 'Error al eliminar el menú del día',
        error: error.message
      });
    }
  }
}

export default new MenuDiasController();