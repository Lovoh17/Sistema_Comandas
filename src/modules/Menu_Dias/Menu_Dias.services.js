import MenuDiasModel from '../models/Menu_Dias.model.js';

class MenuDiasService {
  // ============================================
  // UTILIDADES Y VALIDACIONES
  // ============================================

  static validarDiaYFecha(dia_semana, fecha) {
    try {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const fechaObj = new Date(fecha + 'T00:00:00');
      const diaSemanaFecha = diasSemana[fechaObj.getDay()];
      
      return dia_semana.toLowerCase() === diaSemanaFecha;
    } catch (error) {
      return false;
    }
  }

  static obtenerDiaSemana(fecha) {
    try {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const fechaObj = new Date(fecha + 'T00:00:00');
      return diasSemana[fechaObj.getDay()];
    } catch (error) {
      throw new Error('Error al obtener día de la semana: ' + error.message);
    }
  }

  static validarFormatoFecha(fecha) {
    try {
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) return false;
      
      const fechaObj = new Date(fecha);
      return fechaObj instanceof Date && !isNaN(fechaObj);
    } catch (error) {
      return false;
    }
  }

  static calcularSemana(fecha = new Date()) {
    try {
      const diaSemana = fecha.getDay(); // 0 = domingo
      
      const primerDia = new Date(fecha);
      primerDia.setDate(fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
      
      const ultimoDia = new Date(primerDia);
      ultimoDia.setDate(primerDia.getDate() + 6);

      return {
        primerDia: primerDia.toISOString().split('T')[0],
        ultimoDia: ultimoDia.toISOString().split('T')[0]
      };
    } catch (error) {
      throw new Error('Error al calcular semana: ' + error.message);
    }
  }

  // ============================================
  // OPERACIONES DE MENÚS
  // ============================================

  static async crearMenu(datos) {
    try {
      const { dia_semana, fecha, descripcion, activo, productos } = datos;
      
      if (!dia_semana || !fecha) {
        return {
          success: false,
          error: 'Los campos dia_semana y fecha son requeridos'
        };
      }

      if (!this.validarFormatoFecha(fecha)) {
        return {
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        };
      }

      if (!this.validarDiaYFecha(dia_semana, fecha)) {
        const diaReal = this.obtenerDiaSemana(fecha);
        return {
          success: false,
          error: `El día de la semana no coincide. La fecha ${fecha} es ${diaReal}`
        };
      }

      const menuExistente = await MenuDiasModel.existePorFecha(fecha);
      if (menuExistente) {
        return {
          success: false,
          error: 'Ya existe un menú para esta fecha'
        };
      }

      const nuevoMenu = await MenuDiasModel.crear({
        dia_semana: dia_semana.toLowerCase(),
        fecha,
        descripcion: descripcion || `Menú del ${dia_semana}`,
        activo: activo !== undefined ? activo : true
      });

      if (productos && Array.isArray(productos) && productos.length > 0) {
        await MenuDiasModel.agregarProductos(nuevoMenu.id, productos);
      }

      const menuCompleto = await MenuDiasModel.obtenerPorId(nuevoMenu.id);
      
      return {
        success: true,
        data: menuCompleto,
        message: 'Menú creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async actualizarMenu(id, datos) {
    try {
      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return {
          success: false,
          error: 'Menú no encontrado'
        };
      }

      const { dia_semana, fecha, descripcion, activo } = datos;

      if (fecha && !this.validarFormatoFecha(fecha)) {
        return {
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        };
      }

      if (fecha && dia_semana) {
        if (!this.validarDiaYFecha(dia_semana, fecha)) {
          const diaReal = this.obtenerDiaSemana(fecha);
          return {
            success: false,
            error: `El día de la semana no coincide. La fecha ${fecha} es ${diaReal}`
          };
        }
      }

      let datosActualizados = { ...datos };
      if (fecha && !dia_semana) {
        datosActualizados.dia_semana = this.obtenerDiaSemana(fecha);
      }

      if (fecha) {
        const menuEnFecha = await MenuDiasModel.existePorFecha(fecha, id);
        if (menuEnFecha) {
          return {
            success: false,
            error: 'Ya existe otro menú para esta fecha'
          };
        }
      }

      const menuActualizado = await MenuDiasModel.actualizar(id, datosActualizados);
      
      return {
        success: true,
        data: menuActualizado,
        message: 'Menú actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async clonarMenu(id, nueva_fecha) {
    try {
      if (!this.validarFormatoFecha(nueva_fecha)) {
        return {
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        };
      }

      const menuOriginal = await MenuDiasModel.obtenerPorId(id);
      
      if (!menuOriginal) {
        return {
          success: false,
          error: 'Menú original no encontrado'
        };
      }

      const menuExistente = await MenuDiasModel.existePorFecha(nueva_fecha);
      if (menuExistente) {
        return {
          success: false,
          error: 'Ya existe un menú para la fecha destino'
        };
      }

      const nuevo_dia_semana = this.obtenerDiaSemana(nueva_fecha);

      const nuevoMenu = await MenuDiasModel.crear({
        dia_semana: nuevo_dia_semana,
        fecha: nueva_fecha,
        descripcion: menuOriginal.descripcion || `Menú del ${nuevo_dia_semana}`,
        activo: menuOriginal.activo
      });

      if (menuOriginal.productos && menuOriginal.productos.length > 0) {
        const productos = menuOriginal.productos.map(p => ({
          producto_id: p.producto_id,
          disponible_hoy: p.disponible_hoy !== undefined ? p.disponible_hoy : true
        }));
        
        await MenuDiasModel.agregarProductos(nuevoMenu.id, productos);
      }

      const menuCompleto = await MenuDiasModel.obtenerPorId(nuevoMenu.id);
      
      return {
        success: true,
        data: menuCompleto,
        message: 'Menú clonado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async generarMenusSemana(fecha_inicio, plantilla_productos = []) {
    try {
      if (!this.validarFormatoFecha(fecha_inicio)) {
        return {
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        };
      }

      const menusCreados = [];
      const errores = [];

      for (let i = 0; i < 7; i++) {
        const fecha = new Date(fecha_inicio + 'T00:00:00');
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const dia_semana = this.obtenerDiaSemana(fechaStr);

        try {
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
        success: true,
        data: {
          menus_creados: menusCreados,
          errores: errores,
          total_creados: menusCreados.length,
          total_errores: errores.length
        },
        message: `Se crearon ${menusCreados.length} menús correctamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async cambiarEstado(id, activo) {
    try {
      if (typeof activo !== 'boolean') {
        return {
          success: false,
          error: 'El parámetro activo debe ser un booleano'
        };
      }

      const menuExiste = await MenuDiasModel.existe(id);
      if (!menuExiste) {
        return {
          success: false,
          error: 'Menú no encontrado'
        };
      }

      const menuActualizado = await MenuDiasModel.actualizar(id, { activo });
      
      return {
        success: true,
        data: menuActualizado,
        message: `Menú ${activo ? 'activado' : 'desactivado'} exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // CONSULTAS ESPECIALES
  // ============================================

  static async obtenerMenuHoy() {
    try {
      const menu = await MenuDiasModel.obtenerMenuHoy();
      
      if (!menu) {
        return {
          success: false,
          error: 'No hay menú disponible para hoy'
        };
      }

      return {
        success: true,
        data: menu,
        message: 'Menú de hoy obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async obtenerMenusSemanaActual() {
    try {
      const { primerDia, ultimoDia } = this.calcularSemana();

      const menus = await MenuDiasModel.obtenerTodos({
        fecha_desde: primerDia,
        fecha_hasta: ultimoDia,
        activo: true
      });

      return {
        success: true,
        data: {
          semana: {
            inicio: primerDia,
            fin: ultimoDia
          },
          total: menus.length,
          menus
        },
        message: 'Menús de la semana obtenidos exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async obtenerMenusMesActual() {
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
        success: true,
        data: {
          mes: hoy.toLocaleString('es', { month: 'long', year: 'numeric' }),
          periodo: { desde: fecha_desde, hasta: fecha_hasta },
          total: menus.length,
          menus
        },
        message: 'Menús del mes obtenidos exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async verificarDisponibilidadProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        return {
          success: false,
          error: 'Menú no encontrado'
        };
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

      return {
        success: true,
        data: estadisticas,
        message: 'Disponibilidad verificada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async obtenerResumen(fecha_desde, fecha_hasta) {
    try {
      if (!this.validarFormatoFecha(fecha_desde) || !this.validarFormatoFecha(fecha_hasta)) {
        return {
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        };
      }

      const estadisticas = await MenuDiasModel.obtenerEstadisticas(fecha_desde, fecha_hasta);
      const productosMasUsados = await MenuDiasModel.obtenerProductosMasUsados(5);
      const menus = await MenuDiasModel.obtenerTodos({ fecha_desde, fecha_hasta });

      const resumen = {
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

      return {
        success: true,
        data: resumen,
        message: 'Resumen obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // OPERACIONES CON PRODUCTOS
  // ============================================

  static async sincronizarProductos(menu_origen_id, menu_destino_id, reemplazar = false) {
    try {
      const menuOrigen = await MenuDiasModel.existe(menu_origen_id);
      const menuDestino = await MenuDiasModel.existe(menu_destino_id);

      if (!menuOrigen) {
        return {
          success: false,
          error: 'Menú de origen no encontrado'
        };
      }

      if (!menuDestino) {
        return {
          success: false,
          error: 'Menú de destino no encontrado'
        };
      }

      const productosOrigen = await MenuDiasModel.obtenerProductos(menu_origen_id);
      
      if (productosOrigen.length === 0) {
        return {
          success: false,
          error: 'El menú de origen no tiene productos'
        };
      }

      const productos = productosOrigen.map(p => ({
        producto_id: p.id,
        disponible_hoy: p.disponible_hoy
      }));

      await MenuDiasModel.agregarProductos(menu_destino_id, productos);

      const menuActualizado = await MenuDiasModel.obtenerPorId(menu_destino_id);
      
      return {
        success: true,
        data: menuActualizado,
        message: 'Productos sincronizados exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async activarTodosLosProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        return {
          success: false,
          error: 'Menú no encontrado'
        };
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
        success: true,
        data: {
          total_productos: productos.length,
          actualizados,
          errores: errores.length,
          detalles_errores: errores
        },
        message: `${actualizados} productos activados exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async desactivarTodosLosProductos(menu_id) {
    try {
      const menuExiste = await MenuDiasModel.existe(menu_id);
      if (!menuExiste) {
        return {
          success: false,
          error: 'Menú no encontrado'
        };
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
        success: true,
        data: {
          total_productos: productos.length,
          actualizados,
          errores: errores.length,
          detalles_errores: errores
        },
        message: `${actualizados} productos desactivados exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // MANTENIMIENTO Y LIMPIEZA
  // ============================================

  static async limpiarMenusAntiguos(dias_antiguedad = 90) {
    try {
      if (dias_antiguedad < 30) {
        return {
          success: false,
          error: 'Los días de antigüedad deben ser al menos 30'
        };
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
        success: true,
        data: {
          fecha_limite: fechaLimiteStr,
          dias_antiguedad,
          total_encontrados: menusAntiguos.length,
          eliminados,
          errores: errores.length,
          detalles_errores: errores
        },
        message: `${eliminados} menús antiguos eliminados`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async validarIntegridad() {
    try {
      const menus = await MenuDiasModel.obtenerTodos({});
      
      const problemas = [];

      for (const menu of menus) {
        if (!this.validarDiaYFecha(menu.dia_semana, menu.fecha)) {
          problemas.push({
            menu_id: menu.id,
            fecha: menu.fecha,
            tipo: 'inconsistencia_dia_fecha',
            mensaje: `El día ${menu.dia_semana} no coincide con la fecha ${menu.fecha}`
          });
        }

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
        success: true,
        data: {
          total_menus: menus.length,
          con_problemas: problemas.length,
          sin_problemas: menus.length - problemas.length,
          problemas
        },
        message: 'Validación completada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default MenuDiasService;