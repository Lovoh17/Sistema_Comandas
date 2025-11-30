import GananciasModel from './Ganancias.model.js';

class GananciasService {
  // Crear registro de ganancia manual
  static async crear(datos) {
    try {
      // Validaciones
      if (!datos.pedido_id || datos.total_venta === undefined) {
        throw new Error('Pedido ID y total de venta son requeridos');
      }

      if (datos.total_venta < 0) {
        throw new Error('El total de venta no puede ser negativo');
      }

      // Calcular ganancia neta si no viene
      if (datos.ganancia_neta === undefined) {
        const costos = datos.costos || 0;
        datos.ganancia_neta = datos.total_venta - costos;
      }

      // Calcular porcentaje si no viene
      if (datos.porcentaje_ganancia === undefined) {
        if (datos.total_venta > 0) {
          datos.porcentaje_ganancia = ((datos.ganancia_neta / datos.total_venta) * 100).toFixed(2);
        } else {
          datos.porcentaje_ganancia = 0;
        }
      }

      // Establecer fecha actual si no viene
      if (!datos.fecha) {
        datos.fecha = new Date().toISOString().split('T')[0];
      }

      const nuevaGanancia = await GananciasModel.crear(datos);

      return {
        success: true,
        data: nuevaGanancia,
        message: 'Ganancia registrada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar ganancia desde pedido entregado
  static async registrarDesdePedido(pedido_id) {
    try {
      const ganancia = await GananciasModel.registrarDesdePedido(pedido_id);

      if (!ganancia) {
        throw new Error('No se pudo registrar la ganancia. Verifica que el pedido esté entregado.');
      }

      return {
        success: true,
        data: ganancia,
        message: 'Ganancia registrada automáticamente desde el pedido'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar ganancias
  static async listar(filtros = {}) {
    try {
      const ganancias = await GananciasModel.obtenerTodas(filtros);
      const total = await GananciasModel.contar(filtros);

      return {
        success: true,
        data: ganancias,
        total: total,
        filtros: filtros
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener ganancia por ID
  static async obtenerPorId(id) {
    try {
      const ganancia = await GananciasModel.obtenerPorId(id);

      if (!ganancia) {
        throw new Error('Ganancia no encontrada');
      }

      return {
        success: true,
        data: ganancia
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar ganancia
  static async actualizar(id, datos) {
    try {
      const existe = await GananciasModel.existe(id);
      if (!existe) {
        throw new Error('Ganancia no encontrada');
      }

      // Recalcular ganancia neta y porcentaje si cambian valores
      if (datos.total_venta !== undefined || datos.costos !== undefined) {
        const gananciaActual = await GananciasModel.obtenerPorId(id);
        const totalVenta = datos.total_venta !== undefined ? datos.total_venta : gananciaActual.total_venta;
        const costos = datos.costos !== undefined ? datos.costos : gananciaActual.costos;
        
        datos.ganancia_neta = totalVenta - costos;
        if (totalVenta > 0) {
          datos.porcentaje_ganancia = ((datos.ganancia_neta / totalVenta) * 100).toFixed(2);
        }
      }

      const gananciaActualizada = await GananciasModel.actualizar(id, datos);

      return {
        success: true,
        data: gananciaActualizada,
        message: 'Ganancia actualizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar costos
  static async actualizarCostos(id, costos) {
    try {
      if (costos < 0) {
        throw new Error('Los costos no pueden ser negativos');
      }

      const existe = await GananciasModel.existe(id);
      if (!existe) {
        throw new Error('Ganancia no encontrada');
      }

      const gananciaActualizada = await GananciasModel.actualizarCostos(id, costos);

      return {
        success: true,
        data: gananciaActualizada,
        message: 'Costos actualizados exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar ganancia
  static async eliminar(id) {
    try {
      const existe = await GananciasModel.existe(id);
      if (!existe) {
        throw new Error('Ganancia no encontrada');
      }

      await GananciasModel.eliminar(id);

      return {
        success: true,
        message: 'Ganancia eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener resumen del día
  static async obtenerResumenDia(fecha) {
    try {
      if (!fecha) {
        fecha = new Date().toISOString().split('T')[0];
      }

      const resumen = await GananciasModel.obtenerResumenDia(fecha);

      return {
        success: true,
        data: resumen,
        fecha: fecha
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener resumen por período
  static async obtenerResumenPeriodo(fecha_desde, fecha_hasta) {
    try {
      if (!fecha_desde || !fecha_hasta) {
        throw new Error('Fecha desde y fecha hasta son requeridas');
      }

      const resumen = await GananciasModel.obtenerResumenPeriodo(fecha_desde, fecha_hasta);
      const porDia = await GananciasModel.obtenerPorDia(fecha_desde, fecha_hasta);

      return {
        success: true,
        data: {
          resumen_general: resumen,
          por_dia: porDia
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas mensuales
  static async obtenerEstadisticasMensuales(anio, mes) {
    try {
      if (!anio || !mes) {
        throw new Error('Año y mes son requeridos');
      }

      const estadisticas = await GananciasModel.obtenerEstadisticasMensuales(anio, mes);

      return {
        success: true,
        data: estadisticas,
        periodo: { anio, mes }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas anuales
  static async obtenerEstadisticasAnuales(anio) {
    try {
      if (!anio) {
        anio = new Date().getFullYear();
      }

      const estadisticas = await GananciasModel.obtenerEstadisticasAnuales(anio);

      return {
        success: true,
        data: estadisticas,
        anio: anio
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener top días
  static async obtenerTopDias(limite = 10) {
    try {
      const topDias = await GananciasModel.obtenerTopDias(limite);

      return {
        success: true,
        data: topDias,
        total: topDias.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Comparar períodos
  static async compararPeriodos(periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin) {
    try {
      if (!periodo1_inicio || !periodo1_fin || !periodo2_inicio || !periodo2_fin) {
        throw new Error('Todas las fechas son requeridas para la comparación');
      }

      const comparacion = await GananciasModel.compararPeriodos(
        periodo1_inicio, 
        periodo1_fin, 
        periodo2_inicio, 
        periodo2_fin
      );

      // Calcular diferencias
      if (comparacion.length === 2) {
        const periodo1 = comparacion[0];
        const periodo2 = comparacion[1];

        const diferencias = {
          registros: periodo2.total_registros - periodo1.total_registros,
          ventas: (parseFloat(periodo2.ventas_totales) - parseFloat(periodo1.ventas_totales)).toFixed(2),
          ganancias: (parseFloat(periodo2.ganancia_total) - parseFloat(periodo1.ganancia_total)).toFixed(2),
          crecimiento_porcentaje: periodo1.ganancia_total > 0 
            ? (((parseFloat(periodo2.ganancia_total) - parseFloat(periodo1.ganancia_total)) / parseFloat(periodo1.ganancia_total)) * 100).toFixed(2)
            : 0
        };

        return {
          success: true,
          data: {
            periodo1: comparacion[0],
            periodo2: comparacion[1],
            diferencias: diferencias
          }
        };
      }

      return {
        success: true,
        data: comparacion
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default GananciasService;
