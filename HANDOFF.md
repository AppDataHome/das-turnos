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
