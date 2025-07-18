async function obtenerRespuestaGemini(mensajeUsuario) {
  try {
    const contextoColombiano = `
Responde como un asistente legal en Colombia. Si es una emergencia, recomienda:
- Llamar al **123**
- Contactar la **Línea Púrpura: 018000112137**
- Escribir al **WhatsApp 3007551846**

Responde con claridad, empatía y utilidad. Usa un lenguaje accesible. No uses asteriscos para negritas, responde en HTML.`;

    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: contextoColombiano + "\n\n" + mensajeUsuario
      }),
    });

    const data = await response.json();
    console.log("Respuesta recibida de Gemini:", data);

    if (data.response) {
      return data.response;
    } else {
      return "Lo siento, no tengo una respuesta por ahora.";
    }

  } catch (error) {
    console.error("Error al llamar a Gemini API:", error);
    return "Hubo un error. Intenta de nuevo más tarde.";
  }
}

async function enviarMensaje() {
  const inputBox = document.getElementById("input");
  const mensaje = inputBox.value.trim();
  if (mensaje === "") return;

  agregarMensaje("user", mensaje);
  inputBox.value = "";
  agregarMensaje("aurora", "Aurora está pensando...");

  const respuesta = await obtenerRespuestaGemini(mensaje);

  if (detectarSituacionGrave(mensaje)) {
    const sugerencia = `
      <br><br><strong>👉 Parece que estás atravesando una situación delicada.</strong><br>
      ¿Quieres reportar este caso de forma más detallada?<br>
      <a href="formulario.html" target="_blank" style="color: #7E57C2; font-weight: bold;">Ir al formulario</a>
    `;
    reemplazarUltimoMensaje("aurora", respuesta + sugerencia);
  } else {
    reemplazarUltimoMensaje("aurora", respuesta);
  }
}

function agregarMensaje(origen, texto) {
  const chatContainer = document.getElementById("chat-container");
  const burbuja = document.createElement("div");
  burbuja.classList.add("burbuja", origen);
  burbuja.innerHTML = formatearMarkdownComoHTML(texto);
  chatContainer.appendChild(burbuja);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function reemplazarUltimoMensaje(origen, nuevoTexto) {
  const chatContainer = document.getElementById("chat-container");
  const burbujas = chatContainer.querySelectorAll(`.burbuja.${origen}`);
  if (burbujas.length > 0) {
    const ultima = burbujas[burbujas.length - 1];
    ultima.innerHTML = formatearMarkdownComoHTML(nuevoTexto);
  }
}

function detectarSituacionGrave(texto) {
  const palabrasClave = [
    "me golpearon", "me pegaron", "me amenazaron", "me agredieron",
    "abusaron", "me violaron", "violencia", "ayuda", "denunciar", "abuso",
    "acoso", "me lastimaron", "auxilio", "socorro", "me está siguiendo",
    "tengo miedo", "me siento en peligro", "me maltratan"
  ];
  const textoMinuscula = texto.toLowerCase();
  return palabrasClave.some(palabra => textoMinuscula.includes(palabra));
}

function formatearMarkdownComoHTML(texto) {
  return texto
    // Convertir enlaces tipo [Texto](enlace)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="formulario-link">$1</a>')
    
    // Limitar saltos de línea excesivos (más de 2)
    .replace(/\n{3,}/g, '\n\n')

    // Convertir dobles saltos a <br><br>, simples a <br>
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')

    // Eliminar <br> innecesarios antes o después de etiquetas HTML
    .replace(/<br>(\s*<)/g, '$1')
    .replace(/>(\s*)<br>/g, '>$1');
}
