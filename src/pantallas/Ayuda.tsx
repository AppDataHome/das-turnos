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
            <strong>DAS · Distribución y Asignación de Servicios</strong> es
            una aplicación para llevar el calendario de turnos del personal y
            calcular automáticamente los <strong>días DAS</strong> generados
            por servicios festivos y nocturnos, según la normativa de la
            Guardia Civil.
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
              Ver el calendario en <strong>4 vistas</strong>: Mensual,
              Semanal, Anual y Gestión.
            </li>
            <li>
              Consultar el saldo de <strong>DAS</strong>,{' '}
              <strong>vacaciones</strong>, <strong>asuntos propios</strong> y{' '}
              <strong>turnos del mes</strong>.
            </li>
            <li>
              Generar un <strong>informe DAS imprimible</strong> por rango de
              fechas, listo para guardar como PDF.
            </li>
            <li>
              Marcar festivos del calendario (nacionales, autonómicos y
              locales).
            </li>
            <li>
              Exportar e importar tus datos en formato Excel/CSV como copia de
              seguridad.
            </li>
            <li>
              Compartir tu calendario con <strong>invitados</strong> en modo
              solo lectura (familiares, etc.) mediante un código.
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
            Entra en la aplicación y pulsa{' '}
            <strong>¿No tienes cuenta? Regístrate</strong>. Introduce tu correo
            y una contraseña (mínimo 6 caracteres). Recibirás un correo para
            confirmar la cuenta.
          </p>
          <p>
            💡 En los campos de contraseña tienes un{' '}
            <strong>icono de ojo</strong> 👁️ para mostrar u ocultar lo que
            escribes y comprobar que no te equivocas.
          </p>

          <h4>2. Rellena tu perfil</h4>
          <p>
            Ve a <strong>Ajustes → Perfil</strong> y completa tu nombre y tu
            número de empleado. También puedes subir una{' '}
            <strong>foto de perfil</strong> que aparecerá en la cabecera.
          </p>

          <h4>3. Configura tus vacaciones y asuntos propios</h4>
          <p>
            En <strong>Ajustes → Configuración</strong> indica:
          </p>
          <ul>
            <li>
              Días de <strong>vacaciones anuales</strong> (por defecto 22).
            </li>
            <li>
              Días de <strong>asuntos propios anuales</strong> (por defecto 6).
            </li>
            <li>
              Si procede, los días <strong>arrastrados</strong> del año
              anterior de cada uno.
            </li>
          </ul>

          <h4>4. Mete los festivos</h4>
          <p>
            Ve a la pestaña <strong>Festivos</strong> y pulsa{' '}
            <strong>Importar nacionales del año</strong>. Los autonómicos y
            locales los añades a mano.
          </p>

          <h4>5. Empieza a meter turnos</h4>
          <p>
            Vuelve al <strong>Calendario</strong> y pulsa cualquier día para
            abrir la ventana de edición. O usa la vista{' '}
            <strong>Gestión</strong> para meterlos en lista.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'calendario',
      titulo: 'Calendario · Vistas y tarjetas',
      icono: '📅',
      contenido: (
        <>
          <p>
            La pestaña <strong>Calendario</strong> es la pantalla principal.
            Arriba del todo verás tres tarjetas con los datos del mes, y
            debajo el calendario con 4 vistas.
          </p>

          <h4>Tarjeta "Turnos Mes"</h4>
          <ul>
            <li>
              Muestra los datos del <strong>mes que estás viendo</strong> en el
              calendario, no solo del mes actual.
            </li>
            <li>
              <strong>Realizados</strong>: turnos de trabajo (Mañana, Tarde,
              Noche) que ya has hecho ese mes.
            </li>
            <li>
              <strong>Restantes</strong>: turnos pendientes ese mes.
            </li>
            <li>El arco central muestra el porcentaje de realización.</li>
            <li>
              Si estás en el mes actual, aparece la etiqueta{' '}
              <strong>"· actual"</strong> en dorado.
            </li>
          </ul>

          <h4>Tarjeta "Vacaciones y Asuntos Propios"</h4>
          <p>Se divide en dos bloques:</p>
          <ul>
            <li>
              <strong>🏖️ Vacaciones</strong>: Total, Disfrutadas,
              Disponibles.
            </li>
            <li>
              <strong>📋 Asuntos Propios</strong>: Total, Disfrutados,
              Disponibles.
            </li>
            <li>
              Si tienes días <strong>arrastrados</strong> del año anterior,
              aparece un sub-bloque con su propio desglose.
            </li>
          </ul>

          <h4>Tarjeta "DAS"</h4>
          <ul>
            <li>
              <strong>Generados / Disfrutados / Disponibles</strong>: saldo
              actual de DAS.
            </li>
            <li>
              <strong>Festivos / Fines de semana trabajados</strong>: cuántos
              llevas, cuántos DAS han generado y cuántos residuos tienes.
            </li>
            <li>
              <strong>Noches entre semana trabajadas</strong>: lo mismo con las
              noches.
            </li>
            <li>
              <strong>Pulsable</strong>: al hacer clic se abre el{' '}
              <strong>Informe de DAS</strong> (ver más abajo).
            </li>
          </ul>

          <h4>Las 4 vistas del calendario</h4>
          <p>
            Justo debajo de las tarjetas tienes las pestañas{' '}
            <strong>Mensual</strong>, <strong>Semanal</strong>,{' '}
            <strong>Anual</strong> y <strong>⚙ Gestión</strong> (esta última
            solo para propietarios):
          </p>
          <ul>
            <li>
              <strong>Mensual</strong>: rejilla clásica del mes. Los sábados,
              domingos y festivos llevan fondo rojo suave o marcado.
            </li>
            <li>
              <strong>Semanal</strong>: columnas con el detalle de cada día.
            </li>
            <li>
              <strong>Anual</strong>: los 12 meses del año en tarjetas, con
              puntitos de colores y un resumen por mes.
            </li>
            <li>
              <strong>Gestión</strong>: listado completo de turnos con
              filtros, añadir y editar.
            </li>
          </ul>
          <p>La vista elegida se recuerda aunque cierres la app.</p>

          <h4>Panel del día seleccionado</h4>
          <p>
            Debajo del calendario aparece siempre el detalle del día
            seleccionado: cada turno con su icono, horario, departamento,
            notas y los puntitos indicadores (amarillo = festivo, azul =
            nocturno).
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
            Pulsa cualquier día en el calendario (mensual o semanal) o el
            botón <strong>Editar día</strong> en el panel inferior.
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
              <strong>Año de origen</strong>: solo aparece si el tipo es VAC.
              Sirve para elegir si son días del año actual o del anterior.
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
      id: 'gestion',
      titulo: 'Gestión de turnos (listado rápido)',
      icono: '⚙️',
      contenido: (
        <>
          <p>
            La vista <strong>⚙ Gestión</strong> es ideal para revisar, editar
            y añadir turnos en lista sin tener que ir día por día en el
            calendario.
          </p>

          <h4>Qué muestra</h4>
          <ul>
            <li>
              Listado completo de todos tus turnos,{' '}
              <strong>agrupados por mes</strong>.
            </li>
            <li>
              Cada turno con: fecha, chip del tipo, departamento y notas.
            </li>
            <li>
              <strong>Botones de acción</strong> en cada fila:
              <ul>
                <li>
                  <strong>✏️ Editar</strong>: abre el modal del día para
                  modificar ese turno en detalle.
                </li>
                <li>
                  <strong>🗑️ Borrar</strong>: elimina el turno (con
                  confirmación).
                </li>
              </ul>
            </li>
          </ul>

          <h4>Filtros de fecha</h4>
          <p>
            Pulsa el botón <strong>Filtros</strong> para mostrar los campos de
            rango. También tienes botones rápidos:
          </p>
          <ul>
            <li>Este mes</li>
            <li>Mes anterior</li>
            <li>Este año</li>
            <li>Todo</li>
          </ul>

          <h4>Añadir turno desde Gestión</h4>
          <p>
            Pulsa el botón <strong>Añadir turno</strong> arriba y se
            desplegará un mini formulario para meter un turno en una fecha
            concreta sin salir del listado.
          </p>

          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            ⚠️ Esta vista solo está disponible para propietarios. Los invitados
            no la ven.
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
            <li>
              Un día festivo del calendario (nacional, autonómico o local).
            </li>
            <li>Un sábado.</li>
            <li>Un domingo.</li>
          </ul>

          <h4>¿Qué cuenta como noche?</h4>
          <p>
            Un turno de Noche (22:00–06:00) en el que al menos 3 horas son
            nocturnas <strong>puras</strong>, es decir,{' '}
            <strong>excluyendo las que ya cuentan como festivas</strong>. Por
            eso un turno de Noche en sábado cuenta como festivo, pero no como
            noche.
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
            <strong>Ajustes → Configuración → DAS remanentes</strong> y
            añádelos. Se sumarán a tu saldo disponible.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'informe-das',
      titulo: 'Informe de DAS (imprimible)',
      icono: '📄',
      contenido: (
        <>
          <p>
            El <strong>Informe de DAS</strong> es un documento con todos los
            eventos que generan DAS en un rango de fechas, listo para imprimir
            o guardar como PDF y justificar tus DAS ante quien lo necesite.
          </p>

          <h4>Cómo abrirlo</h4>
          <p>
            Pulsa la <strong>tarjeta de DAS</strong> en el calendario (la que
            tiene el icono 📄 y el texto "Ver informe completo"). También
            aparece el icono 📄 junto al título de la tarjeta.
          </p>

          <h4>Qué contiene</h4>
          <ul>
            <li>
              <strong>Cabecera</strong>: nombre del empleado, Nº, periodo y
              fecha de emisión.
            </li>
            <li>
              <strong>Resumen</strong>: totales de festivos, noches, DAS
              generados, DAS disfrutados y saldo neto.
            </li>
            <li>
              <strong>Listado de festivos</strong> y fines de semana
              trabajados, ordenados por fecha, con la posición en el ciclo
              (1/3, 2/3, 3/3) y el icono 🎁 cuando genera un DAS.
            </li>
            <li>
              <strong>Listado de noches</strong> entre semana, con la posición
              en el ciclo (1/6 a 6/6) y el icono 🎁 cuando genera DAS.
            </li>
            <li>
              <strong>Listado de DAS disfrutados</strong> en el mismo rango.
            </li>
          </ul>

          <h4>Iconos de estado</h4>
          <ul>
            <li>
              <strong>✅ verde</strong>: evento ya pasado (realizado).
            </li>
            <li>
              <strong>⏳ gris</strong>: evento futuro (pendiente).
            </li>
          </ul>

          <h4>Filtro de fechas</h4>
          <p>
            Por defecto el informe cubre el año actual completo. Puedes
            cambiar las fechas y pulsar <strong>Generar informe</strong> para
            recalcular.
          </p>

          <h4>Imprimir o guardar como PDF</h4>
          <p>
            Pulsa el botón <strong>Imprimir / PDF</strong>. Se abrirá el
            diálogo de impresión del navegador. En el desplegable de
            impresoras elige:
          </p>
          <ul>
            <li>
              <strong>Windows</strong>: "Microsoft Print to PDF" o "Guardar
              como PDF".
            </li>
            <li>
              <strong>Mac</strong>: "Guardar como PDF".
            </li>
            <li>
              <strong>Android</strong>: "Guardar como PDF".
            </li>
            <li>
              <strong>iOS</strong>: en la vista previa, pellizca hacia fuera
              con dos dedos y aparecerá el PDF. Luego compártelo o guárdalo en
              Archivos.
            </li>
          </ul>
          <p>
            El PDF sale en blanco y negro, con la cabecera en la primera
            página, sin decoraciones de la app, perfecto para presentar.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'vacaciones',
      titulo: 'Vacaciones y asuntos propios',
      icono: '🏖️',
      contenido: (
        <>
          <p>
            La app controla dos cupos independientes de días:
          </p>
          <ul>
            <li>
              <strong>🏖️ Vacaciones</strong>: por defecto 22 días al año.
            </li>
            <li>
              <strong>📋 Asuntos Propios</strong>: por defecto 6 días al año.
            </li>
          </ul>

          <h4>Configurar los días</h4>
          <p>
            Ve a <strong>Ajustes → Configuración</strong>. Encontrarás dos
            bloques independientes (uno para vacaciones y otro para asuntos
            propios) donde ajustar:
          </p>
          <ul>
            <li>Días anuales.</li>
            <li>Días arrastrados del año anterior.</li>
            <li>Año de los días arrastrados.</li>
          </ul>

          <h4>Añadir días disfrutados</h4>
          <p>Puedes hacerlo de dos maneras:</p>
          <ul>
            <li>
              <strong>Día a día</strong>: abre el día, elige el tipo
              (Vacaciones o Asuntos Propios) y guarda.
            </li>
            <li>
              <strong>En bloque</strong>: abre cualquier día, ve a la pestaña{' '}
              <strong>Varios días</strong>, elige el rango y el tipo. Mucho
              más rápido.
            </li>
          </ul>

          <h4>Arrastre de un año a otro</h4>
          <p>
            Cuando cambias de año, es posible que te sobren días del año
            anterior. Para que no se mezclen con los del año nuevo:
          </p>
          <ol>
            <li>
              Ve a <strong>Ajustes → Configuración</strong> y anota cuántos
              días arrastras y de qué año.
            </li>
            <li>
              Cuando los disfrutes, en el formulario de "Varios días" elige el
              año de origen <strong>correcto</strong> (el año anterior).
            </li>
            <li>Así los días del año actual quedan intactos.</li>
          </ol>
          <p>
            💡 Si los días arrastrados caducan, puedes ponerlos a cero con el
            botón <strong>"Poner arrastre a 0"</strong> de cada bloque.
          </p>

          <h4>Otros tipos de ausencia</h4>
          <ul>
            <li>
              <strong>Día DAS</strong>: cuando disfrutas de un DAS generado.
              Descuenta automáticamente del saldo.
            </li>
            <li>
              <strong>Libre</strong>: día de descanso normal.
            </li>
          </ul>

          <h4>¿Cómo se descuentan?</h4>
          <p>
            Cuando marcas un día como <strong>VAC</strong> en el calendario, se
            descuenta del cupo de <strong>vacaciones</strong>. Cuando marcas un
            día como <strong>AP</strong>, se descuenta del cupo de{' '}
            <strong>asuntos propios</strong>. Cada uno en su propio contador.
          </p>
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
            Elige el año y pulsa{' '}
            <strong>Importar nacionales de XXXX</strong>. La app añade los 10
            festivos nacionales de ese año (incluido el Viernes Santo, que
            cambia cada año).
          </p>

          <h4>Añadir autonómicos y locales</h4>
          <p>
            En el formulario rellena fecha, ámbito (Autonómico o Local) y
            descripción, y pulsa <strong>Añadir</strong>.
          </p>

          <h4>Editar y borrar</h4>
          <p>
            Cada festivo tiene botones <strong>Editar</strong> y{' '}
            <strong>Borrar</strong> en la lista.
          </p>

          <h4>Selector de años</h4>
          <p>
            El desplegable de años se ajusta automáticamente: aparece el año
            actual, los 5 siguientes, el anterior y cualquier año que ya tenga
            festivos guardados. Así, si añades un festivo para 2040, 2040
            aparece solo en el selector.
          </p>

          <h4>Repercusión en el calendario</h4>
          <p>
            Los festivos se muestran con fondo rojo más marcado y el número en
            rojo. Además, los turnos de trabajo que caigan en festivos
            contarán para el cálculo de DAS.
          </p>

          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            ⚠️ Los invitados no tienen acceso a esta pestaña: es solo para
            propietarios.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'invitados',
      titulo: 'Invitados · Compartir el calendario',
      icono: '👥',
      contenido: (
        <>
          <p>
            Puedes compartir tu calendario con otras personas (familiares,
            etc.) en <strong>modo solo lectura</strong>. Verán tus turnos,
            vacaciones, asuntos propios y DAS, y podrán generar el informe,
            pero <strong>no podrán modificar nada</strong>.
          </p>
          <p>
            El invitado <strong>no necesita registrarse</strong> ni crear una
            cuenta. Solo introduce el código que tú le des en la pantalla de
            inicio.
          </p>

          {/* ─── PROPIETARIO ─── */}
          <h4>🟢 Para el propietario (tú)</h4>

          <p>
            <strong>1. Crear una invitación</strong>
          </p>
          <ol>
            <li>
              Ve a <strong>Ajustes → Invitados</strong>.
            </li>
            <li>
              En el bloque <strong>"Crear invitación"</strong>, escribe un
              nombre para identificarlo (por ejemplo "María (madre)"). Es
              opcional pero muy útil si vas a tener varios invitados.
            </li>
            <li>
              Pulsa <strong>Crear invitación</strong>.
            </li>
            <li>
              Aparecerá un código tipo <code>DAS-A7K9-P2M4</code>.
            </li>
          </ol>

          <p>
            <strong>2. Compartir el código</strong>
          </p>
          <ul>
            <li>
              Pulsa <strong>Copiar</strong> y pásaselo a la persona por
              WhatsApp, SMS, correo o como quieras.
            </li>
            <li>
              El código se puede usar <strong>una sola vez</strong>: cuando el
              invitado lo canjea, queda marcado como "Canjeado" y ya no sirve
              para otra persona.
            </li>
            <li>
              Si quieres invitar a otra persona, crea un <strong>código
              nuevo</strong>.
            </li>
          </ul>

          <p>
            <strong>3. Ver quién está vinculado</strong>
          </p>
          <ul>
            <li>
              En la misma pantalla, sección{' '}
              <strong>"Invitados vinculados"</strong>, ves a todas las
              personas que están viendo tu calendario.
            </li>
            <li>
              Cada una muestra su nombre y la fecha en la que se vinculó.
            </li>
          </ul>

          <p>
            <strong>4. Expulsar a un invitado</strong>
          </p>
          <ul>
            <li>
              Pulsa el botón <strong>Expulsar</strong> que hay junto a su
              nombre.
            </li>
            <li>
              Dejará de ver tu calendario <strong>al instante</strong>. Si
              quiere volver, necesitará un código nuevo.
            </li>
          </ul>

          <p>
            <strong>5. Gestionar los códigos</strong>
          </p>
          <ul>
            <li>
              <strong>Copiar</strong>: vuelve a copiar el código al
              portapapeles.
            </li>
            <li>
              <strong>Revocar</strong>: invalida el código sin eliminarlo. Si
              alguien lo intenta usar después, verá "Este código ha sido
              revocado".
            </li>
            <li>
              <strong>Eliminar</strong>: borra el registro del código de la
              lista (útil para limpiar códigos antiguos).
            </li>
          </ul>

          {/* ─── INVITADO ─── */}
          <h4>🔵 Para el invitado</h4>

          <p>
            <strong>1. Abrir la app</strong>
          </p>
          <ul>
            <li>
              Abre la URL de la app en cualquier navegador.
            </li>
            <li>
              No necesitas registrarte ni descargar nada.
            </li>
          </ul>

          <p>
            <strong>2. Acceder con el código</strong>
          </p>
          <ol>
            <li>
              En la pantalla de inicio, pulsa{' '}
              <strong>"Acceder con invitación"</strong>.
            </li>
            <li>
              Escribe tu nombre (opcional, para que el propietario te
              identifique).
            </li>
            <li>
              Introduce el código que te han dado.
            </li>
            <li>
              Pulsa <strong>Acceder</strong>.
            </li>
          </ol>

          <p>
            <strong>3. Uso</strong>
          </p>
          <ul>
            <li>
              Verás el calendario del propietario en modo{' '}
              <strong>solo lectura</strong>.
            </li>
            <li>
              Puedes ver las vistas <strong>Mensual, Semanal y Anual</strong>{' '}
              (no la de Gestión).
            </li>
            <li>
              Puedes consultar el <strong>Informe de DAS</strong> y exportarlo
              a PDF.
            </li>
            <li>
              En <strong>Ajustes</strong> solo ves: Perfil, Invitados,
              Preferencias y Sesión.
            </li>
          </ul>

          <p>
            <strong>4. Desvincularse</strong>
          </p>
          <ul>
            <li>
              Ve a <strong>Ajustes → Invitados</strong> y pulsa{' '}
              <strong>Desvincularme</strong>.
            </li>
            <li>
              Volverás a la pantalla de inicio. Si quieres volver a acceder,
              necesitarás un código nuevo.
            </li>
          </ul>

          <h4>Preguntas frecuentes sobre invitados</h4>

          <p>
            <strong>¿Caduca el acceso del invitado?</strong>
          </p>
          <p>
            No. El acceso dura hasta que tú lo expulsas o él se desvincula.
          </p>

          <p>
            <strong>¿Puedo tener varios invitados a la vez?</strong>
          </p>
          <p>
            Sí, tantos como quieras. Cada uno necesita su propio código (un
            código se usa solo una vez).
          </p>

          <p>
            <strong>¿El invitado ve las notas de mis turnos?</strong>
          </p>
          <p>
            Sí, ve todo lo mismo que ves tú, pero sin poder modificar nada.
          </p>

          <p>
            <strong>¿El invitado puede ver mis datos personales?</strong>
          </p>
          <p>
            Ve tu nombre y tu Nº de empleado (que aparecen en la cabecera).
            Nada más.
          </p>

          <p>
            <strong>¿Puedo ser propietario e invitado a la vez?</strong>
          </p>
          <p>
            No. Si te vinculas como invitado, dejarás de gestionar tus propios
            turnos hasta que te desvincules.
          </p>

          <p>
            <strong>He perdido el código, ¿qué hago?</strong>
          </p>
          <p>
            Ve a Ajustes → Invitados y crea uno nuevo. El anterior, si nadie lo
            ha usado, lo puedes eliminar.
          </p>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'ajustes',
      titulo: 'Ajustes (subpestañas)',
      icono: '🔧',
      contenido: (
        <>
          <p>
            La pestaña <strong>Ajustes</strong> está organizada en
            subpestañas. Las que ves dependen de tu rol:
          </p>

          <h4>Disponibles para todos</h4>
          <ul>
            <li>
              <strong>👤 Perfil</strong>: foto, nombre, Nº de empleado y
              cambio de contraseña.
            </li>
            <li>
              <strong>👥 Invitados</strong>: crear/revocar códigos (si eres
              propietario) o desvincularte (si eres invitado).
            </li>
            <li>
              <strong>🎨 Preferencias</strong>: tema (negro o verde Guardia
              Civil).
            </li>
            <li>
              <strong>🚪 Sesión</strong>: cerrar sesión.
            </li>
          </ul>

          <h4>Solo para propietarios</h4>
          <ul>
            <li>
              <strong>⚙ Configuración</strong>: vacaciones, asuntos propios,
              DAS remanentes, departamentos y tipos de turno.
            </li>
            <li>
              <strong>🗄 Datos</strong>: exportar e importar CSV.
            </li>
          </ul>

          <h4>Cerrar sesión rápido</h4>
          <ul>
            <li>
              En <strong>escritorio</strong>: botón <strong>"Salir"</strong> en
              la barra superior, al lado de tu correo.
            </li>
            <li>
              En <strong>móvil</strong>: botón redondo con el icono de puerta
              en la cabecera, junto a tu foto.
            </li>
          </ul>
        </>
      ),
    },

    // ─────────────────────────────────────────
    {
      id: 'configuracion',
      titulo: 'Departamentos y tipos de turno',
      icono: '⚙️',
      contenido: (
        <>
          <p>
            Los departamentos y tipos de turno se gestionan desde{' '}
            <strong>Ajustes → Configuración</strong>.
          </p>

          <h4>Departamentos</h4>
          <p>Cada departamento tiene:</p>
          <ul>
            <li>
              <strong>Icono</strong>: un emoji. Por ejemplo 🚔 Patrulla, 🖥️
              Oficina, 🐕 Unidad Canina.
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
            Puedes añadir, editar, activar/desactivar o borrar (borrar solo si
            no tiene turnos asociados).
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
          <pre>
{`fecha,tipo,departamento,notas,anio_origen
2026-01-15,M,Patrulla,,
2026-01-20,VAC,,Verano,2026`}
          </pre>
          <p>
            <strong>fecha</strong> en formato AAAA-MM-DD, <strong>tipo</strong>{' '}
            es el código (M, T, N, VAC, DAS, AP, L, TEO, PRA…),{' '}
            <strong>departamento</strong> es el nombre exacto del
            departamento, y <strong>anio_origen</strong> solo se usa para VAC.
          </p>

          <h4>Recomendación</h4>
          <p>
            Haz una exportación cada cierto tiempo (o antes de grandes
            cambios) y guarda el CSV. Es tu red de seguridad.
          </p>

          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            ⚠️ Esta sección solo está disponible para propietarios.
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
      id: 'consejos',
      titulo: 'Consejos y atajos',
      icono: '💡',
      contenido: (
        <>
          <h4>Ahorrar tiempo</h4>
          <ul>
            <li>
              <strong>Vacaciones o AP largos</strong>: usa el modo "Varios
              días" del modal para meter un rango completo de golpe.
            </li>
            <li>
              <strong>Revisar lo fichado</strong>: la vista Gestión es la más
              rápida para ver todos los turnos seguidos.
            </li>
            <li>
              <strong>Filtros rápidos</strong>: dentro de Gestión, pulsa
              "Este mes" o "Mes anterior" para ver solo lo que te interesa.
            </li>
            <li>
              <strong>Calendario con familiares</strong>: comparte un código
              de invitación para que puedan verlo sin tocar nada.
            </li>
          </ul>

          <h4>Sobre los iconos de departamento</h4>
          <p>
            Los emojis son ideales para distinguir departamentos de un
            vistazo. Puedes cambiar el icono cuando quieras desde Ajustes →
            Configuración → Departamentos.
          </p>

          <h4>Copias de seguridad</h4>
          <p>
            Antes de hacer cambios grandes (cambio de año, borrados masivos,
            etc.), exporta tus turnos a CSV y guárdalos en tu ordenador o en
            la nube.
          </p>

          <h4>En caso de problemas</h4>
          <p>
            Si la app va lenta, cierra y vuelve a abrirla. Si algo no se
            actualiza, pulsa Ctrl+F5 (Windows) o Cmd+Shift+R (Mac) para forzar
            la recarga sin caché.
          </p>
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
            y confirma. También puedes hacerlo desde la vista{' '}
            <strong>Gestión</strong>.
          </p>

          <h4>¿Y si me equivoco con las vacaciones o asuntos propios de un año?</h4>
          <p>
            Abre el modal del día, borra el turno de tipo VAC (o AP) y vuelve
            a crearlo con el año de origen correcto.
          </p>

          <h4>¿Por qué mi saldo de DAS no sube?</h4>
          <p>
            Repasa: los festivos y las noches generan DAS solo si el turno es
            de categoría Trabajo (M, T, N). Los tipos Libre, Vacaciones,
            Asuntos Propios, DAS, Teoría y Prácticas <strong>no</strong>{' '}
            generan DAS.
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
            Añade en <strong>Ajustes → Configuración → DAS remanentes</strong>{' '}
            los DAS que tenías pendientes de la unidad anterior. Se sumarán a
            tu saldo actual.
          </p>

          <h4>¿Cómo comparto mi calendario con mi familia?</h4>
          <p>
            Ve a <strong>Ajustes → Invitados</strong>, crea un código y
            pásaselo. Ellos abren la app, pulsan "Acceder con invitación" e
            introducen el código. Puedes expulsarlos cuando quieras. Más
            detalles en la sección <strong>👥 Invitados</strong>.
          </p>

          <h4>¿El invitado puede ver mis vacaciones o mis notas?</h4>
          <p>
            Sí, el invitado ve todo lo que tú ves (turnos, vacaciones, asuntos
            propios, DAS, notas, informes), pero no puede modificar nada.
          </p>

          <h4>¿Puedo recuperar si borro algo por error?</h4>
          <p>
            No hay papelera. Si haces exportaciones periódicas a CSV, puedes
            volver a importar los datos.
          </p>

          <h4>¿Cómo cambio la contraseña?</h4>
          <p>
            Ve a <strong>Ajustes → Perfil → Seguridad</strong>. Introduce la
            contraseña actual, la nueva dos veces, y pulsa Cambiar contraseña.
            El ojito 👁️ te ayuda a revisar lo escrito.
          </p>

          <h4>¿Por qué no veo la pestaña X?</h4>
          <p>
            En móvil, la navegación está en la barra inferior. En escritorio,
            arriba. Si eres invitado, algunas pestañas (Festivos, Gestión,
            Configuración, Datos) no están disponibles porque no las necesitas.
            Si has instalado la app hace tiempo, desinstálala y vuelve a
            instalarla para actualizar icono y menús.
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
        <h2 style={{ marginBottom: 4 }}>Centro de ayuda</h2>
        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          DAS · Distribución y Asignación de Servicios
        </p>
        <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
          Toca cualquier sección para ver su contenido. También puedes usar el
          buscador de tu navegador (Ctrl+F) para encontrar algo concreto.
        </p>

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
                  abierta === s.id
                    ? 'var(--acento)'
                    : 'var(--fondo-tarjeta-2)',
                color: abierta === s.id ? '#0b0e13' : 'var(--texto)',
                fontWeight: 500,
              }}
            >
              {s.icono} {s.titulo}
            </button>
          ))}
        </div>
      </div>

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
        .ayuda-contenido li ul {
          margin-top: 4px;
          margin-bottom: 4px;
        }
        .ayuda-contenido code {
          background: var(--fondo-tarjeta-2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .ayuda-contenido pre {
          background: var(--fondo-tarjeta-2);
          padding: 10px;
          border-radius: 6px;
          font-size: 11px;
          overflow-x: auto;
          margin-bottom: 10px;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}
