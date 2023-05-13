//Setup
const preciosList = document.getElementById("preciosList");
const resumenList = document.getElementById("resumenList");
const totalCompra = document.getElementById("totalCompra");

class Piedra {
    constructor(nombre = "default", precio = 23) {
        this.nombre = nombre;
        this.precio = precio;
    }
}

const piedrasMal = [
    new Piedra("normal", 500), new Piedra("rara", 999), new Piedra("muy cara", 2000000), new Piedra("desagradable", 10000), new Piedra("cool", 232323), new Piedra("precio invalido", -23)
];

const piedras = piedrasMal.filter(p => p.precio >= 0 && p.precio <= 1000000);

const colores = ["crimson", "royalblue", "blueviolet", "deeppink", "limegreen"];

piedras.forEach((el, i) => {
    let nuevo = document.createElement("li");
    const color = colores[Math.round(Math.random() * (colores.length - 1))];
    const bg = i % 2 == 0 ? "white-bg" : "lightgray-bg";
    nuevo.classList.add(bg);
    nuevo.innerHTML = `Piedra <span class="${color}">${el.nombre}</span><br>$${el.precio}`;
    preciosList.appendChild(nuevo);
});

function validarPrompt(msgPrimerIntento, msgError, condicion) {
    let primerIntento = true;
    let res;
    while (!condicion(res)) {
        if (primerIntento) {
            res = prompt(msgPrimerIntento);
            primerIntento = false;
        } else {
            res = prompt(msgError);
        }
    }
    return res;
}

//Runtime
//Puede llegar a pasar que las alerts corran antes de que se vean los precios. Con eventos dejaria de usar alerts y no me tendria que preocupar.
window.onload = () => {
    let total = 0;
    let wOg = true;
    piedras.forEach(el => {
        const msgP = `Cuantas "piedra ${el.nombre}" quiere comprar?`;
        const msgE = `Ingreso un valor invalido. Cuantas "piedra ${el.nombre}" quiere comprar?`;
        const cant = parseInt(validarPrompt(msgP, msgE, (cnt) => (parseInt(cnt) >= 0)));
        total += cant * el.precio;
        if (cant > 0) {
            let nuevo = document.createElement("li");
            const color = colores[Math.round(Math.random() * (colores.length - 1))];
            const bg = wOg ? "white-bg" : "lightgray-bg";
            wOg = !wOg;
            nuevo.classList.add(bg);
            nuevo.innerHTML = `Piedra <span class="${color}">${el.nombre}</span><br>${cant} por $${el.precio * cant}`;
            resumenList.appendChild(nuevo);
        }
        totalCompra.innerHTML = `$${total}`;
    });
}