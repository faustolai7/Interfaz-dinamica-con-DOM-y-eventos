class Producto {
    constructor(nombre, categoria, precio, stock) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
    }

    vender(cantidad) {
        if (cantidad <= 0 || cantidad > this.stock) {
            return 0;
        }
        this.stock = this.stock - cantidad;
        return this.precio * cantidad;
    }
}


const formulario = document.querySelector("#form-producto");
const inputNombre = document.getElementById("nombre");
const selectCategoria = document.getElementById("categoria");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");
const inputIndice = document.getElementById("indice");
const botonAgregarFinal = document.getElementById("btn-agregar-final");
const botonAgregarPrincipio = document.getElementById("btn-agregar-principio");
const botonReemplazar = document.getElementById("btn-reemplazar");
const botonRetirar = document.getElementById("btn-retirar");

const inputPedidoNombre = document.getElementById("pedido-nombre");
const inputPedidoCantidad = document.getElementById("pedido-cantidad");
const botonPedir = document.getElementById("btn-pedir");
const listaNombres = document.getElementById("lista-nombres");

const inputBusqueda = document.getElementById("busqueda");
const inputPrecioMaximo = document.getElementById("precio-maximo");
const botonFiltrar = document.getElementById("btn-filtrar");
const botonMostrarTodos = document.getElementById("btn-mostrar-todos");

const elementoMensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorResumen = document.getElementById("resumen");

const catalogoInicial = [
    "Razer DeathAdder V4 PRO Wirless 2.4Ghz",
    "Mouse Logitech G PRO X Superlight 2 Lightspeed",
    "Mouse Razer Basilisk V3 PRO HyperSpeed Ergonomic Wireless 2.4Ghz",
    "Mouse Glorious Model O 2 Wireless 2.4Ghz Bluetooth 5.2",
    "Mouse ASUS ROG Strix P713 Harpe Wireless 2.4Ghz",
    "Mouse HyperX Pulsefire Fuse Wireless 2.4Ghz Bluetooth RGB 75gr 85Hs",
    "Mouse Logitech G305 Wireless 2.4Ghz Lightspeed Hero Black 99g 250Hs"
];
const preciosIniciales = [215000, 188000, 211000, 154250, 119200, 63350, 54990];

let precioMaximoActivo = 0;


function normalizar(texto) {
    return texto.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR");
}
function escaparHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function mostrarMensaje(texto, tipo) {
    elementoMensaje.textContent = texto;
    elementoMensaje.className = `mensaje ${tipo}`;
}


function crearInventario(catalogo, precios, categoria) {
    const producto1 = new Producto(catalogo[0], categoria, precios[0], 5);
    const producto2 = new Producto(catalogo[1], categoria, precios[1], 1);
    const producto3 = new Producto(catalogo[2], categoria, precios[2], 8);
    const producto4 = new Producto(catalogo[3], categoria, precios[3], 4);
    const producto5 = new Producto(catalogo[4], categoria, precios[4], 2);
    const producto6 = new Producto(catalogo[5], categoria, precios[5], 6);
    const producto7 = new Producto(catalogo[6], categoria, precios[6], 3);

    return [producto1, producto2, producto3, producto4, producto5, producto6, producto7];
}

function obtenerProductosFiltrados(inventario) {
    const texto = normalizar(inputBusqueda.value);

    return inventario.filter((producto) => {
        const coincideNombre = normalizar(producto.nombre).includes(texto);
        const entraEnPrecio = precioMaximoActivo === 0 || producto.precio <= precioMaximoActivo;
        return coincideNombre && entraEnPrecio;
    });
}

function renderizarProductos(lista, inventario) {
    let textoContador = `Mostrando ${lista.length} de ${inventario.length} productos`;
    if (precioMaximoActivo > 0) {
        textoContador += ` (hasta ${formatearPrecio(precioMaximoActivo)})`;
    }
    contador.textContent = textoContador;

    if (lista.length === 0) {
        contenedorProductos.innerHTML = '<p class="vacio">No hay productos para mostrar.</p>';
        return;
    }

    let html = "";
    lista.forEach((producto) => {
        const posicion = inventario.indexOf(producto);
        const sinStock = producto.stock === 0;
        const claseStock = sinStock ? "stock agotado" : "stock";
        const textoStock = sinStock ? "Sin stock" : `Stock: ${producto.stock}`;

        html += `
            <article class="tarjeta">
                <span class="posicion">#${posicion}</span>
                <h3>${escaparHTML(producto.nombre)}</h3>
                <p class="categoria">${escaparHTML(producto.categoria)}</p>
                <p class="precio">${formatearPrecio(producto.precio)}</p>
                <p class="${claseStock}">${textoStock}</p>
            </article>`;
    });
    contenedorProductos.innerHTML = html;
}

