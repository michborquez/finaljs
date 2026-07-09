document.addEventListener("DOMContentLoaded", () => {
    inicializarApp();
});

let carrito = JSON.parse(localStorage.getItem("carrito_petals")) || [];


function inicializarApp() {
    obtenerProductos();
    actualizarContadorInterfaz();
    configurarFormulario();
    renderizarCarrito();

   
    document.getElementById("btn-finalizar-compra").addEventListener("click", finalizarCompra);
}

/* 
   7. FETCH API & VISUALIZACIÓN DE PRODUCTOS
    */
async function obtenerProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    const spinner = document.getElementById("loading");

    try {
       
        const productosMock = [
            { id: 1, title: "Ramo Primavera Elegante", price: 3500, image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=500&auto=format&fit=crop" },
            { id: 2, title: "Caja de Rosas Premium", price: 5200, image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=500&auto=format&fit=crop" },
            { id: 3, title: "Set de Regalo Suculentas", price: 2800, image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=500&auto=format&fit=crop" },
            { id: 4, title: "Orquídea Blanca en Maceta", price: 6100, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=500&auto=format&fit=crop" },
            { id: 5, title: "Ramo Silvestre Amor", price: 3200, image: "https://images.unsplash.com/photo-1587334206506-6966684e8e17?q=80&w=500&auto=format&fit=crop" },
            { id: 6, title: "Globo Aerostático Temático", price: 4500, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500&auto=format&fit=crop" }
        ];

       
        await new Promise(resolve => setTimeout(resolve, 800));
        
        spinner.classList.add("d-none");
        renderizarTarjetas(productosMock);

    } catch (error) {
        spinner.innerHTML = `<p class="text-danger fw-bold">Error al conectar con la API de productos. Inténtalo de nuevo más tarde.</p>`;
        console.error("Fallo en Fetch: ", error);
    }
}

function renderizarTarjetas(productos) {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("product-card");
        
        tarjeta.innerHTML = `
            <img src="${prod.image}" alt="Fotografía en alta nitidez de ${prod.title}" class="product-img">
            <div class="product-body">
                <h3 class="product-title">${prod.title}</h3>
                <p class="product-price">$${prod.price.toLocaleString('es-AR')}</p>
                <button class="btn btn-custom w-100 btn-add-cart" data-id="${prod.id}" data-title="${prod.title}" data-price="${prod.price}">
                    Añadir al carrito
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

    
    contenedor.querySelectorAll(".btn-add-cart").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const item = {
                id: parseInt(e.target.getAttribute("data-id")),
                title: e.target.getAttribute("data-title"),
                price: parseFloat(e.target.getAttribute("data-price")),
                cantidad: 1
            };
            agregarAlCarrito(item);
        });
    });
}

/* 
   8 y 9. LÓGICA DEL CARRITO DE COMPRAS
    */
function agregarAlCarrito(itemNuevo) {
    const existe = carrito.find(prod => prod.id === itemNuevo.id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push(itemNuevo);
    }

    sincronizarAlmacenamiento();
    alert(`¡${itemNuevo.title} añadido con éxito!`);
}

function sincronizarAlmacenamiento() {
  
    localStorage.setItem("carrito_petals", JSON.stringify(carrito));
    actualizarContadorInterfaz();
    renderizarCarrito();
}

function actualizarContadorInterfaz() {
    const contador = document.getElementById("contador-carrito");
    const totalItems = carrito.reduce((acumulado, prod) => acumulado + prod.cantidad, 0);
    contador.textContent = totalItems;
}

function renderizarCarrito() {
    const contenedorItems = document.getElementById("items-carrito");
    const txtTotal = document.getElementById("total-carrito");

    if (carrito.length === 0) {
        contenedorItems.innerHTML = `<p class="text-center text-muted py-4">Tu carrito está completamente vacío.</p>`;
        txtTotal.textContent = "$0";
        return;
    }

    let tablaHTML = `
        <table class="table align-middle">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th style="width: 120px;">Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    let sumaTotal = 0;

    carrito.forEach(prod => {
        const subtotal = prod.price * prod.cantidad;
        sumaTotal += subtotal;

        tablaHTML += `
            <tr>
                <td class="fw-bold text-success">${prod.title}</td>
                <td>$${prod.price.toLocaleString('es-AR')}</td>
                <td>
                    <input type="number" min="1" class="form-control input-cambio-cantidad" data-id="${prod.id}" value="${prod.cantidad}">
                </td>
                <td>$${subtotal.toLocaleString('es-AR')}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-eliminar-item" data-id="${prod.id}">Eliminar</button>
                </td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>`;
    contenedorItems.innerHTML = tablaHTML;
    txtTotal.textContent = `$${sumaTotal.toLocaleString('es-AR')}`;

   
    contenedorItems.querySelectorAll(".input-cambio-cantidad").forEach(input => {
        input.addEventListener("change", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            const nuevaCant = parseInt(e.target.value);
            if (nuevaCant >= 1) {
                modificarCantidad(id, nuevaCant);
            }
        });
    });

   
    contenedorItems.querySelectorAll(".btn-eliminar-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            eliminarDelCarrito(id);
        });
    });
}

function modificarCantidad(id, cantidad) {
    carrito = carrito.map(prod => {
        if (prod.id === id) {
            prod.cantidad = cantidad;
        }
        return prod;
    });
    sincronizarAlmacenamiento();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(prod => prod.id !== id);
    sincronizarAlmacenamiento();
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Agrega algún producto antes de realizar el pago.");
        return;
    }
    alert("¡Muchas gracias por tu simulación de compra! Tus datos de envío han sido procesados de forma segura.");
    carrito = [];
    sincronizarAlmacenamiento();
    
    // Cierra el modal de Bootstrap de manera programática
    const modalEl = document.getElementById('modalCarrito');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if(modalInstance) modalInstance.hide();
}

/* 
   2 & 7. VALIDACIÓN DE FORMULARIO DE CONTACTO
    */
function configurarFormulario() {
    const formulario = document.getElementById("form-contacto");
    
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        
       
        const inputNombre = document.getElementById("nombre");
        const inputEmail = document.getElementById("email");
        const inputMensaje = document.getElementById("mensaje");

        let esValido = true;

       
        if (inputNombre.value.trim() === "") {
            document.getElementById("error-nombre").classList.remove("d-none");
            esValido = false;
        } else {
            document.getElementById("error-nombre").classList.add("d-none");
        }

        
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(inputEmail.value.trim())) {
            document.getElementById("error-email").classList.remove("d-none");
            esValido = false;
        } else {
            document.getElementById("error-email").classList.add("d-none");
        }

      
        if (inputMensaje.value.trim() === "") {
            document.getElementById("error-mensaje").classList.remove("d-none");
            esValido = false;
        } else {
            document.getElementById("error-mensaje").classList.add("d-none");
        }

        
        if (esValido) {
            
            document.getElementById("form-success").classList.remove("d-none");
            formulario.reset();
            
            
            setTimeout(() => {
                document.getElementById("form-success").classList.add("d-none");
            }, 5000);
        }
    });
}
