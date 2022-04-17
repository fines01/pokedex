function cardTemplate(element, pokemon) {
    element.innerHTML += /*html*/ `
        <div class="pokemon-card" onclick="toggleOverlay();renderDetailCard('${pokemon.name}')">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <!-- show id for TESTING purposes -->
            <span>${pokemon.id}</span>
            <img class="card-img" src="${pokemon.imgSrc}" alt="Pokemon image">
            <h3>Type:</h3>
                <div id="types">
                    <!-- get and render all types -->
                    ${typesTemplate(pokemon.types)}
                    <!-- <p>${pokemon.types[0]}</p> -->
                </div>
        </div>
    `;
}

function detailCardTemplate(element, pokemon) {

    element.innerHTML = /*html*/ `
        <div id="pokedex" class="" onclick="event.stopPropagation()">
            <div id="poke-title">
                <h1 id="pokemon-name">${pokemon.name}</h1>
                <h3>Type:</h3>
                <!-- render Types  -->
                <div id="types">
                     <!-- <p>${pokemon.types[0]}</p> -->
                    ${typesTemplate(pokemon.types)}
                </div>
                <!-- <span class="shadow"> -->
                <img id="poke-img" src="${pokemon.imgSrc}" alt="pokemon image">
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