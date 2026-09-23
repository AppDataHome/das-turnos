# 📘 HAND OFF — DAS · Distribución y Asignación de Servicios

> Documento de traspaso para continuar el desarrollo en cualquier momento.

**Última actualización**: 23 de septiembre de 2026

---

## 🎯 Descripción

**DAS · Distribución y Asignación de Servicios** es una PWA para el control de turnos del personal de la Guardia Civil, con cálculo automático de los **días DAS** según la Orden General 11/2014.

- **URL producción**: https://das-turnos.vercel.app
- **Repositorio**: https://github.com/AppDataHome/das-turnos
- **Proyecto Supabase**: `das-turnos-2` — URL: https://kzyzedozynozxkqzaoqz.supabase.co
- **Stack**: React + Vite + TypeScript + Supabase + Vercel
- **Idioma**: español
- **Titular**: Víctor Vázquez Navarro (`vituko.ai@gmail.com`)

---

## ⚠️ Historial de cambios críticos

### 23-09-2026 — Corrección lógica DAS

La lógica de cálculo de DAS estaba mal. Se corrigió según art. 12 y 25 de la Orden General:

- **Festivo** = sábado 15:00 → lunes 06:00 + festivos de calendario + especial significación (24-26 dic, 31 dic-2 ene).
- **Nocturno** = 22:00-06:00 en días no festivos.
- Se reescribieron `es_servicio_festivo` y `es_servicio_nocturno`. Se añadieron `es_hora_festiva_o_especial` y `es_hora_nocturna_pura`.
- Se recalculó `evento_das`. Backup en `evento_das_backup_20260923`.

### 23-09-2026 — Ajustes con acordeones

Las tarjetas de Ajustes ahora se expanden y contraen (acordeón).

---

## 📁 Estructura del repositorio
das-turnos/
├── index.html # PWA + Inter font + manifest
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── public/
│ ├── icono.svg # Escudo dorado con DAS
│ └── manifest.webmanifest
└── src/
├── App.tsx # Núcleo: enrutado, login, contextos
├── index.css # TODOS los estilos (4 temas + componentes)
├── supabase.ts
├── tipos.ts
├── utilidades/
│ ├── csv.ts
│ └── turnos.ts
├── contexto/
│ ├── UsuarioContexto.tsx
│ ├── ToastContexto.tsx
│ └── ConfirmacionContexto.tsx
├── componentes/
│ ├── Escudo.tsx
│ ├── Avatar.tsx
│ ├── CampoPassword.tsx
│ ├── Skeleton.tsx
│ ├── Acordeon.tsx
│ ├── ContenedorToasts.tsx
│ └── ContenedorConfirmacion.tsx
└── pantallas/
├── Calendario.tsx
├── VistaMensual.tsx
├── VistaSemanal.tsx
├── VistaAnual.tsx
├── GestionTurnos.tsx
├── ModalDia.tsx
├── ModalInformeDas.tsx
├── ModalImprimirCalendario.tsx
├── ModalTurnosMes.tsx
├── ModalVacacionesAsuntos.tsx
├── VistaImpresionCalendario.tsx
├── AvisosBanner.tsx
├── Festivos.tsx
├── Configuracion.tsx
├── Ajustes.tsx
├── PestanaInvitados.tsx
├── SeccionDatos.tsx
├── SeccionDasRemanente.tsx
├── Ayuda.tsx
├── AccesoInvitacion.tsx
├── RecuperarPassword.tsx
├── RestablecerPassword.tsx
└── BarraInferior.tsx

text

---

## 🗄️ Base de datos (Supabase)

### Tablas

| Tabla | Función |
|---|---|
| `usuario` | Perfil público (extiende `auth.users`) |
| `departamento` | Departamentos (Patrulla, Oficina…) |
| `tipo_turno` | Tipos (M, T, N, VAC, DAS, AP, TEO, PRA, L) |
| `festivo_calendario` | Festivos (nacional/autonómico/local) |
| `turno` | Turnos asignados |
| `evento_das` | Eventos que generan DAS (por trigger) |
| `das_remanente` | DAS de cambio de destino |
| `invitacion` | Códigos de invitado |
| `suscripcion_push` | Sin usar (push aplazado) |
| `evento_das_backup_20260923` | Backup antes del recálculo DAS |