function mostrarResumenInventario(inventario) {
    if (inventario.length === 0) {
        contenedorResumen.innerHTML = "<p>No hay inventario para resumir.</p>";
        return;
    }

    const valorTotal = inventario.reduce((total, producto) => total + producto.precio * producto.stock, 0);
    const unidadesTotales = inventario.reduce((total, producto) => total + producto.stock, 0);

    let aviso = '<p class="aviso-ok">Todos los productos tienen stock disponible.</p>';
    if (inventario.some((producto) => producto.stock === 0)) {
        const agotados = inventario
            .filter((producto) => producto.stock === 0)
            .map((producto) => escaparHTML(producto.nombre));
        aviso = `<p class="aviso-error">Atención, productos sin stock: ${agotados.join(", ")}</p>`;
    }

    contenedorResumen.innerHTML = `
        <p>Unidades en stock: <strong>${unidadesTotales}</strong></p>
        <p>Valor total del stock: <strong>${formatearPrecio(valorTotal)}</strong></p>
        ${aviso}`;
}

function actualizarVista(inventario) {
    renderizarProductos(obtenerProductosFiltrados(inventario), inventario);
    mostrarResumenInventario(inventario);

    listaNombres.innerHTML = inventario
        .map((producto) => `<option value="${escaparHTML(producto.nombre)}"></option>`)
        .join("");
}


function mostrarVenta(producto, cantidad) {
    const stockAntes = producto.stock;
    const total = producto.vender(cantidad);

    if (total === 0) {
        mostrarMensaje(`No se pudo vender ${cantidad} de "${producto.nombre}". Stock disponible: ${producto.stock}`, "error");
    } else {
        mostrarMensaje(`Venta: ${cantidad} x "${producto.nombre}" = ${formatearPrecio(total)}. Stock: ${stockAntes} -> ${producto.stock}`, "ok");
    }
}

function existeProducto(inventario, nombre) {
    return inventario.some((producto) => normalizar(producto.nombre) === normalizar(nombre));
}

function crearProductoDesdeFormulario() {
    const nombre = inputNombre.value.trim();
    const precio = Number(inputPrecio.value);
    const stock = Number(inputStock.value);

    if (!nombre) {
        mostrarMensaje("Ingresá el nombre del producto.", "error");
        return null;
    }
    if (inputPrecio.value === "" || isNaN(precio) || precio <= 0) {
        mostrarMensaje("El precio debe ser un número mayor a 0.", "error");
        return null;
    }
    if (inputStock.value === "" || !Number.isInteger(stock) || stock < 0) {
        mostrarMensaje("El stock debe ser un número entero de 0 o más.", "error");
        return null;
    }

    return new Producto(nombre, selectCategoria.value, precio, stock);
}

function crearProductoNuevo(inventario) {
    const nuevo = crearProductoDesdeFormulario();
    if (!nuevo) {
        return null;
    }
    if (existeProducto(inventario, nuevo.nombre)) {
        mostrarMensaje(`"${nuevo.nombre}" ya está en el catálogo, no se agrega de nuevo.`, "error");
        return null;
    }
    return nuevo;
}

function retirarUltimoProducto(inventario) {
    if (inventario.length === 0) {
        mostrarMensaje("El catálogo está vacío, no hay nada para eliminar.", "error");
        return;
    }
    const eliminado = inventario.pop();
    actualizarVista(inventario);
    mostrarMensaje(`Se ha eliminado el elemento: ${eliminado.nombre}`, "ok");
}

