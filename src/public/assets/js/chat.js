console.log("cargo chat.js");
const socket = io();
let inputMensaje = document.getElementById("mensaje");
let divMensajes = document.getElementById("mensajes");

Swal.fire({
  title: "¿quien eres?",
  input: "text",
  text: "Ingresa tu nombre",
  inputValidator: (value) => {
    return !value && "Debe ingresar un nombre...!!!";
  },
  allowOutsideClick: false,
}).then((resultado) => {
  console.log(resultado);
  socket.emit("id", resultado.value);
  inputMensaje.focus();
  document.title = resultado.value;

  socket.on("nuevoUsuario", (nombre) => {
    Swal.fire({
      text: `${nombre} se ha conectado...!!!`,
      toast: true,
      position: "top-right",
    });
  });

  /* socket.on("hello",mensajes=>{
        mensajes.messages.forEach(mensaje=>{
            let parrafo=document.createElement('p')
            parrafo.innerHTML=`<strong>${mensaje.emisor}</strong> dice: <i>${mensaje.mensaje}</i>`
            parrafo.classList.add('mensaje')
            let br=document.createElement('br')
            divMensajes.append(parrafo, br)
            divMensajes.scrollTop=divMensajes.scrollHeight   
        })
    }) */

  socket.on("hello", async (mensajesPromise) => {
    try {
      const mensajes = await mensajesPromise;

      mensajes.forEach((documento) => {
        documento.messages.forEach((mensaje) => {
          let parrafo = document.createElement("p");
          parrafo.innerHTML = `<strong>${mensaje.user}</strong> dice: <i>${mensaje.message}</i>`;
          parrafo.classList.add("mensaje");
          let br = document.createElement("br");
          divMensajes.append(parrafo, br);
          divMensajes.scrollTop = divMensajes.scrollHeight;
        });
      });
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  });

  socket.on("usuarioDesconectado", (nombre) => {
    Swal.fire({
      text: `${nombre} se ha desconectado...!!!`,
      toast: true,
      position: "top-right",
    });
  });

  socket.on("nuevoMensaje", (datos) => {
    let parrafo = document.createElement("p");
    parrafo.innerHTML = `<strong>${datos.emisor}</strong> dice: <i>${datos.mensaje}</i>`;
    parrafo.classList.add("mensaje");
    let br = document.createElement("br");
    divMensajes.append(parrafo, br);
    divMensajes.scrollTop = divMensajes.scrollHeight;
  });

  inputMensaje.addEventListener("keyup", (e) => {
    if (e.code === "Enter" && e.target.value.trim().length > 0) {
      socket.emit("mensaje", {
        emisor: resultado.value,
        mensaje: e.target.value.trim(),
      });
      e.target.value = "";
    }
  });
});
