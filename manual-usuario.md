# Manual de usuario — SISGAL

**Sistema de control de personal, asistencia y nómina**

Este manual explica, paso a paso y sin tecnicismos, cómo usar SISGAL. Está pensado para cualquier persona que administre el restaurante, sin necesidad de experiencia previa con sistemas o computadores.

> **Nota:** a lo largo del manual verás cuadros como este con consejos o advertencias importantes.

---

## Índice

1. [¿Qué es SISGAL?](#1-qué-es-sisgal)
2. [Cómo ingresar al sistema](#2-cómo-ingresar-al-sistema)
3. [Conociendo la pantalla principal](#3-conociendo-la-pantalla-principal)
4. [Panel principal (Dashboard)](#4-panel-principal-dashboard)
5. [Empleados (Personal)](#5-empleados-personal)
6. [Asistencia](#6-asistencia)
7. [Nómina (Liquidaciones)](#7-nómina-liquidaciones)
8. [Préstamos](#8-préstamos)
9. [Incapacidades](#9-incapacidades)
10. [Configuración](#10-configuración)
11. [Preguntas frecuentes](#11-preguntas-frecuentes)
12. [Glosario de términos](#12-glosario-de-términos)

---

## 1. ¿Qué es SISGAL?

SISGAL es el sistema donde el restaurante gestiona todo lo relacionado con su personal:

```
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │   EMPLEADOS   │   │   ASISTENCIA  │   │     NÓMINA     │
   │  Quiénes      │   │  Quién llegó  │   │  Cuánto se le  │
   │  trabajan     │   │  y a qué hora │   │  paga a cada   │
   │  aquí         │   │               │   │  uno           │
   └───────────────┘   └───────────────┘   └───────────────┘
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │  PRÉSTAMOS    │   │ INCAPACIDADES │   │ CONFIGURACIÓN  │
   │  Dinero       │   │  Días de      │   │  Reglas del    │
   │  prestado a   │   │  incapacidad  │   │  negocio       │
   │  empleados    │   │  o licencia   │   │  (sucursales,  │
   │               │   │               │   │  cargos, etc.) │
   └───────────────┘   └───────────────┘   └───────────────┘
```

Todo el sistema se usa **desde el navegador de internet** (Chrome, Edge, etc.), no hay que instalar nada.

---

## 2. Cómo ingresar al sistema

1. Abre el sistema en tu navegador. Verás una tarjeta centrada con el título **"Iniciar sesión"**.
2. Escribe tu **correo electrónico** en el primer campo.
3. Escribe tu **contraseña** en el segundo campo (debe tener al menos 8 caracteres).
4. Haz clic en el botón **Ingresar**.

```
 ┌─────────────────────────────┐
 │       Iniciar sesión         │
 │                               │
 │  Correo electrónico          │
 │  [ correo@ejemplo.com     ]  │
 │                               │
 │  Contraseña                  │
 │  [ ••••••••••••           ]  │
 │                               │
 │        [   Ingresar   ]      │
 └─────────────────────────────┘
```

> **Advertencia:** si dejas algún campo vacío, el sistema te avisará con un mensaje: *"Completa todos los campos."*
> Si escribes mal tu correo o contraseña, verás: *"Credenciales incorrectas."*
> Si intentas varias veces seguidas sin éxito, el sistema te pedirá esperar un momento antes de volver a intentarlo.

Una vez ingreses correctamente, verás un mensaje de bienvenida y pasarás directo al **Panel principal**.

Para salir del sistema en cualquier momento, usa el botón **Cerrar sesión** que está arriba, a la derecha, junto a tu nombre.

---

## 3. Conociendo la pantalla principal

Al ingresar verás dos partes principales: un **menú lateral** (a la izquierda) con todos los módulos, y el **contenido** (a la derecha) que cambia según el módulo que elijas.

```
 ┌───────────────┬──────────────────────────────────────┐
 │   SISGAL       │           (tu nombre) ▾  [Cerrar sesión]│
 ├───────────────┼──────────────────────────────────────┤
 │ Dashboard      │                                       │
 │ Asistencia     │                                       │
 │ Nómina         │         Aquí aparece el               │
 │ Incapacidades  │        contenido del módulo          │
 │ Personal       │         que hayas seleccionado         │
 │ Préstamos      │                                       │
 │ Reportes       │                                       │
 │ Configuración  │                                       │
 └───────────────┴──────────────────────────────────────┘
```

Para moverte entre módulos, simplemente haz clic en su nombre en el menú de la izquierda. El módulo donde estés en ese momento queda resaltado.

> **Nota:** el sistema recuerda cuál fue el último módulo que visitaste y lo muestra al final del menú, para que puedas volver rápido.

En pantallas pequeñas (como un celular), el menú se oculta y aparece un botón con tres líneas horizontales para abrirlo.

---

## 4. Panel principal (Dashboard)

Es la primera pantalla que ves al ingresar. Te da un vistazo general del negocio sin tener que entrar a cada módulo.

### Tarjetas de resumen

```
 ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
 │ Empleados  │ │  Nómina    │ │ Préstamos  │ │Incapacidades│
 │    24      │ │ 3 pendiente│ │     5      │ │     2      │
 │[Ver todos] │ │ [Generar]  │ │[Ver prést.]│ │[Registrar] │
 └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Cada tarjeta tiene un botón de acción que te lleva directo al módulo correspondiente.

### Indicadores clave

Más abajo encontrarás un selector de período (fechas **Desde** / **Hasta**) y el botón **Consultar**. Por defecto, el sistema muestra la información **desde el primer día del mes actual hasta hoy**. Si quieres ver otro rango de fechas, cámbialas y haz clic en **Consultar**.

Verás tres indicadores:

| Indicador | Qué significa |
|---|---|
| **Asistencia Promedio** | Porcentaje de empleados que marcaron asistencia en el período |
| **Horas Trabajadas** | Total de horas trabajadas en el período |
| **Costos Laborales** | Dinero total pagado en nómina en el período |

Cada uno muestra además una flechita verde (↑) o roja (↓) comparando con el período anterior. Si el sistema no tiene suficiente información para calcular algo, en vez de mostrar "0" verás el texto **"Sin datos"** — eso significa que falta información, no que el valor real sea cero.

Debajo verás tres gráficos: asistencia por día de la semana, distribución de costos (cuánto es sueldo vs. descuentos) y la tendencia de horas trabajadas mes a mes.

---

## 5. Empleados (Personal)

En el menú lateral se llama **"Personal"**. Aquí administras la información de todos los empleados del restaurante.

### Ver la lista de empleados

Al entrar verás una tabla con todos los empleados y, arriba, filtros para buscar:

- **Empleado**: busca por nombre o número de documento.
- **Sucursal**: filtra por sede.
- **Cargo**: filtra por puesto de trabajo.
- **Estado**: Todos / Activo / Inactivo.

Usa el botón **Limpiar filtros** para quitar todos los filtros de una vez.

La tabla muestra: nombre, documento, teléfono, salario, sucursal, cargo, horario y estado (una etiqueta verde "Activo" o gris "Inactivo"). En **Horario** aparece la jornada laboral vigente del restaurante, con su franja diurna y su franja nocturna; es la misma para todos los empleados y cambia sola cuando se registra una jornada nueva en Parámetros de nómina. Si no hay una jornada vigente, verás un guion (—). Al final de cada fila hay dos íconos:

- **(ícono de ojo)** → ver el detalle del empleado.
- **(ícono de apagar)** → desactivar al empleado (solo aparece si está activo).

### Registrar un nuevo empleado

1. Haz clic en el botón **"Registrar empleado"** (arriba a la derecha).
2. Completa el formulario, dividido en dos partes:

**Datos personales:**
- Nombres *(obligatorio)*
- Apellidos *(obligatorio)*
- Tipo de documento *(obligatorio)* — elige entre Cédula de ciudadanía, Cédula de extranjería, Pasaporte o Permiso Especial de Permanencia.
- Número de documento *(obligatorio, solo números)*
- Teléfono *(obligatorio, solo números)*

**Datos laborales:**
- Cargo *(obligatorio)*
- Sucursal *(obligatorio)*
- Salario base *(obligatorio, mayor a cero)*
- Fecha de ingreso *(obligatorio, no puede ser una fecha futura)*
- Horario laboral — se muestra automáticamente según la jornada configurada para todo el restaurante (ver sección [Configuración](#10-configuración)); no se edita aquí.

3. Haz clic en **"Registrar empleado"**.

> **Advertencia:** Todos los campos marcados como obligatorios deben llenarse. Si falta alguno o tiene un formato inválido, el sistema te lo señala en rojo debajo del campo.

### Ver o editar el detalle de un empleado

1. Haz clic en el ícono de ojo de la fila del empleado.
2. Se abre una ventana con el título **"Detalle del empleado"**, mostrando toda su información, pero sin poder editarla todavía.
3. Si necesitas cambiar algo, haz clic en el botón **"Actualizar"**. La ventana cambia a modo edición (título **"Editar empleado"**) y ahora sí puedes modificar los campos.
4. Haz clic en **"Guardar cambios"** para confirmar.

### Desactivar un empleado

1. Haz clic en el ícono de apagado de la fila del empleado.
2. Aparece una ventana de confirmación: **"¿Deseas desactivar este empleado?"**
3. Haz clic en **"Desactivar"** para confirmar, o en **"Cancelar"** para no hacer nada.

> **Advertencia:** Si el empleado tiene registros de asistencia, nómina o incapacidades asociados, el sistema no permitirá desactivarlo y te lo explicará con un mensaje. Esto es intencional: protege la información histórica del negocio.

---

## 6. Asistencia

Este módulo tiene tres pestañas en la parte superior: **"Asistencia hoy"**, **"Historial"** y **"Lector de huella"**.

```
 ┌────────────────┬─────────────┬──────────────────┐
 │ Asistencia hoy │  Historial  │ Lector de huella │
 └────────────────┴─────────────┴──────────────────┘
   Quién llegó      Marcaciones    Donde los empleados
   hoy              de días        registran su entrada
                    anteriores     y su salida
```

### Pestaña "Asistencia hoy"

Muestra en tiempo real quién ha marcado entrada hoy. Se actualiza sola cada cierto tiempo, pero también puedes forzar la actualización con el botón **"Actualizar"**.

Verás tres tarjetas: **Empleados presentes**, **Empleados ausentes** y **Empleados activos**.

Por defecto, la tabla solo muestra a los empleados presentes. Si quieres ver también a los que no han marcado, activa la casilla **"Mostrar también los empleados ausentes"**.

### Pestaña "Historial"

Aquí consultas marcaciones de días anteriores. Usa los filtros:

- **Empleado**
- **Estado**: Todos / Completo / Incompleto
- **Fecha inicial** / **Fecha final**

Haz clic en **"Buscar"** para aplicar los filtros, o en **"Limpiar filtros"** para reiniciarlos.

La tabla muestra fecha, empleado, sucursal, hora de entrada, hora de salida y horas trabajadas. Si un empleado entró pero no registró salida, verás **"Sin salida"** resaltado — y el estado de esa marcación aparecerá como **"Incompleto"**.

> **Nota:** Puedes elegir cuántos resultados ver por página (10, 25 o 50) en la parte inferior de la tabla.

### Pestaña "Lector de huella"

Aquí es donde los empleados **marcan su entrada y su salida** con la huella. Junto al título verás una etiqueta amarilla que dice **"Simulado"**: el restaurante todavía no tiene el lector de huella físico, así que esta pantalla hace su papel. Funciona igual que lo haría el aparato real.

> **Nota:** la hora de cada marcación la pone el sistema automáticamente. Nadie tiene que escribirla, y no se puede cambiar.

La pantalla tiene dos partes:

```
 ┌──────────────────────────────────┐ ┌──────────────────────────┐
 │                                  │ │ Simulación               │
 │  ┌────────────────────────────┐  │ │                          │
 │  │ Coloque su dedo en el      │  │ │ ¿Quién coloca el dedo?   │
 │  │ lector                     │  │ │  (o) Un empleado         │
 │  └────────────────────────────┘  │ │      [ Selecciona...   ] │
 │                                  │ │  ( ) Una persona sin     │
 │             ( huella )           │ │      huella registrada   │
 │                                  │ │                          │
 │  Toca el sensor para colocar     │ │ [ ] Simular una falla    │
 │  el dedo                         │ │     del lector           │
 └──────────────────────────────────┘ └──────────────────────────┘
        El lector (izquierda)          Panel de simulación (derecha)
```

- **El lector (izquierda):** tiene una pantalla que muestra mensajes y un botón redondo con el dibujo de una huella, que hace de sensor.
- **El panel "Simulación" (derecha):** como no hay un dedo real, aquí eliges quién "pone el dedo" en el lector.

#### Cómo registrar una entrada o una salida

1. En el panel **"Simulación"**, deja marcada la opción **"Un empleado"**.
2. En la lista, elige al empleado (aparece con su nombre y su número de documento).
3. Haz clic en el botón redondo de la huella.
4. La pantalla dice **"Leyendo huella…"** por un momento.
5. Aparece el resultado en la pantalla del lector.

**No hay que elegir si es entrada o salida: el sistema lo decide solo.**

```
   Primera marcación              Siguiente marcación
   del empleado                   del mismo empleado
 ┌──────────────────┐           ┌──────────────────┐
 │ Entrada          │    ──→    │ Salida           │
 │ registrada       │           │ registrada       │
 │                  │           │ Jornada: 8:00 –  │
 │ Ana Barros       │           │ 17:00 · 9 h      │
 └──────────────────┘           └──────────────────┘
```

- Si el empleado **no tiene una entrada abierta**, la marcación se guarda como **"Entrada registrada"**.
- Si **ya tiene una entrada abierta**, la marcación se guarda como **"Salida registrada"**, y además se muestra la jornada completa: hora de entrada, hora de salida y horas trabajadas.

En los dos casos la pantalla muestra el nombre del empleado, la hora de la marcación y la sucursal.

> **Nota:** un empleado puede tener varias jornadas en un mismo día. Cada vez que marca después de una salida, empieza una jornada nueva.

#### Qué significan los mensajes de error

Si la marcación no se puede registrar, la pantalla del lector muestra una **X roja** con el motivo:

| Mensaje en pantalla | Qué pasó | Qué hacer |
|---|---|---|
| **Huella no reconocida** | La huella no corresponde a ningún empleado registrado | Verifica que la persona esté registrada como empleado en **Personal** |
| **El empleado no se encuentra activo.** | El empleado está desactivado | Si debe seguir trabajando, actívalo de nuevo en **Personal** |
| **El empleado no tiene un restaurante asignado.** | El empleado no tiene sucursal | Asígnale una sucursal desde su detalle en **Personal** |
| **Registro duplicado no permitido** | El empleado marcó dos veces en menos de un minuto | No es un error grave: la primera marcación ya quedó guardada. Si necesita marcar de nuevo, debe esperar al menos un minuto |
| **Error en lectura biométrica** | El lector no pudo leer la huella | Intenta colocar el dedo otra vez |
| **No fue posible registrar la marcación. Intenta de nuevo.** | Ocurrió un problema en el sistema | Intenta de nuevo; si sigue pasando, avisa al equipo de soporte |

Cuando una marcación es rechazada, **no se guarda nada**: no queda ninguna entrada ni salida a medias.

#### Las otras opciones del panel de simulación

Estas opciones sirven para **probar** cómo responde el sistema ante problemas, sin necesidad de que ocurran de verdad:

- **"Una persona sin huella registrada":** simula a alguien que no es empleado del restaurante. El resultado esperado es el mensaje **"Huella no reconocida"**.
- **"Simular una falla del lector":** simula que el aparato no logró leer la huella. El resultado esperado es el mensaje **"Error en lectura biométrica"**. Recuerda desmarcar esta casilla cuando termines de probar.

> **Advertencia:** si un empleado marca su entrada y **no marca la salida en las siguientes 16 horas**, el sistema asume que olvidó marcarla. Esa jornada queda como **"Incompleta"** (con **"Sin salida"** en el Historial), y la siguiente marcación del empleado se toma como una **entrada nueva**, no como la salida de la jornada anterior.

---

## 7. Nómina (Liquidaciones)

Este es uno de los módulos más importantes: aquí se calculan y consultan los pagos a los empleados.

```
                    ┌─────────────────────┐
                    │   Calcular nómina    │  → simulación rápida,
                    │  (todos los emplea-  │    NO se guarda
                    │   dos a la vez)       │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │ Generar liquidación  │  → liquidación oficial
                    │  (un solo empleado)  │    de UN empleado,
                    │                       │    SÍ se guarda
                    └─────────────────────┘
```

### Ver la lista de liquidaciones

La pantalla principal muestra una tabla con todas las liquidaciones ya generadas: empleado, período, fecha de liquidación, total devengado, total de deducciones, neto a pagar y estado.

Puedes filtrar por empleado y por rango de período, igual que en los demás módulos. Al final de la página verás el total de liquidaciones y el total neto pagado en esa consulta.

Haz clic en el ícono de ojo de cualquier fila para ver el **detalle completo** de esa liquidación (ver más abajo).

### Generar liquidación (el flujo normal para pagarle a un empleado)

1. Haz clic en el botón **"Generar liquidación"** (arriba, con un ícono "+").
2. Se abre la ventana **"Preliquidación de nómina"**. Completa:
   - **Empleado** (solo aparecen empleados activos)
   - **Período desde** / **Período hasta**
3. Haz clic en **"Generar preliquidación"**.

```
  Paso 1                Paso 2                  Paso 3
┌──────────┐   ┌──────────────────┐   ┌───────────────────┐
│ Elegir    │   │   Revisar el      │   │   Confirmar        │
│ empleado  │ → │   resumen antes   │ → │   (se guarda       │
│ y período │   │   de guardar      │   │   oficialmente)    │
└──────────┘   └──────────────────┘   └───────────────────┘
```

4. El sistema te muestra un **resumen** con los totales (devengado, deducciones, neto a pagar), los conceptos uno por uno, y cualquier observación importante (por ejemplo, si una cuota de préstamo no se pudo descontar completa).
5. Si todo está correcto, haz clic en **"Confirmar liquidación"**. Si algo no cuadra, puedes cambiar el empleado o las fechas y volver a generar la preliquidación (el botón cambia a **"Recalcular"**).

> **Advertencia:** mientras no hagas clic en "Confirmar liquidación", **no se guarda nada**. Puedes revisar el resumen tranquilamente antes de decidir.

Al confirmar, el sistema te lleva automáticamente al **detalle de la liquidación recién creada**.

### Calcular nómina (simulación para todos los empleados)

Útil cuando quieres ver de un vistazo cuánto le va a costar al restaurante la nómina de un período, **sin generar liquidaciones todavía**.

1. Haz clic en **"Calcular nómina"**.
2. Elige **Período desde** / **Período hasta**.
3. Haz clic en **"Calcular nómina"**.

El sistema calcula la nómina de **todos los empleados activos** a la vez y te muestra los totales generales. Si algún empleado tiene información incompleta (por ejemplo, le falta un dato necesario para calcular su pago), aparece en una lista aparte explicando qué hay que corregir — ese empleado no se incluye en los totales hasta que se arregle su información.

Puedes hacer clic en el ícono de ojo de cualquier empleado del resultado para ver el detalle de su cálculo (horas trabajadas, conceptos, totales).

> **Nota:** Esta ventana es solo informativa: nada de lo que veas aquí queda guardado. Para guardar una liquidación real, usa **"Generar liquidación"**.

### Detalle de una liquidación

Al entrar al detalle de una liquidación verás toda su información: datos del empleado, período, fecha de liquidación, estado, y la tabla completa de conceptos devengados y deducciones, con el neto a pagar al final.

Abajo encontrarás dos botones importantes:

#### Exportar para contabilidad (CSV)

```
 [Exportar para contabilidad]  →  se descarga el archivo directo
                                    (no hay vista previa)
```

Genera y descarga automáticamente un archivo en formato **CSV** (una hoja de datos) con toda la información de esa liquidación, lista para entregar al área contable o importar en un sistema contable. El archivo se descarga de inmediato a tu computador, y verás un mensaje de confirmación: *"Archivo exportado correctamente."*

#### Generar PDF (comprobante de pago)

```
 [Generar PDF] → vista previa del documento → [Descargar PDF]
                          │
                          └→ [Volver al detalle]
```

1. Haz clic en **"Generar PDF"**.
2. El sistema genera el comprobante de pago y te muestra una **vista previa** en la misma pantalla (como si fuera una hoja de papel).
3. Si todo está correcto, haz clic en **"Descargar PDF"** para guardar el archivo en tu computador.
4. Si prefieres no descargarlo todavía, haz clic en **"Volver al detalle"** para regresar a la vista normal.

> **Nota:** Este PDF es el comprobante de pago (desprendible de nómina) que se le puede entregar al empleado.

---

## 8. Préstamos

Aquí se gestionan los préstamos de dinero que el restaurante le hace a sus empleados.

### Ver préstamos

La pantalla muestra dos tarjetas: **Préstamos Activos** y **Saldo Pendiente Total**, y debajo la tabla con todos los préstamos registrados (empleado, estado, monto total, valor de la cuota, saldo pendiente).

Puedes filtrar por empleado, estado (Activo / Saldado / Cancelado) y rango de fechas de otorgamiento.

### Crear un préstamo

1. Haz clic en **"Crear préstamo"**.
2. Completa:
   - **Empleado** (solo empleados activos)
   - **Valor del préstamo**
   - **Total de cuotas**
   - **Fecha de entrega**
   - **Periodicidad del descuento**: elige entre:
     - **Mensual** — se descuenta una cuota el último día de cada mes.
     - **Quincenal** — se descuentan dos cuotas al mes (el día 15 y el último día del mes).
3. Haz clic en **"Crear préstamo"**.

### Ver el detalle de un préstamo

Haz clic en el ícono de ojo de la fila correspondiente. Verás toda la información del empleado y del préstamo: monto total, valor de cada cuota, cuotas pendientes, saldo pendiente y fechas importantes. Esta ventana es solo de consulta (no se edita desde aquí).

---

## 9. Incapacidades

Aquí se registran y consultan las incapacidades médicas y licencias de los empleados.

### Ver incapacidades

Verás dos tarjetas con el resumen: **Incapacidades activas** y **Total días activos**. Debajo, la tabla con todos los registros, filtrable por empleado, cargo, estado y rango de fechas.

### Registrar una incapacidad o licencia

1. Haz clic en **"Registrar incapacidad"**.
2. Completa:
   - **Empleado**
   - **Tipo**: Enfermedad general / Accidente de trabajo / Licencia de maternidad / Licencia de paternidad / Otros.
     - Si eliges **"Otros"**, aparece un campo adicional para especificar de qué tipo se trata.
   - **Fecha de inicio** y **Fecha de finalización**
3. El campo **"Cantidad de días"** se calcula solo, automáticamente, a partir de las fechas — no hay que escribirlo.
4. Haz clic en **"Registrar incapacidad"**.

---

## 10. Configuración

Este módulo tiene cuatro pestañas: **Sucursales**, **Cargos**, **Parámetros de nómina** y **Soporte**.

### Sucursales

Permite registrar y editar las sedes del restaurante.

1. Haz clic en **"Crear sucursal"**.
2. Completa: **Nombre**, **Dirección**, **Ciudad** y, opcionalmente, **Teléfono**.
3. Confirma con el botón correspondiente.

Para editar, usa el ícono de lápiz de la fila. Para inactivar una sucursal, usa el ícono correspondiente — igual que con los empleados, el sistema no te dejará inactivar una sucursal que tenga empleados o historial de asistencia asociado.

### Cargos

Permite registrar los puestos de trabajo disponibles (Mesero, Cocinero, Cajero, etc.).

1. Haz clic en **"Nuevo cargo"**.
2. Completa **Nombre** (obligatorio) y **Descripción** (opcional).
3. Confirma.

Puedes filtrar la lista por estado (Activos / Inactivos) y editar o desactivar cada cargo con los íconos de la fila.

### Parámetros de nómina

Aquí se configuran las reglas generales con las que el sistema calcula la nómina de **todo el restaurante**. Tiene tres sub-secciones activas:

| Sub-sección | Qué configura |
|---|---|
| **Jornada laboral** | Horas máximas semanales/diarias, horario diurno y nocturno |
| **Horas y recargos** | Porcentajes de recargo para horas extra, nocturnas, dominicales y festivas |
| **Descuentos legales** | Porcentajes de salud y pensión que se descuentan a cada empleado |

> **Advertencia:** estos valores aplican para **todo el restaurante**, no se configuran por empleado individual.

Las tres funcionan con el mismo mecanismo, pensado para no perder el historial de cambios:

```
┌──────────────┐    ┌───────────────────┐    ┌────────────────────┐
│  1. Modificar │    │  2. Revisar        │    │  3. Confirmar       │
│  los valores  │ →  │  los cambios       │ →  │  (se guarda,        │
│  nuevos       │    │  (antes → después) │    │  entra en vigencia  │
│               │    │                    │    │  desde la fecha     │
│               │    │                    │    │  elegida)           │
└──────────────┘    └───────────────────┘    └────────────────────┘
```

1. En la sub-sección que quieras cambiar, haz clic en el botón de modificar (por ejemplo, **"Modificar jornada"**, **"Modificar recargos"** o **"Modificar descuentos"**).
2. Completa los nuevos valores y elige la fecha **"Vigente desde"** (debe ser una fecha futura, no puede ser anterior a hoy).
3. Haz clic en **"Revisar cambios"**. El sistema te muestra una comparación clara: qué valor tenía cada campo antes y cuál tendrá después.
4. Si todo está correcto, haz clic en **"Confirmar cambios"**. Si quieres corregir algo, haz clic en **"Volver"**.

> **Nota:** Los cambios **nunca se pierden**: cada vez que modificas algo, el sistema guarda una nueva versión con su fecha de vigencia, y conserva todas las versiones anteriores en una tabla de historial. Así, las liquidaciones ya generadas en el pasado nunca cambian aunque hoy ajustes las reglas.

### Soporte

Sección informativa con los canales oficiales de contacto para soporte del sistema.

---

## 11. Preguntas frecuentes

**¿Qué hago si olvidé mi contraseña?**
Por ahora el sistema no tiene una opción de "olvidé mi contraseña" en la pantalla de ingreso. Contacta al administrador del sistema para que te ayude a restablecerla.

**¿Por qué no veo algunos módulos del menú?**
El acceso a cada módulo depende de tu rol dentro del sistema. Si necesitas acceso a algo que no ves, contacta al administrador.

**Intenté desactivar un empleado/sucursal/cargo y no me dejó, ¿por qué?**
Porque tiene información relacionada (asistencia, nómina, incapacidades, etc.) que depende de ese registro. El sistema protege esa información histórica a propósito — no es un error.

**Cambié los valores en "Parámetros de nómina" pero las liquidaciones viejas no cambiaron, ¿está bien eso?**
Sí, es el comportamiento correcto. Las liquidaciones ya confirmadas conservan siempre los valores que tenían en el momento en que se generaron.

**Generé un PDF y el archivo no se ve bien o no se descarga, ¿qué hago?**
Vuelve al detalle con el botón "Volver al detalle" e inténtalo de nuevo con "Generar PDF". Si el problema persiste, el sistema te mostrará un mensaje explicando qué información falta o qué salió mal.

**Un empleado marcó y salió "Entrada registrada", pero en realidad estaba saliendo, ¿por qué?**
Porque el sistema no encontró una entrada abierta para él. Puede pasar si no marcó la entrada al llegar, o si pasaron más de 16 horas desde su última entrada. Puedes revisar sus marcaciones en la pestaña **Historial** de Asistencia.

**El empleado marcó dos veces seguidas por error, ¿quedaron dos marcaciones?**
No. Si las dos marcaciones están a menos de un minuto de distancia, el sistema guarda solo la primera y rechaza la segunda con el mensaje "Registro duplicado no permitido".

**¿Cuál es la diferencia entre "Calcular nómina" y "Generar liquidación"?**
"Calcular nómina" es una simulación rápida para **todos los empleados a la vez**, y **no se guarda**. "Generar liquidación" crea el pago oficial de **un solo empleado**, y sí **se guarda** en el sistema.

---

## 12. Glosario de términos

| Término | Significado |
|---|---|
| **Marcación** | El registro de la entrada o la salida de un empleado con su huella |
| **Jornada incompleta** | Una jornada con entrada pero sin salida registrada |
| **Liquidación** | El pago oficial y ya confirmado de un empleado por un período de trabajo |
| **Preliquidación** | El cálculo de una liquidación *antes* de confirmarla y guardarla |
| **Devengado** | Dinero que el empleado gana (salario, horas extra, etc.) |
| **Deducción** | Dinero que se le descuenta al empleado (salud, pensión, préstamos, etc.) |
| **Neto a pagar** | Lo que realmente recibe el empleado: devengado menos deducciones |
| **Jornada laboral** | El horario de trabajo general del restaurante (diurno/nocturno, horas máximas) |
| **Recargo** | Pago adicional por trabajar en horario nocturno, dominical o festivo |
| **Vigente desde** | La fecha a partir de la cual un nuevo valor configurado empieza a aplicar |
| **CSV** | Formato de archivo de datos (hoja de cálculo simple), usado aquí para integración contable |
| **PDF** | Formato de documento (como un papel digital), usado aquí para el comprobante de pago |

---

*Este manual cubre las funciones disponibles en SISGAL a la fecha de su publicación. Si encuentras una pantalla o función que no coincide con lo descrito aquí, es posible que el sistema haya sido actualizado — consulta con el equipo de desarrollo.*
