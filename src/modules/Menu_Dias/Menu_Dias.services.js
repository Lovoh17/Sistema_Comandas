import MenuDiasModel from '../models/Menu_Dias.model.js';

class MenuDiasService {
  
  // ============================================
  // UTILIDADES Y VALIDACIONES
  // ============================================

  /**
   * Validar coincidencia entre día de la semana y fecha
   * @param {string} dia_semana - Día de la semana en español
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {boolean} true si coinciden
   */
  validarDiaYFecha(dia_semana, fecha) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemanaFecha = diasSemana[fechaObj.getDay()];
    
    return dia_semana.toLowerCase() === diaSemanaFecha;
  }

  /**
   * Obtener día de la semana a partir de una fecha
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {string} Día de la semana en español
   */
  obtenerDiaSemana(fecha) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const fechaObj = new Date(fecha + 'T00:00:00');
    return diasSemana[fechaObj.getDay()];
  }

  /**
   * Validar formato de fecha
   * @param {string} fecha - Fecha a validar
   * @returns {boolean} true si el formato es válido
   */
  validarFormatoFecha(fecha) {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) return false;
    
    const fechaObj = new Date(fecha);
    return fechaObj instanceof Date && !isNaN(fechaObj);
  }

  /**
   * Calcular primer y último día de la semana
   * @param {Date} fecha - Fecha de referencia
   * @returns {object} { primerDia, ultimoDia }
   */
  calcularSemana(fecha = new Date()) {
    const diaSemana = fecha.getDay(); // 0 = domingo
    
    // Calcular lunes de la semana
    const primerDia = new Date(fecha);
    primerDia.setDate(fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
    
    // Calcular domingo de la semana
    const ultimoDia = new Date(primerDia);
    ultimoDia.setDate(primerDia.getDate() + 6);

    return {
      primerDia: primerDia.toISOString().split('T')[0],
      ultimoDia: ultimoDia.toISOString().split('T')[0]
    };
  }

  // ============================================
  // OPERACIONES DE MENÚS
  // ============================================

  /**
   * Crear menú con validaciones completas
   * @param {object} datos - Datos del menú
   * @returns {Promise<object>} Menú creado
   */
  async crearMenu(datos) {
    try {
      const { dia_semana, fecha, descripcion, activo, productos } = datos;
      
      // Validar campos requeridos
      if (!dia_semana || !fecha) {
        throw new Error('Los campos dia_semana y fecha son requeridos');
      }

      // Validar formato de fecha
      if (!this.validarFormatoFecha(fecha)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      // Validar coincidencia día/fecha
      if (!this.validarDiaYFecha(dia_semana, fecha)) {
        const diaReal = this.obtenerDiaSemana(fecha);
        throw new Error(`El día de la semana no coincide. La fecha ${fecha} es ${diaReal}`);
      }

      // Verificar si ya existe menú para esa fecha
      const menuExistente = await MenuDiasModel.existePorFecha(fecha);
      if (menuExistente) {
        throw new Error('Ya existe un menú para esta fecha');
      }

      // Crear el menú
      const nuevoMenu = await MenuDiasModel.crear({
        dia_semana: dia_semana.toLowerCase(),
        fecha,
        descripcion: descripcion || `Menú del ${dia_semana}`,
        activo: activo !== undefined ? activo : true
      });

      // Agregar productos si se proporcionaron
      if (productos && Array.isArray(productos) && productos.length > 0) {
        await MenuDiasModel.agregarProductos(nuevoMenu.id, productos);
      }

      return await MenuDiasModel.obtenerPorId(nuevoMenu.id);
    } catch (error) {
      throw new Error(`Error al crear menú: ${error.message}`);
    }
  }

  /**
   * Actualizar menú con validaciones
   * @param {number} id - ID del menú
   * @param {object} datos - Datos a actualizar
   * @returns {Promise<object>} Menú actualizado
   */
  async actualizarMenu(id, datos) {
    try {
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        throw new Error('Menú no encontrado');
      }

      const { dia_semana, fecha, descripcion, activo } = datos;

      // Validar formato de fecha si se proporciona
      if (fecha && !this.validarFormatoFecha(fecha)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      // Si se actualiza fecha y día, validar coincidencia
      if (fecha && dia_semana) {
        if (!this.validarDiaYFecha(dia_semana, fecha)) {
          const diaReal = this.obtenerDiaSemana(fecha);
          throw new Error(`El día de la semana no coincide. La fecha ${fecha} es ${diaReal}`);
        }
      }

      // Si solo se actualiza la fecha, calcular el día automáticamente
      let datosActualizados = { ...datos };
      if (fecha && !dia_semana) {
        datosActualizados.dia_semana = this.obtenerDiaSemana(fecha);
      }

      // Si se actualiza la fecha, verificar duplicados
      if (fecha) {
        const menuEnFecha = await MenuDiasModel.existePorFecha(fecha, id);
        if (menuEnFecha) {
          throw new Error('Ya existe otro menú para esta fecha');
        }
      }

      return await MenuDiasModel.actualizar(id, datosActualizados);
    } catch (error) {
      throw new Error(`Error al actualizar menú: ${error.message}`);
    }
  }

  /**
   * Clonar menú a otra fecha
   * @param {number} id - ID del menú original
   * @param {string} nueva_fecha - Fecha destino
   * @returns {Promise<object>} Menú clonado
   */
  async clonarMenu(id, nueva_fecha) {
    try {
      // Validar formato de fecha
      if (!this.validarFormatoFecha(nueva_fecha)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      const menuOriginal = await MenuDiasModel.obtenerPorId(id);
      
      if (!menuOriginal) {
        throw new Error('Menú original no encontrado');
      }

      // Verificar que no exista menú en la nueva fecha
      const menuExistente = await MenuDiasModel.existePorFecha(nueva_fecha);
      if (menuExistente) {
        throw new Error('Ya existe un menú para la fecha destino');
      }

      // Obtener día de la semana de la nueva fecha
      const nuevo_dia_semana = this.obtenerDiaSemana(nueva_fecha);

      // Crear nuevo menú
      const nuevoMenu = await MenuDiasModel.crear({
        dia_semana: nuevo_dia_semana,
        fecha: nueva_fecha,
        descripcion: menuOriginal.descripcion || `Menú del ${nuevo_dia_semana}`,
        activo: menuOriginal.activo
      });

      // Copiar productos si existen
      if (menuOriginal.productos && menuOriginal.productos.length > 0) {
        const productos = menuOriginal.productos.map(p => ({
          producto_id: p.producto_id,
          disponible_hoy: p.disponible_hoy !== undefined ? p.disponible_hoy : true
        }));
        
        await MenuDiasModel.agregarProductos(nuevoMenu.id, productos);
      }

      return await MenuDiasModel.obtenerPorId(nuevoMenu.id);
    } catch (error) {
      throw new Error(`Error al clonar menú: ${error.message}`);
    }
  }

  /**
   * Generar menús para una semana completa
   * @param {string} fecha_inicio - Fecha de inicio (lunes preferentemente)
   * @param {array} plantilla_productos - Productos para todos los días
   * @returns {Promise<object>} Resultado de la operación
   */
  async generarMenusSemana(fecha_inicio, plantilla_productos = []) {
    try {
      if (!this.validarFormatoFecha(fecha_inicio)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      const menusCreados = [];
      const errores = [];

      for (let i = 0; i < 7; i++) {
        const fecha = new Date(fecha_inicio + 'T00:00:00');
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const dia_semana = this.obtenerDiaSemana(fechaStr);

        try {
          // Verificar si ya existe
          const existe = await MenuDiasModel.existePorFecha(fechaStr);
          if (existe) {
            errores.push({ 
              fecha: fechaStr, 
              dia: dia_semana,
              error: 'Ya existe menú para esta fecha' 
            });
            continue;
          }

          const nuevoMenu = await MenuDiasModel.crear({
            dia_semana,
            fecha: fechaStr,
            descripcion: `Menú del ${dia_semana}`,
            activo: true
          });

          // Agregar productos si hay plantilla
          if (plantilla_productos && plantilla_productos.length > 0) {
            await MenuDiasModel.agregarProductos(nuevoMenu.id, plantilla_productos);
          }

          const menuCompleto = await MenuDiasModel.obtenerPorId(nuevoMenu.id);
          menusCreados.push(menuCompleto);
        } catch (error) {
          errores.push({ 
            fecha: fechaStr, 
            dia: dia_semana,
            error: error.message 
          });
        }
      }

      return {
        exito: menusCreados.length > 0,
        menus_creados: menusCreados,
        errores: errores,
        total_creados: menusCreados.length,
        total_errores: errores.length
      };
    } catch (error) {
      throw new Error(`Error al generar menús de la semana: ${error.message}`);
    }
  }

  /**
   * Activar o desactivar un menú
   * @param {number} id - ID del menú
   * @param {boolean} activo - Estado deseado
   * @returns {Promise<object>} Menú actualizado
   */
  async cambiarEstado(id, activo) {
    try {
      if (typeof activo !== 'boolean') {
        throw new Error('El parámetro activo debe ser un booleano');
      }

      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        throw new Error('Menú no encontrado');
      }

      return await MenuDiasModel.actualizar(id, { activo });
    } catch (error) {
      throw new Error(`Error al cambiar estado del menú: ${error.message}`);
    }
  }

  // ============================================
  // CONSULTAS ESPECIALES
  // ============================================

  /**
   * Obtener menú del día con validación
   * @returns {Promise<object>} Menú de hoy
   */
  async obtenerMenuHoy() {
    try {
      const menu = await MenuDiasModel.obtenerMenuHoy();
      
      if (!menu) {
        throw new Error('No hay menú disponible para hoy');
      }

      return menu;
    } catch (error) {
      throw new Error(`Error al obtener menú de hoy: ${error.message}`);
    }
  }

  /**
   * Obtener menús de la semana actual
   * @returns {Promise<array>} Menús de la semana
   */
  async obtenerMenusSemanaActual() {
    try {
      const { primerDia, ultimoDia } = this.calcularSemana();

      const menus = await MenuDiasModel.obtenerTodos({
        fecha_desde: primerDia,
        fecha_hasta: ultimoDia,
        activo: true
      });

      return {
        semana: {
          inicio: primerDia,
          fin: ultimoDia
        },
        total: menus.length,
        menus
      };
    } catch (error) {
      throw new Error(`Error al obtener menús de la semana: ${error.message}`);
    }
  }

  /**
   * Obtener menús del mes actual
   * @returns {Promise<object>} Menús del mes
   */
  async obtenerMenusMesActual() {
    try {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const fecha_desde = primerDiaMes.toISOString().split('T')[0];
      const fecha_hasta = ultimoDiaMes.toISOString().split('T')[0];

      const menus = await MenuDiasModel.obtenerTodos({
        fecha_desde,
        fecha_hasta
      });

      return {
        mes: hoy.toLocaleString('es', { month: 'long', year: 'numeric' }),
        periodo: { desde: fecha_desde, hasta: fecha_hasta },
        total: menus.length,
        menus
      };
    } catch (error) {
      throw new Error(`Error al obtener menús del mes: ${error.message}`);
    }
  }

  /**
   * Verificar disponibilidad de productos en el menú
   * @param {number} menu_id - ID del menú
   * @returns {Promise<object>} Estadísticas de disponibilidad
   */
  async verificarDisponibilidadProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        throw new Error('Menú no encontrado');
      }

      const productos = await MenuDiasModel.obtenerProductos(menu_id);
      
      const estadisticas = {
        total: productos.length,
        disponibles: productos.filter(p => p.disponible && p.disponible_hoy).length,
        no_disponibles_sistema: productos.filter(p => !p.disponible).length,
        no_disponibles_hoy: productos.filter(p => p.disponible && !p.disponible_hoy).length,
        productos_sin_stock: productos
          .filter(p => !p.disponible)
          .map(p => ({
            id: p.id,
            nombre: p.nombre,
            categoria: p.categoria_nombre
          })),
        productos_desactivados_hoy: productos
          .filter(p => p.disponible && !p.disponible_hoy)
          .map(p => ({
            id: p.id,
            nombre: p.nombre,
            categoria: p.categoria_nombre
          }))
      };

      return estadisticas;
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }

  /**
   * Obtener resumen completo de menús
   * @param {string} fecha_desde - Fecha inicial
   * @param {string} fecha_hasta - Fecha final
   * @returns {Promise<object>} Resumen completo
   */
  async obtenerResumen(fecha_desde, fecha_hasta) {
    try {
      if (!this.validarFormatoFecha(fecha_desde) || !this.validarFormatoFecha(fecha_hasta)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }

      const estadisticas = await MenuDiasModel.obtenerEstadisticas(fecha_desde, fecha_hasta);
      const productosMasUsados = await MenuDiasModel.obtenerProductosMasUsados(5);
      const menus = await MenuDiasModel.obtenerTodos({ fecha_desde, fecha_hasta });

      return {
        periodo: {
          desde: fecha_desde,
          hasta: fecha_hasta
        },
        estadisticas_generales: estadisticas,
        productos_populares: productosMasUsados,
        resumen_menus: {
          total: menus.length,
          activos: menus.filter(m => m.activo).length,
          inactivos: menus.filter(m => !m.activo).length,
          con_productos: menus.filter(m => m.cantidad_productos > 0).length,
          sin_productos: menus.filter(m => m.cantidad_productos === 0).length
        },
        promedio_productos_por_menu: menus.length > 0 
          ? (menus.reduce((sum, m) => sum + parseInt(m.cantidad_productos || 0), 0) / menus.length).toFixed(2)
          : 0
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }

  // ============================================
  // OPERACIONES CON PRODUCTOS
  // ============================================

  /**
   * Sincronizar productos entre menús
   * @param {number} menu_origen_id - ID del menú origen
   * @param {number} menu_destino_id - ID del menú destino
   * @param {boolean} reemplazar - Si true, elimina productos existentes primero
   * @returns {Promise<object>} Menú actualizado
   */
  async sincronizarProductos(menu_origen_id, menu_destino_id, reemplazar = false) {
    try {
      const menuOrigen = await MenuDiasModel.existe(menu_origen_id);
      const menuDestino = await MenuDiasModel.existe(menu_destino_id);

      if (!menuOrigen) {
        throw new Error('Menú de origen no encontrado');
      }

      if (!menuDestino) {
        throw new Error('Menú de destino no encontrado');
      }

      const productosOrigen = await MenuDiasModel.obtenerProductos(menu_origen_id);
      
      if (productosOrigen.length === 0) {
        throw new Error('El menú de origen no tiene productos');
      }

      const productos = productosOrigen.map(p => ({
        producto_id: p.id,
        disponible_hoy: p.disponible_hoy
      }));

      await MenuDiasModel.agregarProductos(menu_destino_id, productos);

      return await MenuDiasModel.obtenerPorId(menu_destino_id);
    } catch (error) {
      throw new Error(`Error al sincronizar productos: ${error.message}`);
    }
  }

  /**
   * Activar todos los productos de un menú
   * @param {number} menu_id - ID del menú
   * @returns {Promise<object>} Resultado
   */
  async activarTodosLosProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        throw new Error('Menú no encontrado');
      }

      const productos = await MenuDiasModel.obtenerProductos(menu_id);
      
      let actualizados = 0;
      const errores = [];

      for (const producto of productos) {
        try {
          if (!producto.disponible_hoy) {
            await MenuDiasModel.actualizarDisponibilidadProducto(menu_id, producto.id, true);
            actualizados++;
          }
        } catch (error) {
          errores.push({ producto_id: producto.id, error: error.message });
        }
      }

      return {
        total_productos: productos.length,
        actualizados,
        errores: errores.length,
        detalles_errores: errores
      };
    } catch (error) {
      throw new Error(`Error al activar productos: ${error.message}`);
    }
  }

  /**
   * Desactivar todos los productos de un menú
   * @param {number} menu_id - ID del menú
   * @returns {Promise<object>} Resultado
   */
  async desactivarTodosLosProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        throw new Error('Menú no encontrado');
      }

      const productos = await MenuDiasModel.obtenerProductos(menu_id);
      
      let actualizados = 0;
      const errores = [];

      for (const producto of productos) {
        try {
          if (producto.disponible_hoy) {
            await MenuDiasModel.actualizarDisponibilidadProducto(menu_id, producto.id, false);
            actualizados++;
          }
        } catch (error) {
          errores.push({ producto_id: producto.id, error: error.message });
        }
      }

      return {
        total_productos: productos.length,
        actualizados,
        errores: errores.length,
        detalles_errores: errores
      };
    } catch (error) {
      throw new Error(`Error al desactivar productos: ${error.message}`);
    }
  }

  // ============================================
  // MANTENIMIENTO Y LIMPIEZA
  // ============================================

  /**
   * Limpiar menús antiguos inactivos
   * @param {number} dias_antiguedad - Días de antigüedad (default 90)
   * @returns {Promise<object>} Resultado de la limpieza
   */
  async limpiarMenusAntiguos(dias_antiguedad = 90) {
    try {
      if (dias_antiguedad < 30) {
        throw new Error('Los días de antigüedad deben ser al menos 30');
      }

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias_antiguedad);
      const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];

      const menusAntiguos = await MenuDiasModel.obtenerTodos({
        fecha_hasta: fechaLimiteStr,
        activo: false
      });

      let eliminados = 0;
      const errores = [];

      for (const menu of menusAntiguos) {
        try {
          await MenuDiasModel.eliminar(menu.id);
          eliminados++;
        } catch (error) {
          errores.push({ 
            menu_id: menu.id, 
            fecha: menu.fecha,
            error: error.message 
          });
        }
      }

      return {
        fecha_limite: fechaLimiteStr,
        dias_antiguedad,
        total_encontrados: menusAntiguos.length,
        eliminados,
        errores: errores.length,
        detalles_errores: errores
      };
    } catch (error) {
      throw new Error(`Error al limpiar menús antiguos: ${error.message}`);
    }
  }

  /**
   * Validar integridad de menús (fechas, productos, etc)
   * @returns {Promise<object>} Reporte de validación
   */
  async validarIntegridad() {
    try {
      const menus = await MenuDiasModel.obtenerTodos({});
      
      const problemas = [];

      for (const menu of menus) {
        // Verificar coincidencia día/fecha
        if (!this.validarDiaYFecha(menu.dia_semana, menu.fecha)) {
          problemas.push({
            menu_id: menu.id,
            fecha: menu.fecha,
            tipo: 'inconsistencia_dia_fecha',
            mensaje: `El día ${menu.dia_semana} no coincide con la fecha ${menu.fecha}`
          });
        }

        // Verificar menús sin productos
        if (parseInt(menu.cantidad_productos) === 0) {
          problemas.push({
            menu_id: menu.id,
            fecha: menu.fecha,
            tipo: 'sin_productos',
            mensaje: 'El menú no tiene productos asignados'
          });
        }
      }

      return {
        total_menus: menus.length,
        con_problemas: problemas.length,
        sin_problemas: menus.length - problemas.length,
        problemas
      };
    } catch (error) {
      throw new Error(`Error al validar integridad: ${error.message}`);
    }
  }
}

export default new MenuDiasService();