function agregarAlFinal(inventario) {
    const nuevo = crearProductoNuevo(inventario);
    if (!nuevo) {
        return;
    }
    inventario.push(nuevo);
    formulario.reset();
    actualizarVista(inventario);
    mostrarMensaje(`Se agregó al final: ${nuevo.nombre}`, "ok");
}

function agregarAlPrincipio(inventario) {
    const nuevo = crearProductoNuevo(inventario);
    if (!nuevo) {
        return;
    }
    inventario.unshift(nuevo);
    formulario.reset();
    actualizarVista(inventario);
    mostrarMensaje(`Se agregó al principio: ${nuevo.nombre}`, "ok");
}

function atenderPedido(inventario) {
    const pedido = inputPedidoNombre.value.trim();
    if (!pedido) {
        mostrarMensaje("El cliente no pidió ningún producto.", "error");
        return;
    }

    const pedidoNormalizado = normalizar(pedido);
    const producto = inventario.find((item) => normalizar(item.nombre) === pedidoNormalizado);

    if (!producto) {
        mostrarMensaje(`Lo sentimos, "${pedido}" no está disponible.`, "error");
        return;
    }

    const cantidad = Number(inputPedidoCantidad.value);
    if (inputPedidoCantidad.value === "" || !Number.isInteger(cantidad)) {
        mostrarMensaje("Cantidad inválida, no se registró la venta.", "error");
        return;
    }

    mostrarVenta(producto, cantidad);
    actualizarVista(inventario);
}

function reemplazarProducto(inventario) {
    if (inventario.length === 0) {
        mostrarMensaje("El catálogo está vacío, no hay nada para reemplazar.", "error");
        return;
    }

    const indice = Number(inputIndice.value);
    if (inputIndice.value === "" || !Number.isInteger(indice) || indice < 0 || indice >= inventario.length) {
        mostrarMensaje(`Índice inválido: ingresá un número de 0 a ${inventario.length - 1}.`, "error");
        return;
    }

    const nuevo = crearProductoDesdeFormulario();
    if (!nuevo) {
        return;
    }

    const reemplazado = inventario.splice(indice, 1, nuevo);
    formulario.reset();
    actualizarVista(inventario);
    mostrarMensaje(`Posición ${indice}: se reemplazó "${reemplazado[0].nombre}" por "${nuevo.nombre}"`, "ok");
}

function filtrarPorPrecioMaximo(inventario) {
    const precioMaximo = Number(inputPrecioMaximo.value);

    if (inputPrecioMaximo.value === "" || isNaN(precioMaximo) || precioMaximo <= 0) {
        mostrarMensaje("Precio inválido, no se aplicó ningún filtro.", "error");
        return;
    }

    precioMaximoActivo = precioMaximo;
    actualizarVista(inventario);
    mostrarMensaje(`Filtro aplicado: productos de hasta ${formatearPrecio(precioMaximo)}.`, "ok");
}

function mostrarTodos(inventario) {
    precioMaximoActivo = 0;
    inputPrecioMaximo.value = "";
    inputBusqueda.value = "";
    actualizarVista(inventario);
    mostrarMensaje("Mostrando todo el catálogo.", "ok");
}


function iniciarSimulador() {
    if (!contenedorProductos) {
        return;
    }

    const categoria = "Mouses";
    const inventario = crearInventario(catalogoInicial, preciosIniciales, categoria);

    botonAgregarFinal.addEventListener("click", () => agregarAlFinal(inventario));
    botonAgregarPrincipio.addEventListener("click", () => agregarAlPrincipio(inventario));
    botonReemplazar.addEventListener("click", () => reemplazarProducto(inventario));
    botonRetirar.addEventListener("click", () => retirarUltimoProducto(inventario));
    botonPedir.addEventListener("click", () => atenderPedido(inventario));
    botonFiltrar.addEventListener("click", () => filtrarPorPrecioMaximo(inventario));
    botonMostrarTodos.addEventListener("click", () => mostrarTodos(inventario));

    inputBusqueda.addEventListener("input", () => actualizarVista(inventario));

    formulario.addEventListener("submit", (evento) => evento.preventDefault());

    actualizarVista(inventario);
    mostrarMensaje(`Simulador de stock: ${categoria}. Se cargaron ${inventario.length} productos.`, "ok");
}

iniciarSimulador();