### Funciones SQL clave

- `es_hora_festiva_o_especial(ts)` — **nueva**
- `es_hora_nocturna_pura(ts)` — **nueva**
- `es_servicio_festivo(fecha, codigo)` — **corregida**
- `es_servicio_nocturno(fecha, codigo)` — **corregida**
- `get_das_status(usuario)` — contadores DAS
- `get_resumen_vacaciones(usuario)`
- `get_resumen_asuntos_propios(usuario)`
- `crear_turnos_en_bloque(...)`
- `get_informe_das(usuario, inicio, fin)`
- `importar_festivos_nacionales(anio)`
- `usuario_efectivo()`, `usuario_es_invitado()`, `get_id_propietario()`
- `validar_invitacion(codigo)`, `canjear_invitacion(codigo, nombre)`

### Trigger

`trg_turno_eventos_das` sobre `turno`: recalcula `evento_das` al insertar/actualizar/borrar.

---

## 🧮 Reglas de negocio

### Cálculo DAS (Orden General 11/2014, art. 12 y 25)

**Horas festivas**:
- Sábado 15:00 → lunes 06:00.
- Las 24h de festivos nacionales/autonómicos/locales.
- Especial significación: 14:00 del 24 dic → 06:00 del 26 dic; 14:00 del 31 dic → 06:00 del 2 ene.

**Horas nocturnas**: 22:00 → 06:00, **excluyendo** festivas y especial significación.

**Servicio festivo**: ≥3h festivas o de especial significación.
**Servicio nocturno**: ≥3h nocturnas puras.

**Generación**:
- 1 DAS cada 3 festivos.
- 1 DAS cada 6 noches.
- Independientes.
- Caducidad: 12 meses si hay corte >365 días.
- Límite: 2 DAS al mes (solo avisa).

### Ejemplos

**🎉 FESTIVOS**:
- Mañana/Tarde/Noche de festivo de calendario.
- Sábado Tarde, Sábado Noche.
- Domingo Mañana/Tarde/Noche.

**🌙 NOCTURNOS**:
- Noche de lunes a jueves.
- **Noche de viernes**.

**❌ NINGUNO**:
- Mañana y Tarde de lunes a viernes.
- **Mañana del sábado** (el festivo empieza a las 15:00).

### Vacaciones y AP

- Cupos independientes: 22 vacaciones, 6 AP por defecto.
- Arrastre con `anio_origen` por turno.
- Reinicio manual del arrastre.

### Invitados

- Códigos `DAS-XXXX-XXXX` de un solo uso.
- Sesión anónima sin registro.
- Modo solo lectura (RLS lo impone).

---

## 🛠️ Incidencias conocidas con Vercel

**Integración GitHub ↔ Vercel atascada**. Síntoma: Vercel compila commit antiguo.

Solución:
1. Comparar hash del commit del despliegue con el último de GitHub.
2. Vercel → Settings → Git → Disconnect / Connect.
3. Verificar en https://github.com/settings/installations que la app Vercel tiene acceso.
4. Forzar deploy desde "Create Deployment" → `main`.

---

## 📋 Estado actual

### ✅ Completo
- Autenticación completa (registro, login, cambio contraseña, recuperación).
- Calendario con 4 vistas (Mensual, Semanal, Anual, Gestión).
- Modal del día (un día / varios días).
- Tarjetas resumen clicables (Turnos Mes, Vacaciones/AP, DAS).
- Informe DAS imprimible.
- Impresión de calendario por rango.
- Sistema de invitados completo.
- 4 temas (auto/claro/oscuro/verde).
- Deshacer borrados con cuenta atrás.
- Ajustes con acordeones.
- PWA instalable.
- Centro de ayuda exhaustivo.

### ⏸️ Aplazado
- Notificaciones push.

### 📋 Pendiente (futuro)
- SMTP con Resend (correos en español).
- Bajas médicas y otros permisos.
- Estadísticas y gráficos.
- Vista de equipo.
- Intercambio de turnos.

---

## 🔧 Comandos SQL útiles

