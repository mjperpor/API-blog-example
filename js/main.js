// Variables
// - Listado
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const loadingDOM = document.querySelector("#loading");
const templatePreviaArticulo = document.querySelector("#previa-articulo").content.firstElementChild;
const marcadorDOM = document.querySelector("#marcador");
// - Single
const singleDOM = document.querySelector("#single-blog");
const singleTitleDOM = document.querySelector("#single-blog__title");
const singleContentDOM = document.querySelector("#single-blog__content");
const templateComment = document.querySelector("#comment-item").content.firstElementChild;
const singleCommentsListadoDOM = document.querySelector("#single-blog__comments");
botonVolverDOM = document.querySelector("#boton-volver");
// - Data
let articulos = [];
let comments = [];

// - 2 estados: "listado articulos" y "single articulo"
let estado = "listado articulos";
// - Paginado
let paginaActual = 1;
const numeroArticulosPorPagina = 6;
let observerCuadrado = null;
// - Api
const urlAPI = "https://jsonplaceholder.typicode.com/";

// Funciones
function renderizar() {
    // Comprobar esado
    switch(estado) {
        case "listado articulos":
            singleDOM.classList.add("d-none");
            listadoArticulosDOM.classList.remove("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "single articulo":
            singleDOM.classList.remove("d-none");
            listadoArticulosDOM.classList.add("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "loading":
            loadingDOM.classList.remove("d-none");
    }
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
        // Añadimos la id al boton de Ver
        const botonVer = miArticulo.querySelector("#boton-ver");
        botonVer.dataset.id = articulo.id;
        botonVer.addEventListener("click", function() {
            obtenerSingleArticulo(articulo.id);
        });
        // Insertamos en el listado
        listadoArticulosDOM.appendChild(miArticulo);
    });
    // Lista de comentarios
    singleCommentsListadoDOM.innerHTML = "";
    // Lista de comentarios
    comments.forEach(function(comment) {
        // Clonamos plantilla
        const miComentario = templateComment.cloneNode(true);
        // Modificamos datos
        const name = miComentario.querySelector("#comment__name");
        name.textContent = comment.name;
        const email = miComentario.querySelector("#comment__email");
        email.textContent = comment.email;
        const body = miComentario.querySelector("#comment__body");
        body.textContent = comment.body;
        // Insertamos en el listado de comentarios
        singleCommentsListadoDOM.appendChild(miComentario);
    })
}

async function obtenerArticulos() {
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
    // Redibujamos
    renderizar();
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

function cambiarEstado(nuevoEstado) {
    estado = nuevoEstado;
    renderizar();
}

async function obtenerSingleArticulo(id) {
    // Mostrar loading
    cambiarEstado("loading");
    const miFetch = await fetch(`${urlAPI}posts/${id}`);
    // Transforma la respuesta. En este caso lo convierte a JSON
    const json = await miFetch.json();
    // Modificamos el HTML de single
    singleTitleDOM.textContent = json.title;
    singleContentDOM.textContent = json.body;
    // Obtener comentarios del articulo
    const miFetchComments = await fetch(`${urlAPI}posts/${id}/comments`);
    // Transforma la respuesta. En este caso lo convierte a JSON
    comments = await miFetchComments.json();
    // Al terminar de cargar los datos, quita loading
    cambiarEstado("single articulo");
}

// Eventos
botonVolverDOM.addEventListener("click", function() {
    cambiarEstado("listado articulos");
});

// Inicio
obtenerArticulos();
vigilanteDeMarcador();