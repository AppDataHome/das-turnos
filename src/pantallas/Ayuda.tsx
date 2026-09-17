import { useState } from 'react'

interface Seccion {
  id: string
  titulo: string
  icono: string
  contenido: React.ReactNode
}

export default function Ayuda() {
  const [abierta, setAbierta] = useState<string | null>('introduccion')

  function alternar(id: string) {
    setAbierta(abierta === id ? null : id)
  }

  const secciones: Seccion[] = [
    // ─────────────────────────────────────────
    {
      id: 'introduccion',
      titulo: 'Introducción',
      icono: '👋',
      contenido: (
        <>
          <p>
            <strong>DAS · Control de Turnos</strong> es una aplicación para
            llevar el calendario de turnos del personal y calcular
            automáticamente los <strong>días DAS</strong> generados por
            servicios festivos y nocturnos, según la normativa de la Guardia
            Civil.
          </p>
          <p>
            Toda la información se guarda en la nube y solo tú puedes ver y
            modificar tus turnos. Los cambios se sincronizan al instante entre
            dispositivos.
          </p>

          <h4>¿Qué puedo hacer con la app?</h4>
          <ul>
            <li>
              Registrar tus turnos diarios (Mañana, Tarde, Noche, Libre,
              Teoría, Prácticas, Vacaciones, DAS, Asuntos Propios…).
            </li>
            <li>
              Ver el calendario en vista <strong>mensual</strong> o{' '}
              <strong>semanal</strong>.
            </li>
            <li>
              Consultar el saldo de <strong>DAS</strong>,{' '}
              <strong>vacaciones</strong> y <strong>turnos del mes</strong>.
            </li>
            <li>
              Marcar festivos del calendario (nacionales, autonómicos y
              locales).
            </li>
            <li>
              Exportar e importar tus datos en formato Excel/CSV como copia de
              seguridad.
            </li>
            <li>Instalarla en el móvil como una app normal.</li>
          </ul>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'primeros-pasos',
      titulo: 'Primeros pasos',
      icono: '🚀',
      contenido: (
        <>
          <h4>1. Registro</h4>
          <p>
            Entra en la aplicación y pulsa <strong>¿No tienes cuenta?
            Regístrate</strong>. Introduce tu correo y una contraseña (mínimo 6
            caracteres). Recibirás un correo de Supabase para confirmar la
            cuenta.
          </p>

          <h4>2. Rellena tu perfil</h4>
          <p>
            Ve a la pestaña <strong>Ajustes → Mi perfil</strong> y completa tu
            nombre y tu número de empleado. Aparecerán en la cabecera.
          </p>

          <h4>3. Configura tus vacaciones</h4>
          <p>
            En <strong>Ajustes → Vacaciones</strong> indica los días que te
            corresponden al año (por defecto 22) y, si procede, los días
            arrastrados del año anterior.
          </p>

          <h4>4. Mete los festivos</h4>
          <p>
            Ve a la pestaña <strong>Festivos</strong> y pulsa{' '}
            <strong>Importar nacionales de {new Date().getFullYear()}</strong>.
            Los autonómicos y locales los añades a mano.
          </p>

          <h4>5. Empieza a meter turnos</h4>
          <p>
            Vuelve al <strong>Calendario</strong> y pulsa cualquier día para
            abrir la ventana de edición. Ahí puedes añadir el turno o los
            turnos de ese día.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'calendario',
      titulo: 'Calendario · Vistas',
      icono: '📅',
      contenido: (
        <>
          <p>
            La pestaña <strong>Calendario</strong> es la pantalla principal.
            Arriba del todo verás tres tarjetas con los datos del mes:
          </p>

          <h4>Tarjeta "Turnos Mes"</h4>
          <ul>
            <li>
              <strong>Realizados</strong>: turnos de trabajo (Mañana, Tarde,
              Noche) que ya has hecho este mes.
            </li>
            <li>
              <strong>Restantes</strong>: turnos de trabajo pendientes este
              mes.
            </li>
            <li>La barra central muestra el progreso.</li>
          </ul>

          <h4>Tarjeta "Vacaciones"</h4>
          <ul>
            <li>
              <strong>Total</strong>: días anuales que tienes asignados.
            </li>
            <li>
              <strong>Disfrutadas</strong>: días de este año ya usados.
            </li>
            <li>
              <strong>Disponibles</strong>: los que te quedan.
            </li>
            <li>
              Si tienes arrastre del año anterior, verás un bloque adicional.
            </li>
          </ul>

          <h4>Tarjeta "DAS"</h4>
          <ul>
            <li>
              <strong>Generados / Disfrutados / Disponibles</strong>: saldo de
              DAS.
            </li>
            <li>
              <strong>Festivos / Fines de semana trabajados</strong>: cuántos
              llevas, cuántos DAS han generado y cuántos residuos tienes.
            </li>
            <li>
              <strong>Noches entre semana trabajadas</strong>: lo mismo con las
              noches.
            </li>
          </ul>

          <h4>Selector de vista</h4>
          <p>
            Justo debajo de las tarjetas tienes dos botones:{' '}
            <strong>Mensual</strong> y <strong>Semanal</strong>.
          </p>
          <ul>
            <li>
              <strong>Mensual</strong>: rejilla clásica de mes. Los sábados,
              domingos y festivos llevan fondo rojo suave o marcado.
            </li>
            <li>
              <strong>Semanal</strong>: columnas con el detalle de cada día.
            </li>
          </ul>
          <p>
            La vista elegida se recuerda aunque cierres la app.
          </p>

          <h4>Panel del día seleccionado</h4>
          <p>
            Debajo del calendario aparece siempre el detalle del día
            seleccionado: cada turno con su icono, horario, departamento, notas
            y los puntitos indicadores (amarillo = festivo, azul = nocturno).
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'anadir-turnos',
      titulo: 'Añadir, editar y borrar turnos',
      icono: '✏️',
      contenido: (
        <>
          <h4>Cómo abrir la ventana de un día</h4>
          <p>
            Pulsa cualquier día en el calendario (mensual o semanal) o el botón{' '}
            <strong>Editar día</strong> en el panel inferior.
          </p>

          <h4>Modo "Un día"</h4>
          <p>
            Dentro de la ventana, la pestaña <strong>Un día</strong> sirve para
            añadir, editar o borrar un turno de ese día concreto:
          </p>
          <ul>
            <li>
              <strong>Añadir</strong>: elige tipo de turno, departamento y, si
              quieres, notas. Pulsa Añadir turno.
            </li>
            <li>
              <strong>Editar</strong>: pulsa el botón Editar de un turno
              existente. El formulario se rellena y solo tienes que modificar
              lo que quieras.
            </li>
            <li>
              <strong>Borrar</strong>: pulsa el botón Borrar y confirma.
            </li>
          </ul>
          <p>
            Puedes tener <strong>varios turnos el mismo día</strong> (por
            ejemplo, Mañana + Noche) siempre que no repitas el mismo tipo.
          </p>

          <h4>Modo "Varios días"</h4>
          <p>
            La pestaña <strong>Varios días</strong> permite rellenar un rango
            completo de golpe (por ejemplo, 15 días de vacaciones). Rellena:
          </p>
          <ul>
            <li>
              <strong>Desde / Hasta</strong>: las fechas del rango.
            </li>
            <li>
              <strong>Tipo de turno</strong>: puede ser cualquiera.
            </li>
            <li>
              <strong>Departamento</strong>: se aplica a todos los días del
              rango (no aplica si es VAC, DAS o similar).
            </li>
            <li>
              <strong>Año de origen</strong>: solo aparece si el tipo es
              VAC. Sirve para elegir si son días del año actual o del anterior.
            </li>
            <li>
              <strong>Notas</strong>: opcionales, se aplican a todo el rango.
            </li>
          </ul>
          <p>
            Al pulsar <strong>Crear en bloque</strong> la app te dirá cuántos
            días ha creado y cuántos ha ignorado porque ya existían.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'das',
      titulo: 'Cómo se calculan los DAS',
      icono: '🎁',
      contenido: (
        <>
          <p>
            Los <strong>DAS (Descansos Adicionales Singularizados)</strong> se
            generan automáticamente según la normativa (Orden General 11/2014):
          </p>

          <h4>Generación</h4>
          <ul>
            <li>
              <strong>1 DAS por cada 3 festivos</strong> trabajados.
            </li>
            <li>
              <strong>1 DAS por cada 6 noches</strong> trabajadas.
            </li>
          </ul>

          <h4>¿Qué cuenta como festivo?</h4>
          <p>
            Un turno de trabajo (Mañana, Tarde o Noche) en el que al menos 3
            horas caen en:
          </p>
          <ul>
            <li>Un día festivo del calendario (nacional, autonómico o local).</li>
            <li>Un sábado.</li>
            <li>Un domingo.</li>
          </ul>

          <h4>¿Qué cuenta como noche?</h4>
          <p>
            Un turno de Noche (22:00–06:00) en el que al menos 3 horas son
            nocturnas <strong>puras</strong>, es decir, <strong>excluyendo
            las que ya cuentan como festivas</strong>. Por eso un turno de
            Noche en sábado cuenta como festivo, pero no como noche.
          </p>

          <h4>Caducidad</h4>
          <p>
            Los servicios (festivos o noches) caducan a los 12 meses si entre
            uno y el siguiente pasa más de un año sin acumular.
          </p>

          <h4>Límites de disfrute</h4>
          <p>
            La normativa permite <strong>un máximo de 2 DAS al mes</strong>. La
            app te avisa cuando llegas a 2 y cuando lo superas, pero no bloquea
            nada.
          </p>

          <h4>DAS remanentes (cambio de destino)</h4>
          <p>
            Si vienes de otra unidad con DAS pendientes, ve a{' '}
            <strong>Ajustes → DAS remanentes</strong> y añádelos. Se sumarán a
            tu saldo disponible.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'vacaciones',
      titulo: 'Vacaciones y ausencias',
      icono: '🏖️',
      contenido: (
        <>
          <h4>Añadir vacaciones</h4>
          <p>
            Puedes hacerlo de dos maneras:
          </p>
          <ul>
            <li>
              <strong>Día a día</strong>: abre el día, elige tipo{' '}
              <em>Vacaciones</em> y guarda.
            </li>
            <li>
              <strong>En bloque</strong>: abre cualquier día, ve a la pestaña{' '}
              <strong>Varios días</strong>, elige las fechas y el tipo
              Vacaciones. Mucho más rápido.
            </li>
          </ul>

          <h4>Vacaciones arrastradas del año anterior</h4>
          <p>
            Cuando cambias de año, es posible que te sobren días del año
            anterior. Para que no se mezclen con los del año nuevo:
          </p>
          <ol>
            <li>
              Ve a <strong>Ajustes → Vacaciones</strong> y anota cuántos días
              arrastras y de qué año.
            </li>
            <li>
              Cuando los disfrutes, en el formulario de "Varios días" elige el
              año de origen <strong>correcto</strong> (el año anterior).
            </li>
            <li>
              Así los días del año actual quedan intactos.
            </li>
          </ol>

          <h4>Otros tipos de ausencia</h4>
          <ul>
            <li>
              <strong>Asuntos propios</strong>: días de libre disposición.
            </li>
            <li>
              <strong>Día DAS</strong>: cuando disfrutas de un DAS generado.
              Descuenta automáticamente del saldo.
            </li>
            <li>
              <strong>Libre</strong>: día de descanso normal.
            </li>
          </ul>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'festivos',
      titulo: 'Festivos del calendario',
      icono: '🎉',
      contenido: (
        <>
          <p>
            En la pestaña <strong>Festivos</strong> se gestiona el calendario
            de días festivos.
          </p>

          <h4>Importar nacionales</h4>
          <p>
            Elige el año y pulsa <strong>Importar nacionales de XXXX</strong>.
            La app añade los 10 festivos nacionales de ese año (incluido el
            Viernes Santo, que cambia cada año).
          </p>

          <h4>Añadir autonómicos y locales</h4>
          <p>
            En el formulario de arriba rellena fecha, ámbito (Autonómico o
            Local) y descripción, y pulsa <strong>Añadir</strong>.
          </p>

          <h4>Editar y borrar</h4>
          <p>
            Cada festivo tiene botones <strong>Editar</strong> y{' '}
            <strong>Borrar</strong> en la lista.
          </p>

          <h4>Repercusión en el calendario</h4>
          <p>
            Los festivos se muestran en el calendario con fondo rojo más
            marcado, y el número en rojo. Además, los turnos de trabajo que
            caigan en festivos contarán para el cálculo de DAS.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'configuracion',
      titulo: 'Configuración (departamentos y tipos de turno)',
      icono: '⚙️',
      contenido: (
        <>
          <p>
            En la pestaña <strong>Configuración</strong> se gestionan los
            departamentos y los tipos de turno.
          </p>

          <h4>Departamentos</h4>
          <p>Cada departamento tiene:</p>
          <ul>
            <li>
              <strong>Icono</strong>: un emoji. Por ejemplo 🚔 para Patrulla, 🖥️
              para Oficina, 🐕 para Unidad Canina.
            </li>
            <li>
              <strong>Nombre</strong>: el que se mostrará en los turnos.
            </li>
            <li>
              <strong>Estado</strong>: activo o inactivo. Los inactivos no
              aparecen en los desplegables, pero los turnos antiguos siguen
              mostrándose.
            </li>
          </ul>
          <p>
            Puedes <strong>añadir</strong>, <strong>editar</strong>,{' '}
            <strong>activar/desactivar</strong> o <strong>borrar</strong>{' '}
            (borrar solo si no tiene turnos asociados).
          </p>

          <h4>Tipos de turno</h4>
          <p>Cada tipo de turno tiene:</p>
          <ul>
            <li>
              <strong>Código</strong>: corto, por ejemplo M, T, N, VAC.
            </li>
            <li>
              <strong>Nombre</strong>: el que se muestra, por ejemplo Mañana.
            </li>
            <li>
              <strong>Horario</strong>: hora de inicio y fin.
            </li>
            <li>
              <strong>Categoría</strong>: Trabajo (cuenta para DAS), Libre /
              Ausencia, Formación u Otros.
            </li>
            <li>
              <strong>Color</strong>: el color del chip en el calendario.
            </li>
            <li>
              <strong>Orden</strong>: número que decide en qué posición
              aparecen (menor = antes).
            </li>
          </ul>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'ajustes',
      titulo: 'Ajustes y seguridad',
      icono: '🔒',
      contenido: (
        <>
          <h4>Mi perfil</h4>
          <p>
            Cambia tu nombre y número de empleado. El correo no se puede
            cambiar.
          </p>

          <h4>Cambiar contraseña</h4>
          <p>
            Por seguridad, se exige introducir la <strong>contraseña
            actual</strong> antes de poner una nueva. Así nadie que coja tu
            dispositivo podrá cambiarla sin saberla.
          </p>

          <h4>Datos · Exportar/Importar</h4>
          <p>
            Puedes descargar tus turnos y los festivos en formato CSV (se abre
            con Excel). También puedes importarlos: la importación no borra
            nada y los duplicados se ignoran.
          </p>

          <h4>Tema</h4>
          <p>
            Dos temas disponibles: <strong>Negro</strong> (oscuro con acentos
            dorados) y <strong>Verde Guardia Civil</strong>.
          </p>

          <h4>Cerrar sesión</h4>
          <p>
            Al cerrar sesión, tendrás que volver a meter correo y contraseña.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'exportar',
      titulo: 'Exportar e importar (copia de seguridad)',
      icono: '💾',
      contenido: (
        <>
          <p>
            En <strong>Ajustes → Datos</strong> tienes cuatro botones:
          </p>
          <ul>
            <li>
              <strong>⬇ Exportar turnos a CSV</strong>: descarga un archivo
              con todos tus turnos. Se abre en Excel.
            </li>
            <li>
              <strong>⬆ Importar turnos desde CSV</strong>: sube un CSV y
              añade los turnos que no existan.
            </li>
            <li>
              <strong>⬇ Exportar festivos a CSV</strong>: descarga los
              festivos.
            </li>
            <li>
              <strong>⬆ Importar festivos desde CSV</strong>: sube festivos.
            </li>
          </ul>

          <h4>Formato del CSV de turnos</h4>
          <p>Las columnas son (en este orden):</p>
          <pre
            style={{
              background: 'var(--fondo-tarjeta-2)',
              padding: 10,
              borderRadius: 6,
              fontSize: 12,
              overflowX: 'auto',
            }}
          >
fecha,tipo,departamento,notas,anio_origen
2026-01-15,M,Patrulla,, 
2026-01-20,VAC,,Verano,2026
          </pre>
          <p>
            <strong>fecha</strong> en formato AAAA-MM-DD, <strong>tipo</strong>{' '}
            es el código (M, T, N, VAC, DAS, AP, L, TEO, PRA…),{' '}
            <strong>departamento</strong> es el nombre exacto del departamento,
            y <strong>anio_origen</strong> solo se usa para VAC.
          </p>

          <h4>Recomendación</h4>
          <p>
            Haz una exportación cada cierto tiempo (o antes de grandes
            cambios) y guarda el CSV. Es tu red de seguridad.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'instalar',
      titulo: 'Instalar en el móvil',
      icono: '📱',
      contenido: (
        <>
          <p>
            La aplicación se puede instalar como una app normal en el móvil,
            sin pasar por tiendas.
          </p>

          <h4>Android</h4>
          <ol>
            <li>Abre la URL de la app en Chrome.</li>
            <li>
              Aparecerá un aviso de "Añadir a pantalla de inicio" o, si no,
              pulsa el menú <strong>⋮</strong>.
            </li>
            <li>
              Pulsa <strong>Instalar aplicación</strong> o{' '}
              <strong>Añadir a pantalla de inicio</strong>.
            </li>
          </ol>

          <h4>iOS (iPhone / iPad)</h4>
          <ol>
            <li>Abre la URL de la app en Safari.</li>
            <li>
              Pulsa el botón <strong>Compartir</strong> (cuadrado con flecha
              hacia arriba).
            </li>
            <li>
              Busca <strong>Añadir a pantalla de inicio</strong>.
            </li>
          </ol>

          <h4>Ordenador (Chrome / Edge)</h4>
          <ol>
            <li>Abre la URL de la app.</li>
            <li>
              En la barra de direcciones aparece un icono de "instalar".
            </li>
            <li>Pulsa ese icono.</li>
          </ol>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'faq',
      titulo: 'Preguntas frecuentes',
      icono: '❓',
      contenido: (
        <>
          <h4>¿Puedo borrar un turno equivocado?</h4>
          <p>
            Sí. Abre el día, pulsa el botón <strong>Borrar</strong> del turno
            y confirma.
          </p>

          <h4>¿Y si me equivoco con las vacaciones de un año?</h4>
          <p>
            Abre el modal del día, borra el turno de tipo VAC y vuelve a
            crearlo con el año de origen correcto.
          </p>

          <h4>¿Por qué mi saldo de DAS no sube?</h4>
          <p>
            Repasa: los festivos y las noches generan DAS solo si el turno es
            de categoría Trabajo (M, T, N). Los tipos Libre, Vacaciones, DAS,
            Asuntos propios, Teoría y Prácticas <strong>no</strong> generan
            DAS.
          </p>

          <h4>¿Caducan los DAS?</h4>
          <p>
            Los servicios (festivos o noches) que no completan un ciclo
            caducan a los 12 meses si no vuelves a acumular del mismo tipo.
            Los DAS ya generados, en principio no.
          </p>

          <h4>¿Puedo tener dos usuarios en el mismo dispositivo?</h4>
          <p>
            Sí, cerrando sesión y entrando con el otro. Cada uno ve solo sus
            turnos.
          </p>

          <h4>¿Qué pasa si cambio de destino?</h4>
          <p>
            Añade en <strong>Ajustes → DAS remanentes</strong> los DAS que
            tenías pendientes de la unidad anterior. Se sumarán a tu saldo
            actual.
          </p>

          <h4>¿Puedo recuperar si borro algo por error?</h4>
          <p>
            No hay papelera. Si haces exportaciones periódicas a CSV, puedes
            volver a importar los datos.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'soporte',
      titulo: 'Soporte y contacto',
      icono: '📞',
      contenido: (
        <>
          <p>
            Si algo no funciona o quieres proponer una mejora, contacta con el
            administrador de la aplicación.
          </p>

          <h4>Antes de escribir</h4>
          <ul>
            <li>Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac).</li>
            <li>Asegúrate de tener conexión a internet.</li>
            <li>Cierra y vuelve a abrir la app.</li>
            <li>Comprueba que sigues con la sesión iniciada.</li>
          </ul>

          <h4>Al reportar un problema</h4>
          <p>Incluye, si puedes:</p>
          <ul>
            <li>Qué intentabas hacer.</li>
            <li>Qué pasó.</li>
            <li>Captura de pantalla, si es posible.</li>
          </ul>
        </>
      ),
    },
  ]

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Centro de ayuda</h2>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
          Toca cualquier sección para ver su contenido. También puedes usar el
          buscador de tu navegador (Ctrl+F) para encontrar algo concreto.
        </p>

        {/* Índice */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 16,
          }}
        >
          {secciones.map((s) => (
            <button
              key={s.id}
              onClick={() => setAbierta(s.id)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 20,
                border: '1px solid var(--borde)',
                cursor: 'pointer',
                background:
                  abierta === s.id ? 'var(--acento)' : 'var(--fondo-tarjeta-2)',
                color: abierta === s.id ? '#0e1116' : 'var(--texto)',
                fontWeight: 500,
              }}
            >
              {s.icono} {s.titulo}
            </button>
          ))}
        </div>
      </div>

      {/* Secciones */}
      {secciones.map((s) => {
        const estaAbierta = abierta === s.id
        return (
          <div key={s.id} className="card">
            <div
              onClick={() => alternar(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 26 }}>{s.icono}</span>
              <h3 style={{ margin: 0, flex: 1 }}>{s.titulo}</h3>
              <span
                style={{
                  fontSize: 18,
                  color: 'var(--texto-suave)',
                  transform: estaAbierta ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                ›
              </span>
            </div>

            {estaAbierta && (
              <div
                className="ayuda-contenido"
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--borde)',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {s.contenido}
              </div>
            )}
          </div>
        )
      })}

      {/* Estilos internos para el contenido de ayuda */}
      <style>{`
        .ayuda-contenido h4 {
          margin-top: 18px;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--acento);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .ayuda-contenido h4:first-child {
          margin-top: 0;
        }
        .ayuda-contenido p {
          margin-bottom: 10px;
        }
        .ayuda-contenido ul,
        .ayuda-contenido ol {
          margin-bottom: 12px;
          padding-left: 24px;
        }
        .ayuda-contenido li {
          margin-bottom: 4px;
        }
        .ayuda-contenido code {
          background: var(--fondo-tarjeta-2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
