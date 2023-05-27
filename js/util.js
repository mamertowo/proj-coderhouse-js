function firstUp(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function nuevaPiedra(nombre, precio, stock, categorias, foto) {
    const p = document.createElement("li");
    p.classList.add("piedra");
    p.innerHTML = `
    <div class="piedraFoto">
        <img src="${foto}" alt="Piedra ${nombre}">
    </div>
    <div class="piedraDatos">
        <h2>Piedra ${nombre}</h2>
        <p>$${precio}</p>
        <p>Stock: ${stock}</p>
        <ul class="piedraCats"></ul>
    </div>
    <div class="piedraCarrito">
        <button class="agCartBtn">Agregar al carrito</button>
        <button class="minBtn">-</button>
        <input  class="amCart" type="number" value="1" min="1" max="${stock}">
        <button class="plsBtn">+</button>
    </div>`;

    const cats = p.getElementsByClassName("piedraCats")[0];
    categorias.forEach(cat => {
        const a = document.createElement("li");
        a.textContent = cat;
        cats.appendChild(a);
    });
    return p;
}

function nuevaCompra(nombre, cantidad, precio) {
    const c = document.createElement("li");
    c.innerHTML = `
    <h4>Piedra ${nombre}</h4>
    <p>Cantidad: ${cantidad}</p>
    <p>Precio: ${precio}</p>`;
    return c;
}

function algunaEn(arr, ...elems) {
    let res = false;
    elems.forEach(e => {
        if (arr.indexOf(e) >= 0) {
            res = true;
        }
    });
    return res;
}

function strEnAlguna(str, ...elems) {
    let res = false;
    elems.forEach(e => {
        if (e.toLowerCase().includes(str)) {
            res = true;
        }
    });
    return res;
}

function contenida(arr, ...contenedora) {
    let res = true;
    arr.forEach(e => {
        if (contenedora.indexOf(e) < 0) {
            res = false;
        }
    });
    return res;
}