**Ver usuarios**:
```sql
select id, email, nombre, rol, invitado_de from usuario order by creado_en desc;
Ver invitaciones activas:

sql
select i.codigo, i.nombre_invitado, u.nombre as propietario, i.revocada
from invitacion i join usuario u on u.id = i.id_propietario
order by i.creada_en desc;
Desvincular manualmente un invitado:

sql
update usuario set rol='usuario', invitado_de=null where email='...';
Recalcular evento_das:

sql
create table evento_das_backup_YYYYMMDD as select * from evento_das;
delete from evento_das;
update turno set notas = notas;
📝 Flujo de trabajo recomendado
Un cambio por mensaje.

Archivos completos cuando el cambio afecte a varias líneas.

Subir archivos relacionados juntos.

Verificar Vercel en cada commit.

Exportar datos a CSV periódicamente.

🚀 Prioridades sugeridas
Configurar SMTP con Resend.

Añadir bajas médicas y otros permisos.

Estadísticas y gráficos.

Vista de equipo.

Notificaciones push.

📞 Contacto
Titular: Víctor Vázquez Navarro

Email: vituko.ai@gmail.com

App: https://das-turnos.vercel.app

Para el hand-off completo (con todos los detalles técnicos), revisar el histórico del chat.

text

5. Baja, mensaje: `Añadir HANDOFF.md`.
6. **Commit changes**.

---

## Paso 3: aquí tienes el hand-off completo actualizado

Con los últimos cambios (acordeones, corrección DAS, tarjetas clicables). Guárdalo en un archivo de texto aparte por si cambias de chat:

---

# 📘 HAND OFF — DAS · Distribución y Asignación de Servicios (v3)

**Última actualización**: 23 de septiembre de 2026

## 0. Cambios recientes importantes

### 23-09-2026 — CORRECCIÓN CRÍTICA DE LA LÓGICA DAS

La lógica de cálculo de DAS estaba **mal** desde el principio. Corregida según Orden General 11/2014 (arts. 12 y 25).

**Antes (incorrecto)**:
- Festivo = sábado 00:00 a domingo 24:00 completo.
- Nocturno = turno N con ≥3h entre 22:00-06:00.

**Ahora (correcto)**:
- Festivo = **sábado 15:00 → lunes 06:00** + festivos de calendario + especial significación.
- Nocturno = turno N con ≥3h nocturnas **puras** (excluyendo festivas y especial significación).

**Funciones SQL**:
- Añadidas: `es_hora_festiva_o_especial(ts)`, `es_hora_nocturna_pura(ts)`.
- Reescritas: `es_servicio_festivo`, `es_servicio_nocturno`.
- `evento_das` recalculada. Backup en `evento_das_backup_20260923`.

**Impacto**: los contadores DAS han cambiado. Ejemplo real: festivos 17→16, nocturnos 12→11.

### 23-09-2026 — Tarjetas clicables en Calendario

- **Turnos Mes** → abre modal con listado completo del mes visible.
- **Vacaciones y Asuntos Propios** → abre modal con dos pestañas.
- **DAS** → informe DAS (ya lo estaba).

### 23-09-2026 — Ajustes con acordeones

Las tarjetas de Ajustes se expanden y contraen al pulsarlas. Componente nuevo `Acordeon.tsx`. `SeccionDatos` y `SeccionDasRemanente` aceptan `sinCard` para usarse dentro.

### 23-09-2026 — Hand-off en el propio repo

Se ha creado `HANDOFF.md` en la raíz del repositorio con la documentación resumida.

---

## 1. Descripción

**DAS · Distribución y Asignación de Servicios** es una app web (PWA) para el control de turnos del personal de la Guardia Civil, con cálculo automático de los **días DAS** (Descansos Adicionales Singularizados) según normativa (Orden General 11/2014).

- **URL de producción**: `https://das-turnos.vercel.app`
- **Repositorio**: `https://github.com/AppDataHome/das-turnos`
- **Proyecto Supabase**: `das-turnos-2` — Project URL: `https://kzyzedozynozxkqzaoqz.supabase.co`
- **Stack**: React + Vite + TypeScript + CSS propio + Lucide Icons + Supabase + Vercel
- **Idioma**: Todo en español
- **Usuario final**: personal de la Guardia Civil
- **Titular actual**: Víctor Vázquez Navarro (`vituko.ai@gmail.com`)

