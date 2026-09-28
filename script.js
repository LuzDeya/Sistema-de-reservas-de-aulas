// ================================================
//  RESERVA AULA - script.js
// ================================================

// ===== 1. Datos en memoria =====
const AULAS = ["A-101", "A-102", "B-201", "B-202", "LAB-01"];
const HORARIOS = [
  "07:00 - 09:00",
  "09:00 - 11:00",
  "11:00 - 13:00",
  "14:00 - 16:00",
  "16:00 - 18:00"
];

// Arreglo de objetos donde se guardan las reservas
// Cada reserva: { id, aula, fecha, horario, actividad }
let reservas = [];
let siguienteId = 1;

// ===== 2. Selección de elementos del DOM =====
const formulario = document.querySelector("#form-reserva");
const selectAula = document.querySelector("#aula");
const inputFecha = document.querySelector("#fecha");
const selectHorario = document.querySelector("#horario");
const inputActividad = document.querySelector("#actividad");
const mensaje = document.querySelector("#mensaje");
const cuerpoTabla = document.querySelector("#tabla-reservas");
const textoSinReservas = document.querySelector("#sin-reservas");
const contador = document.querySelector("#contador");
const cuerpoDisponibilidad = document.querySelector("#disponibilidad");
const fechaDisponibilidad = document.querySelector("#fecha-disponibilidad");
const resumenDisponibilidad = document.querySelector("#resumen-disponibilidad");

// ===== 3. Utilidades =====

// Devuelve la fecha de hoy en formato AAAA-MM-DD (el que usa <input type="date">)
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Convierte "2026-09-27" en "27/09/2026"
function formatearFecha(fecha) {
  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Crea <option> dentro de un <select> a partir de un arreglo
function llenarSelect(select, opciones) {
  opciones.forEach(function (texto) {
    const opcion = document.createElement("option");
    opcion.setAttribute("value", texto);
    opcion.textContent = texto;
    select.appendChild(opcion);
  });
}

// ===== 4. Lectura y validación =====

// Lee los valores actuales del formulario
function obtenerDatos() {
  return {
    aula: selectAula.value,
    fecha: inputFecha.value,
    horario: selectHorario.value,
    actividad: inputActividad.value.trim()
  };
}

// Regla 1: todos los campos obligatorios completos
function camposCompletos(datos) {
  return datos.aula !== "" && datos.fecha !== "" &&
         datos.horario !== "" && datos.actividad !== "";
}

// Busca en el arreglo una reserva con la misma aula, fecha y horario
function buscarReserva(aula, fecha, horario) {
  return reservas.find(function (r) {
    return r.aula === aula && r.fecha === fecha && r.horario === horario;
  });
}

// ===== 5. Mensajes en la interfaz =====
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.classList.remove("oculto", "error", "exito");
  mensaje.classList.add(tipo); // "error" o "exito"
}

// ===== 6. Registrar reserva =====
function registrarReserva(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página

  const datos = obtenerDatos();

  // Validación: campos obligatorios
  if (!camposCompletos(datos)) {
    mostrarMensaje("Completa todos los campos obligatorios.", "error");
    return;
  }

  // Validación: reserva duplicada (regla de negocio)
  if (buscarReserva(datos.aula, datos.fecha, datos.horario)) {
    mostrarMensaje(
      `El aula ${datos.aula} ya está reservada el ${formatearFecha(datos.fecha)} de ${datos.horario}.`,
      "error"
    );
    return;
  }

  // Guardar en el arreglo (estructura de datos)
  datos.id = siguienteId;
  siguienteId++;
  reservas.push(datos);

  // Actualizar la interfaz
  cuerpoTabla.appendChild(crearFila(datos)); // nueva fila inmediata
  actualizarEstadoTabla();
  renderizarDisponibilidad();
  mostrarMensaje("Reserva registrada correctamente.", "exito");

  inputActividad.value = "";
}

// ===== 7. Crear una fila de la tabla =====
function crearFila(reserva) {
  const fila = document.createElement("tr");
  fila.setAttribute("data-id", reserva.id);

  const valores = [
    reserva.aula,
    formatearFecha(reserva.fecha),
    reserva.horario,
    reserva.actividad
  ];

  valores.forEach(function (valor) {
    const celda = document.createElement("td");
    celda.textContent = valor; // textContent evita inyectar HTML
    fila.appendChild(celda);
  });

  // Celda con el botón Eliminar
  const celdaAccion = document.createElement("td");
  const botonEliminar = document.createElement("button");
  botonEliminar.textContent = "Eliminar";
  botonEliminar.classList.add("btn-eliminar");
  botonEliminar.addEventListener("click", function () {
    eliminarReserva(reserva.id, fila);
  });

  celdaAccion.appendChild(botonEliminar);
  fila.appendChild(celdaAccion);

  return fila;
}

