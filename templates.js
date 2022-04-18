function cardTemplate(element, pokemon) {
    element.innerHTML += /*html*/ `
        <div class="pokemon-card" onclick="toggleOverlay();renderDetailCard('${pokemon.name}')"  style="border: 1px solid var(--col-${pokemon.types[0]})"
        onmouseover="this.style.backgroundColor='var(--col-${pokemon.types[0]})'" onmouseout="this.style.backgroundColor='rgb(255, 255, 255, 0.5)'">
            <!-- <div class="col-overlay" style="background-color: var(--col-${pokemon.types[0]})"></div> -->
            <!-- show id for TESTING purposes -->
            <span class="poke-id">${pokemon.id}</span>
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <img class="card-img" src="${pokemon.imgSrc}" alt="Pokemon image">
            <h3>Type:</h3>
                <div id="types">
                    <!-- get and render all types -->
                    ${typesTemplate(pokemon.types)}
                </div>
        </div>
    `;
}

function detailCardTemplate(element, pokemon) {

    element.innerHTML = /*html*/ `
        <div id="pokedex" class="" onclick="event.stopPropagation()">
            <div id="poke-title" style="background-color: var(--col-${pokemon.types[0]})">
                <div class="column">
                    <h1 id="pokemon-name">${pokemon.name}</h1>
                    <h3>Type:</h3>
                    <!-- render Types  -->
                    <div id="types">
                        <!-- <p>${pokemon.types[0]}</p> -->
                        ${typesTemplate(pokemon.types)}
                    </div>
                </div>
                <!-- <span class="shadow"> -->
                <div class="img-box">
                    <img id="poke-img" src="${pokemon.imgSrc}" alt="pokemon image">
                </div>
                <!-- </span> -->
            </div>
            <div class="poke-info">
                <!-- menu-select mit 3 reitern zu pokemon - details: 1.: abilities? 2.: stats 3.:  -->
             </div>
        </div>
    `;
}

function typesTemplate(types) {
    let str = '';
    for (let i = 0; i < types.length; i++) {
        str += /*html*/ ` 
            <span style="background-color: var(--col-${types[i]})">${types[i]}</span> 
        `;
    };
    return str;
}

function paginationLinksTemplate(element) {
    element.innerHTML = /*html*/ `
        <button onclick="loadPrevious()">
            &#10096; prev. ${limit}
        </button> |
        <button onclick="lazyLoadAll()">
            SHOW ALL
        </button> |
        <button onclick="loadNext()">
            next ${limit} &#10095;
        </button>
    `;
}

function backBtnTemplate(element) {
    element.innerHTML = /*html*/ ` <button onclick="goBack()">Go Back</button>`;
}