---

## 2. Arquitectura técnica

### 2.1. Estructura del repositorio
das-turnos/
├── HANDOFF.md # Documento de traspaso
├── README.md
├── index.html # PWA + Inter font + manifest
├── package.json # react, react-dom, @supabase/supabase-js, lucide-react
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── public/
│ ├── icono.svg # Escudo dorado con DAS
│ └── manifest.webmanifest
└── src/
├── main.tsx
├── App.tsx # Núcleo: enrutado, login, contextos
├── index.css # Estilos (4 temas + componentes + impresión)
├── supabase.ts
├── tipos.ts
├── utilidades/
│ ├── csv.ts
│ └── turnos.ts
├── contexto/
│ ├── UsuarioContexto.tsx
│ ├── ToastContexto.tsx # Toasts con acción, contador y barra
│ └── ConfirmacionContexto.tsx
├── componentes/
│ ├── Escudo.tsx
│ ├── Avatar.tsx
│ ├── CampoPassword.tsx # Input con ojito
│ ├── Skeleton.tsx
│ ├── Acordeon.tsx # Tarjetas plegables
│ ├── ContenedorToasts.tsx
│ └── ContenedorConfirmacion.tsx
└── pantallas/
├── Calendario.tsx # Pantalla principal + tarjetas clicables
├── VistaMensual.tsx
├── VistaSemanal.tsx
├── VistaAnual.tsx
├── GestionTurnos.tsx
├── ModalDia.tsx
├── ModalInformeDas.tsx
├── ModalImprimirCalendario.tsx
├── ModalTurnosMes.tsx # Listado del mes
├── ModalVacacionesAsuntos.tsx # Dos pestañas
├── VistaImpresionCalendario.tsx
├── AvisosBanner.tsx
├── Festivos.tsx
├── Configuracion.tsx
├── Ajustes.tsx # Subpestañas con acordeones
├── PestanaInvitados.tsx
├── SeccionDatos.tsx # Prop sinCard
├── SeccionDasRemanente.tsx # Prop sinCard
├── Ayuda.tsx
├── AccesoInvitacion.tsx
├── RecuperarPassword.tsx
├── RestablecerPassword.tsx
└── BarraInferior.tsx

text

### 2.2. Plataformas

- **GitHub**: repositorio del código. Commits directos a `main`.
- **Supabase**: base de datos PostgreSQL + auth + storage + RLS.
- **Vercel**: hosting + CI/CD desde GitHub.
- **Plan**: Supabase Free, Vercel Hobby.

### 2.3. Variables de entorno en Vercel

- `VITE_SUPABASE_URL` = `https://kzyzedozynozxkqzaoqz.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = clave anon public

### 2.4. Incidencias conocidas con Vercel

La integración GitHub ↔ Vercel se ha atascado varias veces. Síntoma: commits en GitHub pero Vercel compila un commit antiguo. Solución:

1. Comparar hash del commit del despliegue con el último de GitHub.
2. Vercel → Settings → Git → Disconnect / Connect.
3. Verificar en `https://github.com/settings/installations` que la app Vercel tiene acceso a todos los repos.
4. Forzar deploy desde "Create Deployment" → `main`.

---

## 3. Base de datos (Supabase)

### 3.1. Tablas

| Tabla | Función | Campos clave |
|---|---|---|
| `usuario` | Perfil público | id, email, nombre, numero_empleado, rol, tema, activo, dias_vacaciones_anuales (22), dias_vacaciones_arrastradas, anio_vacaciones_arrastradas, dias_asuntos_propios_anuales (6), dias_asuntos_propios_arrastrados, anio_asuntos_propios_arrastrados, avatar_url, invitado_de, codigo_invitacion |
| `departamento` | Departamentos | id, nombre (único), activo, icono |
| `tipo_turno` | Tipos de turno | id, codigo, nombre, hora_inicio, hora_fin, cruza_medianoche, categoria, color, orden |
| `festivo_calendario` | Festivos | id, fecha, ambito, descripcion, importado |
| `turno` | Turnos | id, id_usuario, id_departamento, fecha, id_tipo_turno, notas, anio_origen, creado_por, creado_en |
| `evento_das` | Eventos DAS (trigger) | id, id_usuario, tipo ('festivo'/'nocturno'), id_turno, fecha, creado_en |
| `evento_das_backup_20260923` | Backup del recálculo | — |
| `ausencia` | Tabla antigua sin usar | — |
| `das_remanente` | DAS cambio destino | id, id_usuario, cantidad, descripcion, creado_en |
| `invitacion` | Códigos invitado | id, id_propietario, codigo, nombre_invitado, email_invitado, creada_en, revocada, ultimo_acceso |
| `suscripcion_push` | Sin usar | — |

