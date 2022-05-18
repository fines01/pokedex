
function renderLoader() {
    console.log('Catching Pokémon...');
    getById('cards-container').innerHTML = '<div id="loader"><img src="img/pokeball2.png" alt=""></div>';
}

function renderSearchResults() {
    // td.: error - case
    renderCards();
    renderBackBtn();
    // show(getById('back-link'));
    show(...(getClasses('back-link')));
    show(...(getClasses('fav-link')));
}

function renderBackBtn() {
    // render btn which leads to previous pokemon-card-page.
    element = getById('pagination-links');
    element.classList.add('padding-0');
    backBtnTemplate(element);
}

function renderPaginationLinks() {
    paginationLinksTemplate(getById('pagination-links'));
    getById('pagination-links').classList.remove('padding-0');
    let nextPokemonsLink = getById('next-btn');
    let prevPokemonsLink = getById('prev-btn');
    (pokemons.next) ? nextPokemonsLink.classList.remove('disable-link'): nextPokemonsLink.classList.add('disable-link');
    (pokemons.previous) ? prevPokemonsLink.classList.remove('disable-link'): prevPokemonsLink.classList.add('disable-link');
}

function renderCards() {
    let container = getById('cards-container');
    let searchField = getById('search-text').value = ''; //TODO via getClasses für alle search-inputs
    container.innerHTML = '';
    if (pokemonDataSelection < 1) {
        container.innerHTML = ' <h4 style="padding-top:3rem;"> No data found </h4> ';
    }
    //load pokemon infos
    for (let i = 0; i < pokemonDataSelection.length; i++) {
        let pokemon = pokemonDataSelection[i];
        cardTemplate(container, pokemon);
    }
    renderPaginationLinks();
}

function renderDetailCard(name) {
    let overlay = getById('modal-overlay');
    // 1. load pokemon info
    let pokemon = getPokemonDetails(name);
    // 2. render card
    detailCardTemplate(overlay, pokemon);
}

function renderFavIcon(pokemonName) {
    if (favorites.indexOf(pokemonName) != -1) {
        return ` <img id="fav-${pokemonName}" class="add-icon add-fav" onclick="event.stopPropagation(); handleFavorites('${pokemonName}')" src="img/add.ico" alt="add pokemon icon">`;
    }
    return ` <img id="fav-${pokemonName}" class="add-icon" onclick="event.stopPropagation(); handleFavorites('${pokemonName}')" src="img/add.ico" alt="add pokemon icon"></img>`;
}

function renderMoves(moves) {
    let str = '';
    for (let i = 0; i < moves.length; i++) {
        str += /*html*/ `<span class="move">${moves[i]}</span> `;
    }
    return str;
}

function renderAbilities(abilities) {
    str = '';
    for (let i = 0; i < abilities.length; i++) {
        str += /*html*/ `<span class="ability">${abilities[i]}</span><br>`;
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
    let str = ``,
        total = 0,
        average;
    for (let i = 0; i < stats.length; i++) {
        str += statsListTemplate(stats,i);
        // /*html*/ `
        // <li><span class="">${stats[i].name}:</span><span>${stats[i].value} / 255</span></li> `;
        total += stats[i].value;
    }
    average = Math.round((total / stats.length) * 100) / 100;
    str += statsAverageTemplate(total, average);
    return str;
}

async function renderFavorites() {
    renderLoader();
    pokemonDataSelection = [];
    for (let i = 0; i < favorites.length; i++) {
        await searchPokemon(favorites[i]);
        extractData();
    }
    renderSearchResults();
    // hide(getById('fav-link'));
    hide(...(getClasses('fav-link')));
}