const abrirBtn = document.getElementById("abrir");
const nuevoBtn = document.getElementById("nuevo");
const guardarBtn = document.getElementById("guardar");
const entrada = document.getElementById("myTextarea");

function limpiar(){
input2.setValue("");
}

nuevoBtn.addEventListener("click", function(){
    limpiar();
});

// Función para guardar el contenido del editor en un archivo
function guardarArchivo() {
    const content = input2.getValue(); // Obtener el contenido del editor
    const blob = new Blob([content], { type: "text/plain" }); // Crear un blob con el contenido
    const url = URL.createObjectURL(blob); // Crear una URL para el blob
    const a = document.createElement("a"); // Crear un elemento <a>
    a.href = url; // Establecer la URL del archivo
    a.download = "archivo.txt"; // Establecer el nombre del archivo
    a.click(); // Simular un clic en el elemento <a>
    URL.revokeObjectURL(url); // Liberar la URL del archivo
}

guardarBtn.addEventListener("click", function(){
    guardarArchivo();
});

function abrirArchivo(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
    input2.setValue(reader.result); // Establece el contenido del archivo en el editor
    };
    reader.readAsText(file);
}

abrirBtn.addEventListener("click", function() {
    // Lógica para el botón "Abrir"
    console.log("Haz clic en el botón 'Abrir'");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt"; // Establecer el tipo de archivo permitido, por ejemplo, .txt
    input.onchange = abrirArchivo; // Llama a la función abrirArchivo cuando se selecciona un archivo
    input.click();
  });