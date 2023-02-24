// Variables
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const templateLoading = document.querySelector("#loading").content.firstElementChild;
const templatePreviaArticulo = document.querySelector("#previa-articulo").content.firstElementChild;
const marcadorDOM = document.querySelector("#marcador");
let articulos = [];
let paginaActual = 1;
const numeroArticulosPorPagina = 6;
const urlAPI = "https://jsonplaceholder.typicode.com/";
let observerCuadrado = null;

// Funciones
function renderizar() {
    // Borramos el contenido del listado
    listadoArticulosDOM.innerHTML = "";
    // Lista de articulos
    articulos.forEach(function(articulo) {
        // Clonamos plantilla
        const miArticulo = templatePreviaArticulo.cloneNode(true);
        // Modificamos datos
        const titulo = miArticulo.querySelector("#titulo");
        titulo.textContent = articulo.title;
        const resumen = miArticulo.querySelector("#resumen");
        resumen.textContent = articulo.body;
        // Insertamos en el listado
        listadoArticulosDOM.appendChild(miArticulo);
    });
}

async function obtenerArticulos() {
    // Mostramos una distracción visual al usuario
    mostrarLoadingEnListadoArticulos();
    //Calcular los cortes
    const corteInicio = (paginaActual - 1) * numeroArticulosPorPagina;
    const corteFinal = corteInicio + numeroArticulosPorPagina;
    // Construimos los parámetros de la url
    const misParametros = new URLSearchParams();
    misParametros.set("_start", corteInicio);
    misParametros.set("_limit", numeroArticulosPorPagina);
    const miFetch = await fetch(`${urlAPI}posts?${misParametros.toString()}`);
    // Transforma la respuesta. En este caso lo convierte a JSON
    const json = await miFetch.json();
    // Cuando la API, ya no da más información, dejamos de pasar de página
    if (json.length === 0) {
        observerCuadrado.unobserve(marcadorDOM);
    }
    // Imprimo
    articulos = articulos.concat(json);
    // Quitar loading
    quitarLoadingEnListadoArticulos();
    // Redibujamos
    renderizar();
}

function mostrarLoadingEnListadoArticulos() {
    const miLoading = templateLoading.cloneNode(true);
    marcador.appendChild(miLoading);
}

function quitarLoadingEnListadoArticulos() {
    marcador.innerHTML = "";
}

function avanzarPagina() {
    paginaActual = paginaActual + 1;
    obtenerArticulos();
}

function vigilanteDeMarcador() {
    // Creamos un objeto IntersectionObserver
    observerCuadrado = new IntersectionObserver((entries) => {
        // Comprobamos todas las intesecciones. En el ejemplo solo existe una: cuadrado
        entries.forEach((entry) => {
            // Si es observable, entra
            if (entry.isIntersecting) {
                // Aumentamos la pagina actual
                avanzarPagina();
            }
        });
    });
    // Añado a mi Observable que quiero observar. En este caso el cuadrado
    observerCuadrado.observe(marcadorDOM);
}

// Eventos

// Inicio
obtenerArticulos();
vigilanteDeMarcador();