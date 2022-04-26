function cardTemplate(element, pokemon) {
    element.innerHTML += /*html*/ `
        <div class="pokemon-card" onclick="toggleOverlay();renderDetailCard('${pokemon.name}')"  style="border: 1px solid var(--col-${pokemon.types[0]})"
        onmouseover="this.style.backgroundColor='var(--col-${pokemon.types[0]})'" onmouseout="this.style.backgroundColor='rgb(255, 255, 255, 0.5)'">
        <!-- <img class="fav-icon d-none" src="img/favorite-4.ico" alt="favourite pokemon icon"> -->
        <img id="fav-${pokemon.name}" class="add-icon" onclick="event.stopPropagation(); handleFavourites('${pokemon.name}')" src="img/add.ico" alt="add pokemon icon">
            <!-- <div class="col-overlay" style="background-color: var(--col-${pokemon.types[0]})"></div> -->
            <!-- show id for TESTING purposes -->
            <span class="poke-id">${pokemon.id}</span>
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <img class="card-img" src="${pokemon.imgSrc}" alt="Pokemon image">
            <h3>Type:</h3>
                <div id="types">
                    <!-- get and render all types -->
                    ${renderTypes(pokemon.types)}
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
                        ${renderTypes(pokemon.types)}
                    </div>
                </div>
                <!-- <span class="shadow"> -->
                <div class="img-box">
                    <img id="poke-img" src="${pokemon.imgSrc}" alt="pokemon image">
                </div>
                <!-- </span> -->
            </div>
            <div class="poke-info">
                <!-- card 1: general info -->
                <div class="tab-links">
                    <a href="#" onclick="openTab(0)" class="tablink active-tablink">General</a>
                    <a href="#" onclick="openTab(1)" class="tablink">Stats</a>
                </div>
                <div class="tab">
                    <ul>
                        <li><span>Height:</span><span>${pokemon.height} m</span></li>
                        <li><span>Weight:</span><span>${pokemon.weight} kg</span></li>
                        <hr>
                        <li><span>Abilities:</span>
                            <span class="capitalize">
                                ${renderAbilities(pokemon.abilities)}
                            </span>
                        </li>
                        <hr>
                        <!-- <li class="center-x">Moves:</li> -->
                        <li><span>Moves:</span><span>${pokemon.moves.length}</span></li>
                    </ul>
                    <div class="moves">
                        <!-- TODO allMoves template -->
                        <!-- render moves -->
                        ${renderMoves(pokemon.moves)}
                    </div>
                </div>
                <!-- card 2: stats -->
                <div class="tab d-none">
                    <ul class="capitalize">
                        ${renderStats(pokemon.stats)}
                    </ul>
                </div>
             </div>
        </div>
    `;
}

function renderMoves(moves) {
    let str = '';
    for (let i = 0; i < moves.length; i++) {
        str += /*html*/ `<span class="move">${moves[i]}</span> `;
    }
    return str;
}

function renderAbilities(abilities){
    str = '';
    for (let i = 0; i < abilities.length; i++){
        str+=/*html*/`<span class="ability">${abilities[i]}</span><br>`;
    }
    return str;
}

function renderTypes(types) {
    let str = '';
        for (let i = 0; i < types.length; i++) {
            str += /*html*/ ` 
            <span style="background-color: var(--col-${types[i]})">${types[i]}</span> 
        `;
        };
    return str;
}

function renderStats(stats) {
    let str = ``, total = 0, average;
    for (let i = 0; i < stats.length; i++) {
        str += /*html*/ `
        <li><span class="">${stats[i].name}:</span><span>${stats[i].value} / 255</span></li> `;
        total += stats[i].value;
    }
    average = Math.round((total / stats.length)*100)/100;
    str += /*html*/`
        <hr>
        <li><span>Total:</span><span><b>${total}</b></span></li>
        <li><span>Average:</span><span><b>${average}</b> / 255</span></li>
        `;
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