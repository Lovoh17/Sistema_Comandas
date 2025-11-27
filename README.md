# Sistema de Comandas para Restaurante

Este documento describe el diseño de un sistema de comandas para un restaurante, con dos roles principales: usuario (cliente) y administrador.

## Rol Usuario (Cliente)

- **Acceso sin registro:** No requiere login ni creación de cuenta.
- **Información del cliente:** Se solicita únicamente el nombre y número de teléfono para identificar el pedido.
- **Realización de pedidos:** El usuario puede seleccionar productos de las siguientes categorías:
    - Entradas
    - Plato fuerte
    - Bebidas
- **Cálculo en tiempo real:** El sistema muestra el total acumulado del pedido a medida que se agregan o quitan productos.
- **Confirmación y envío:** Al confirmar el pedido, la comanda se envía automáticamente al panel del administrador para su preparación.

## Rol Administrador

- **Panel de control:** Acceso a un panel de control para la gestión de pedidos y la visualización de datos.
- **Gestión de pedidos:**
    - **Pedidos pendientes:** Visualización en tiempo real de los nuevos pedidos que llegan.
    - **Histórico de pedidos:** Consulta de todos los pedidos realizados anteriormente.
- **Apartado de Administración:**
    - **Ganancias totales:** Visualización de las ganancias acumuladas.
    - **Estadísticas de ventas:** Reportes básicos de ventas, por ejemplo, por categoría de producto, por día, etc.

## Requisitos Técnicos

- **Interfaz de usuario:** Diseño sencillo, intuitivo y claro para facilitar la experiencia del cliente.
- **Panel administrativo:** Funcional, con opciones de filtros y reportes básicos para una gestión eficiente.
- **Escalabilidad:** El sistema debe estar diseñado para poder añadir más categorías de productos o nuevas funcionalidades en el futuro sin dificultad.