### 3.2. Tipos de turno

| Código | Nombre | Categoría | Orden |
|---|---|---|---|
| M | Mañana | trabajo | 1 |
| T | Tarde | trabajo | 2 |
| N | Noche | trabajo | 3 |
| VAC | Vacaciones | libre | 4 |
| DAS | Día DAS | libre | 5 |
| AP | Asuntos Propios | libre | 6 |
| TEO | Teoría | formacion | 7 |
| PRA | Prácticas | formacion | 8 |
| L | Libre | libre | 9 |

### 3.3. Departamentos

- 🚔 Patrulla
- 🖥️ Oficina

### 3.4. Funciones SQL clave

- `es_hora_festiva_o_especial(ts)` — **NUEVA**. True si la hora cae en festivo, fin de semana (sáb 15:00 → lun 06:00) o especial significación.
- `es_hora_nocturna_pura(ts)` — **NUEVA**. True si 22:00-06:00 y NO festiva/especial.
- `es_servicio_festivo(fecha, codigo)` — **CORREGIDA**. True si ≥3h festivas.
- `es_servicio_nocturno(fecha, codigo)` — **CORREGIDA**. True si ≥3h nocturnas puras.
- `calcular_domingo_pascua(anio)`
- `importar_festivos_nacionales(anio)`
- `get_das_status(usuario)`
- `get_resumen_vacaciones(usuario)`
- `get_resumen_asuntos_propios(usuario)`
- `crear_turnos_en_bloque(...)`
- `get_informe_das(usuario, inicio, fin)`
- `usuario_efectivo()`, `usuario_es_invitado()`, `get_id_propietario()`
- `validar_invitacion(codigo)`, `canjear_invitacion(codigo, nombre)`

### 3.5. Triggers

`trg_turno_eventos_das` sobre `turno`: al insertar/actualizar/borrar, recalcula si es festivo/nocturno y actualiza `evento_das`.

### 3.6. Políticas RLS

Patrón general:
- **SELECT**: `id_usuario = usuario_efectivo()` (usuario ve lo suyo, invitado ve lo del propietario).
- **INSERT/UPDATE/DELETE**: `id_usuario = auth.uid() AND NOT usuario_es_invitado()`.
- `invitacion`: todas las operaciones limitadas a `id_propietario = auth.uid()`.

### 3.7. Storage

Bucket `avatares` (público). Políticas: lectura pública, escritura/borrado limitado a la carpeta propia del usuario.

### 3.8. Auth

Email + contraseña con confirmación. **Anonymous Sign-Ins activado** para invitados. Site URL: `https://das-turnos.vercel.app`. Plantillas en inglés (no editables sin SMTP propio).

---

## 4. Reglas de negocio

### 4.1. Cálculo de DAS (Orden General 11/2014)

**Horas festivas** (art. 12.1.c):
- Sábado 15:00 → lunes 06:00.
- Las 24h de festivos nacionales/autonómicos/locales.
- Especial significación: 14:00 del 24 dic → 06:00 del 26 dic; 14:00 del 31 dic → 06:00 del 2 ene.

**Horas nocturnas** (art. 12.1.d):
- 22:00 → 06:00, **excluyendo** festivas y especial significación.

**Servicio festivo** (art. 25.1):
- ≥3h festivas o de especial significación.

**Servicio nocturno** (art. 25.1):
- ≥3h nocturnas puras.

**Generación**:
- 1 DAS cada 3 festivos.
- 1 DAS cada 6 noches.
- Independientes.
- Caducidad: 12 meses si corte >365 días.
- Límite: 2 DAS al mes (solo avisa).

**Ejemplos**:

