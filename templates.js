function cardTemplate(element, pokemon) {
    element.innerHTML += /*html*/ `
        <div class="pokemon-card" onclick="toggleOverlay();renderDetailCard('${pokemon.name}')"  style="border: 1px solid var(--col-${pokemon.types[0]})"
        onmouseover="this.style.backgroundColor='var(--col-${pokemon.types[0]})'" onmouseout="this.style.backgroundColor='rgb(255, 255, 255, 0.5)'">
        ${renderFavIcon(pokemon.name)}
            <span class="poke-id">${pokemon.id}</span>
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <img loading="lazy" class="card-img" src="${pokemon.imgSrc}" alt="Pokemon image">
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
            <span class="close-details" onclick="toggleOverlay()">X</span>
                <div class="column">
                    <h1 id="pokemon-name">${pokemon.name}</h1>
                    <h3>Type:</h3>
                    <!-- render Types  -->
                    <div id="types">
                        <!-- <p>${pokemon.types[0]}</p> -->
                        ${renderTypes(pokemon.types)}
                    </div>
                </div>
                <div class="img-box">
                    <img id="poke-img" src="${pokemon.imgSrc}" alt="pokemon image">
                </div>
            </div>
            <div class="poke-info">
                <!-- card 1: general info -->
                <div class="tab-links">
                    <span onclick="openTab(0)" class="tablink active-tablink">General</span>
                    <span onclick="openTab(1)" class="tablink">Stats</span>
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
                        <li><span>Moves:</span><span>${pokemon.moves.length}</span></li>
                    </ul>
                    <div class="moves">
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

function statsListTemplate(stats, i) {
    return /*html*/ `
        <li><span class="">${stats[i].name}:</span><span>${stats[i].value} / 255</span></li> `
}

function statsAverageTemplate(total, average) {
    return /*html*/ `
        <hr>
        <li><span>Total:</span><span><b>${total}</b></span></li>
        <li><span>Average:</span><span><b>${average}</b> / 255</span></li>
    `;
}

function paginationLinksTemplate(element) {
    element.innerHTML = /*html*/ `
    <div>
        <button onclick="loadPrevious()" id="prev-btn">
            &#10096; prev. ${limit}
        </button> |
        <!-- <button onclick="loadAll()">
            SHOW ALL
        </button> | -->
        <button onclick="loadNext()" id="next-btn">
            next ${limit} &#10095;
        </button>
    </div>
        <!-- <br> -->
        <!-- change-limit input -->
        <div class="change-limit">
            <label for="limit" onclick="toggleElement(getById('limit'))">Change limit</label>
            <input type="number" min="1" max="100" id="limit" value="${limit}" class="d-none" onchange="setLimit()" onclick="event.stopPropagation()">
        </div>
    `;
}

function backBtnTemplate(element) {
    element.innerHTML = /*html*/ ` <button onclick="goBack()" class="">Go Back</button>`;
}