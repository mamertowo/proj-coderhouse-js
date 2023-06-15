//Config barra de busqueda ---------------------------------------------------------------
const searchForm = document.getElementById("searchForm");
let busqueda = "";

searchForm.addEventListener('submit', (event) => {
    busqueda = event.target.elements["searchBar"].value.toLowerCase();
    updatePiedras();
    event.preventDefault();
});

//Config carrito -------------------------------------------------------------------------
if (!localStorage.getItem("carrito")) {
    localStorage.setItem("carrito", JSON.stringify([]));
}
const carrito = JSON.parse(localStorage.getItem("carrito"));
const carritoContainer = document.getElementById("carritoContainer");
const carritoOpen = document.getElementById("carritoOpen");
carritoOpen.addEventListener('click', event => {
    carritoContainer.classList.remove("hide");
});
const carritoClose = document.getElementById("carritoClose");
carritoClose.addEventListener('click', event => {
    carritoContainer.classList.add("hide");
});
const vaciarBtn = document.getElementById("vaciarBtn");
const comprarBtn = document.getElementById("comprarBtn");

function Compra(nombre, cantidad, precio, id) {
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
    this.id = id;
}

function updateCarrito() {
    const carritoElem = document.getElementById("carritoElem");
    const totalCarrito = document.getElementById("totalCarrito");
    carritoElem.innerHTML = "";
    carrito.forEach(c => {
        const {nombre, cantidad, precio} = c;
        const nuevoLi = nuevaCompra(nombre, cantidad, precio);
        carritoElem.appendChild(nuevoLi);
    });
    totalCarrito.innerText = carrito.reduce((total, i) => total + i.precio, 0);
}

function vaciarCarrito() {
    carrito.splice(0, carrito.length);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    updateCarrito();
}

vaciarBtn.addEventListener('click', vaciarCarrito);

comprarBtn.addEventListener('click', event => {
    Swal.fire({
        title: 'Confirmar compra?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            procesarCompra(carrito).then((res) => {
                if (res) {
                    vaciarCarrito();
                    updatePiedras();
                    Swal.fire('Gracias por su compra!', '', 'success');
                } else {
                    vaciarCarrito();
                    Swal.fire('Hubo un error al realizar su compra', 'Vuelva a intentarlo mas tarde', 'error');
                }
            });
        }
    });
});

//Como la funcion es async, funciona como promise
async function procesarCompra(cart) {
    for (const c of cart) {
        const st = await fetch(`https://648a2b645fa58521cab0f453.mockapi.io/pcjs/piedras/${c.id}`)
        .then(resp => resp.json()).then(data => data.stock);
        if (c.cantidad > st) {
            return false;
        }
    }
    //Lo hago en dos loops separados para que solo se realice la compra entera y no un pedazo
    for (const c of cart) {
        const st = await fetch(`https://648a2b645fa58521cab0f453.mockapi.io/pcjs/piedras/${c.id}`)
        .then(resp => resp.json()).then(data => data.stock);
        await fetch(`https://648a2b645fa58521cab0f453.mockapi.io/pcjs/piedras/${c.id}`, {
            method: 'PUT',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
                stock: st - c.cantidad
            })
        });
    }
    return true;
}

//Config categorias ----------------------------------------------------------------------
const categoriasNoActivas = document.getElementById("categoriasNoActivas");
const categoriasActivas = document.getElementById("categoriasActivas");
let categoriasOff = [];
const categoriasOn = [];

async function startCats() {
    categoriasOff = await fetch("https://648a2b645fa58521cab0f453.mockapi.io/pcjs/categorias").then((resp) => resp.json()).then((data) => {
        const res = [];
        data.forEach(el => {
            res.push(firstUp(el.categoria));
        });
        return res;
    });
    categoriasOff.sort();   //Por defecto orden alfabetico asique no me ocupo.
    categoriasOff.forEach((cat) => {
        const nuevoLi = document.createElement("li");
        nuevoLi.textContent = cat;

        nuevoLi.addEventListener('click', (event) => {
            toggleCat(event, categoriasOn, categoriasOff, categoriasActivas, categoriasNoActivas);
            updatePiedras();
        });

        categoriasNoActivas.appendChild(nuevoLi);
    });
}