🎉 **Cuentan como FESTIVO**:
- Mañana, Tarde o Noche de festivo de calendario.
- Sábado Tarde, Sábado Noche.
- Domingo Mañana, Tarde, Noche.
- Turnos en especial significación.

🌙 **Cuentan como NOCTURNO**:
- Noche de lunes a jueves.
- **Noche de viernes**.

❌ **NO cuentan**:
- Mañana y Tarde de lunes a viernes.
- **Mañana del sábado** (festivo empieza a las 15:00).

### 4.2. Vacaciones y AP

Cupos independientes: 22 vacaciones, 6 AP. Arrastre entre años con `anio_origen` por turno.

### 4.3. Festivos

Nacionales: automáticos (10 + Viernes Santo). Autonómicos/locales: manuales. Selector de años dinámico.

### 4.4. Invitados

Código `DAS-XXXX-XXXX` de un solo uso. Sesión anónima sin registro. Modo solo lectura.

---

## 5. Funcionalidades implementadas

### 5.1. Autenticación
- Registro, login, logout, cambio de contraseña, ojito, recuperación.

### 5.2. Calendario
- 4 vistas (Mensual, Semanal, Anual, Gestión).
- Modal del día (un día / varios días).
- Modal del día en modo solo lectura para invitados.
- Doblar turnos.

### 5.3. Tarjetas resumen
- **Turnos Mes** (clic → modal listado del mes).
- **Vacaciones y Asuntos Propios** (clic → modal con 2 pestañas).
- **DAS** (clic → informe).

### 5.4. Informes e impresión
- Informe DAS por rango (imprimible, PDF).
- Imprimir calendario por rango.

### 5.5. Gestión
- Festivos, departamentos, tipos de turno.
- Import/export CSV.
- DAS remanentes.

### 5.6. UX
- 4 temas (auto/claro/oscuro/verde).
- Responsive, barra inferior móvil.
- Toasts con contador.
- Confirmaciones propias.
- Deshacer borrados (7s con cuenta atrás).
- Skeletons.
- Avatar.
- **Acordeones** en Ajustes.
- Centro de ayuda con 18 secciones.

### 5.7. PWA
- Instalable, icono propio, nombre completo.

---

## 6. Decisiones de diseño

- **Fuente**: Inter.
- **Iconos**: Lucide React.
- **Paleta oscura**: `#0b0e13`, `#131720`, acento `#d4a43a`.
- **Paleta clara**: `#f5f6f8`, `#ffffff`, acento `#a67c1f`.
- **Paleta verde**: `#08150d`, acento `#7fbf5f`.
- **Variables CSS** en `:root`.
- **Móvil primero**.
- **Todo en español**.

---

## 7. Aprendizajes y problemas resueltos

1. **`gen_random_uuid()`**: usar `uuid_generate_v4()` o activar `pgcrypto`.
2. **Reemplazar funciones con distinto tipo retorno**: DROP primero.
3. **Reemplazar archivo en GitHub**: usar el lápiz, no crear nuevo.
4. **Caché Vercel**: Ctrl+Shift+R. Si no, revisar hash del commit.
5. **Invitados**: usan Anonymous Sign-In, email sintético.
6. **RLS con invitados**: `usuario_efectivo()` devuelve id del propietario.
7. **Recalcular `evento_das`**: backup + delete + `update turno set notas = notas`.

---

## 8. Comandos SQL útiles