// ===== 8. Eliminar reserva =====
function eliminarReserva(id, fila) {
  // Quitar del arreglo
  reservas = reservas.filter(function (r) {
    return r.id !== id;
  });

  // Quitar del DOM
  fila.remove();

  actualizarEstadoTabla();
  renderizarDisponibilidad(); // el aula vuelve a quedar libre
  mostrarMensaje("Reserva eliminada. El aula quedó libre nuevamente.", "exito");
}

// ===== 9. Contador y mensaje de tabla vacía =====
function actualizarEstadoTabla() {
  contador.textContent = reservas.length;
  // Si hay reservas, oculta el texto "No hay reservas"
  textoSinReservas.classList.toggle("oculto", reservas.length > 0);
}

// ===== 10. Indicadores de disponibilidad =====
// Dibuja una grilla Aula x Horario para la fecha elegida en el formulario
function renderizarDisponibilidad() {
  const fecha = inputFecha.value;
  fechaDisponibilidad.textContent = fecha ? "— " + formatearFecha(fecha) : "";

  cuerpoDisponibilidad.textContent = ""; // limpia la grilla anterior

  // Fila de cabecera con los horarios
  const cabecera = document.createElement("tr");
  const esquina = document.createElement("th");
  esquina.textContent = "Aula";
  cabecera.appendChild(esquina);

  HORARIOS.forEach(function (horario) {
    const th = document.createElement("th");
    th.textContent = horario;
    cabecera.appendChild(th);
  });
  cuerpoDisponibilidad.appendChild(cabecera);

  let libres = 0;

  // Una fila por aula
  AULAS.forEach(function (aula) {
    const fila = document.createElement("tr");
    const nombreAula = document.createElement("th");
    nombreAula.textContent = aula;
    fila.appendChild(nombreAula);

    HORARIOS.forEach(function (horario) {
      const celda = document.createElement("td");
      const reserva = buscarReserva(aula, fecha, horario);

      if (reserva) {
        celda.classList.add("ocupada");
        celda.textContent = "Ocupada";
        celda.setAttribute("title", reserva.actividad);
        // Al hacer clic en una celda ocupada, avisa quién la reservó
        celda.addEventListener("click", function () {
          mostrarMensaje(
            `${aula} (${horario}) ya está ocupada: "${reserva.actividad}".`,
            "error"
          );
        });
      } else {
        libres++;
        celda.classList.add("libre");
        celda.textContent = "Libre";
        celda.setAttribute("title", "Clic para reservar");
        // Al hacer clic, rellena el formulario con esa aula y horario
        celda.addEventListener("click", function () {
          selectAula.value = aula;
          selectHorario.value = horario;

          // Marca visualmente la celda elegida (solo una a la vez)
          const anterior = cuerpoDisponibilidad.querySelector(".seleccionada");
          if (anterior) {
            anterior.classList.remove("seleccionada");
          }
          celda.classList.add("seleccionada");

          mostrarMensaje(
            `Seleccionaste ${aula} de ${horario}. Escribe la actividad y pulsa Reservar.`,
            "exito"
          );
          inputActividad.focus();
        });
      }
      fila.appendChild(celda);
    });

    cuerpoDisponibilidad.appendChild(fila);
  });

  const total = AULAS.length * HORARIOS.length;
  resumenDisponibilidad.textContent = `${libres} de ${total} espacios libres`;
}

// ===== 11. Inicialización y eventos =====
function iniciar() {
  llenarSelect(selectAula, AULAS);
  llenarSelect(selectHorario, HORARIOS);
  inputFecha.value = fechaDeHoy();
  inputFecha.setAttribute("min", fechaDeHoy()); // no permite fechas pasadas
  actualizarEstadoTabla();
  renderizarDisponibilidad();
}

formulario.addEventListener("submit", registrarReserva);
inputFecha.addEventListener("change", renderizarDisponibilidad);

iniciar();