//Se ocupa de activar o desactivar la categoria clickeada de forma que siempre queden ordenadas alfabeticamente.
function toggleCat(ev, listaAgregar, listaBorrar, seccionAgregar, seccionBorrar) {
    const nuevaCat = ev.target.textContent;
    listaAgregar.push(nuevaCat);
    listaAgregar.sort();
    listaBorrar.splice(listaBorrar.indexOf(nuevaCat), 1);
    const nuevoLi = document.createElement("li");
    nuevoLi.textContent = nuevaCat;

    nuevoLi.addEventListener('click', (event) => {
        //Por algun motivo no le gusta cuando llamo una funcion con "event" justo despues de la coma.
        //Aca invierto las listas porque voy a querer hacer la accion opuesta la proxima vez.
        toggleCat(event, listaBorrar, listaAgregar, seccionBorrar, seccionAgregar);
        updatePiedras();
    });

    if (listaAgregar.length === 1) {
        seccionAgregar.appendChild(nuevoLi);
    } else {
        let i = 0;
        while (i < seccionAgregar.children.length) {
            //Como las dos listas estan ordenadas, cuando haya una diferencia significa que tengo que meter el nuevo elem atras.
            if (seccionAgregar.children[i].textContent != listaAgregar[i]) {
                seccionAgregar.children[i].before(nuevoLi);
                i = seccionAgregar.children.length + 1;
            }
            i++;
        }
        if (i === seccionAgregar.children.length) {
            seccionAgregar.appendChild(nuevoLi);
        }
    }
    ev.target.remove();
}

//Config display de piedras a vender ------------------------------------------------------------------
const displayPiedras = document.getElementById("displayPiedras");
let listaPiedras = [];

function cumpleBusqueda(nombre, categorias) {
    const nom = `Piedra ${nombre}`.toLowerCase();
    if (busqueda === "" || nom.includes(busqueda) || strEnAlguna(busqueda, ...categorias)) {
        return true;
    } else {
        return false;
    }
}

//Aca no me voy a ocupar de que todo este ordenado alfabeticamente.
async function updatePiedras() {
    listaPiedras = await fetch("https://648a2b645fa58521cab0f453.mockapi.io/pcjs/piedras").then((resp) => resp.json());
    //Arreglo las mayus de las categorias.
    //Lo hago adentro de updatePiedras() para que se actualicen los stocks justo despues de una compra.
    listaPiedras.forEach(p => {
        p.categorias = p.categorias.map(c => firstUp(c));
    });
    displayPiedras.innerHTML = "";
    listaPiedras.forEach(piedra => {
        const {nombre, precio, stock, categorias, img, id} = piedra;
        //Podria filtrar la lista de piedras primero en vez de usar este if pero me gusta mas esta solucion.
        if ((categoriasOn.length === 0 || contenida(categoriasOn, ...categorias)) && cumpleBusqueda(nombre, categorias) && stock > 0) {
            p = nuevaPiedra(nombre, precio, stock, categorias, img);
            const cant = p.getElementsByClassName("amCart")[0];
            const pls = p.getElementsByClassName("plsBtn")[0];
            const mns = p.getElementsByClassName("minBtn")[0];
            const agregarBtn = p.getElementsByClassName("agCartBtn")[0];
            pls.onclick = () => {cant.value < stock && cant.value++}
            mns.onclick = () => {cant.value > 1 && cant.value--}
            cant.addEventListener('input', event => {
                const val = event.target.value;
                console.log(val);
                if (val == "" || parseInt(val) < 1 || parseInt(val) > stock) {
                    event.target.value = 1;
                }
            });
            agregarBtn.addEventListener('click', event => {
                //Sorprendente que esto funcione sin tener que hacer ninguna pirueta rara
                carrito.push(new Compra(nombre, parseInt(cant.value), precio * parseInt(cant.value), id));
                localStorage.setItem("carrito", JSON.stringify(carrito));
                updateCarrito();
                Toastify({
                    text: "Item agregado",
                    duration: 2000,
                    close: true,
                    offset: {
                        y: '2em'
                    }
                }).showToast();
            });
            displayPiedras.appendChild(p);
        }
    });
}

//Runtime -------------------------------------------------------------------------------------------
startCats();
updatePiedras();
updateCarrito();