**Ver usuarios**:
```sql
select id, email, nombre, rol, invitado_de from usuario order by creado_en desc;
Ver invitaciones activas:

sql
select i.codigo, i.nombre_invitado, u.nombre as propietario, i.revocada
from invitacion i join usuario u on u.id = i.id_propietario
order by i.creada_en desc;
Desvincular manualmente:

sql
update usuario set rol='usuario', invitado_de=null where email='...';
Recalcular evento_das:

sql
create table evento_das_backup_YYYYMMDD as select * from evento_das;
delete from evento_das;
update turno set notas = notas;
9. Funcionalidades pendientes
9.1. Notificaciones push (aplazado)
Aplazado por complejidad en iOS.

Tabla suscripcion_push creada pero sin usar.

Alternativas: email con Vercel Cron + Resend, widget iOS, Google Calendar.

9.2. SMTP personalizado
Supabase bloquea edición de plantillas sin SMTP.

Solución: Resend (gratis, 3.000/mes).

Host: smtp.resend.com, puerto 465, usuario resend.

9.3. Bajas médicas y otros permisos
Añadir tipos: "Baja médica", "Maternidad", "Permiso".

Decidir impacto en DAS y Turnos Mes.

9.4. Estadísticas y gráficos
Turnos por mes, festivos y noches por trimestre.

Exportable a PDF.

9.5. Vista de equipo
Turnos de varios compañeros en calendario compartido.

Roles avanzados.

9.6. Intercambio de turnos
Aprobación de compañeros.

9.7. Otras mejoras
Modo claro automático por horas.

Búsqueda global.

Plantillas de turnos (rotación 7×7).

Adjuntar archivos.

Historial de cambios.

Dominio propio.

Roles avanzados.

Drag & drop de turnos.

10. Mantenimiento
10.1. Copias de seguridad
Ajustes → Datos → Exportar CSV mensual.

Supabase backups diarios (7 días).

Backup de evento_das antes de cambios en lógica DAS.

10.2. Si Vercel no despliega
Comparar hash del commit.

Settings → Git → Disconnect / Connect.

Verificar permisos.

Forzar deploy desde "Create Deployment" → main.

10.3. Cómo cambiar textos o ayuda
Textos en los .tsx correspondientes.

Ayuda: array secciones en src/pantallas/Ayuda.tsx.

11. Estado actual
✅ COMPLETO
Todo el sistema de turnos, cálculo DAS corregido, vacaciones, AP.

4 vistas de calendario.

Tarjetas clicables con modales.

Informes DAS e impresión de calendario.

Sistema de invitados con RLS.

4 temas.

Recuperación de contraseña.

Deshacer borrados con cuenta atrás.

Acordeones en Ajustes.

PWA instalable.

Centro de ayuda exhaustivo.

HANDOFF.md en el repo.

⏸️ APLAZADO
Notificaciones push.

📋 PENDIENTE
SMTP Resend.

Bajas médicas.

Estadísticas.

Vista de equipo.

Intercambio turnos.

Mejoras menores.

12. Cómo continuar
12.1. Antes de tocar nada
Comprobar último despliegue Vercel (verde + commit correcto).

Exportar datos a CSV.

Leer HANDOFF.md y este documento.

12.2. Flujo
Un cambio por mensaje.

Archivos completos si toca varias líneas.

Subir archivos relacionados juntos.

Verificar Vercel.

Probar en móvil con datos si red local falla.

12.3. Prioridades
SMTP Resend.

Bajas médicas.

Estadísticas.

Vista de equipo.

Push (con alternativas simples).

13. Contacto
Titular: Víctor Vázquez Navarro

Email: vituko.ai@gmail.com

Repo: https://github.com/AppDataHome/das-turnos

App: https://das-turnos.vercel.app

14. Notas finales
Todo el código en español.

Diseño responsive y mobile-first.

Seguridad por RLS.

Lista para uso real.

Temas con variables CSS.

Ayuda exhaustiva.

HANDOFF.md en el repo para consulta rápida.

15. Histórico de cambios
Fecha	Cambio
2026-09 (inicio)	Creación: turnos, calendario, panel DAS básico
2026-09	Festivos, tipos de turno, departamentos
2026-09	Tarjetas ricas (Turnos Mes, Vacaciones, DAS)
2026-09	Vista anual
2026-09	Cálculo DAS festivos y noches (incorrecto)
2026-09	Import/export CSV
2026-09	Toasts, confirmaciones, skeletons
2026-09	Avisos, cambio contraseña, DAS remanentes
2026-09	PWA, temas, centro de ayuda
2026-09	Sistema invitados
2026-09	Vista Gestión
2026-09	Modo claro (4 temas)
2026-09	Imprimir calendario
2026-09	Recuperación contraseña
2026-09	Deshacer borrados
2026-09-23	CORRECCIÓN CRÍTICA lógica DAS
2026-09-23	Tarjetas clicables (Turnos Mes / Vacaciones-AP)
2026-09-23	Acordeones en Ajustes
2026-09-23	HANDOFF.md en el repo
Fin del hand-off v3.
