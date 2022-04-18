let currentPokemon, pokemonDataSelection = [], pokemons, favourites;
let limit = 9;
let apiURL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;

function init() {
    renderPaginationLinks(); /* TODO ausblenden wenn kein prev/next existiert */
    loadPokemons();
}

function renderPaginationLinks(){
    paginationLinksTemplate(getById('pagination-links'));
}

// load Pokemons from API
async function loadPokemons(url = apiURL) {
    //check url & include offset, limit ..,?offset=20&limit=20 {count, next (url), previous (url), results [x items] }
    let response = await fetch(url);
    pokemons = await response.json(); // [results, next, previous], results: --> [{"name", "url"}]
    await savePokemonData();
    renderCards();
}

function getPokemonDetails(name) {
    // find pokemon by name from current pokemonDataSelection array
    let pokemon = pokemonDataSelection.find(x => x.name == name);
    return pokemon;
}

// load single pokemon
async function loadTargetPokemon(src) {
    let response = await fetch(src);
    currentPokemon = await response.json();
}

// get Pokemon by name or ID
async function searchPokemon(name = 'pikachu') { //pikachu for testing purposes
    // if in pokemonDataSelection array load from there, else:
    let url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    await loadTargetPokemon(url);
}

// extract and save data from API JSON in a new JSON to get to relevant info easier ABER vl nicht sehr performant alle daten nochmal extra "abzuspeichern" ?
async function savePokemonData() {
    // EV am Anfang leeren damit jede Seite erneuert?
    pokemonDataSelection = [];

    for (let i = 0; i < pokemons.results.length; i++) {
        let pokemonURL = pokemons.results[i].url;
        await loadTargetPokemon(pokemonURL); // loadTargetPokemon sets global currentPokemon
        extractData();
    }
}

// extract relavant data of currently loaded pokemon and add to pokemonDataSelection array
function extractData() {
    let id = currentPokemon['id'];
    let name = currentPokemon['name'];
    let imgSrc = currentPokemon['sprites']['other']['dream_world']['front_default'];
    if (!imgSrc) {
        // alternative image source as backup
        imgSrc = currentPokemon['sprites']['other']['home']['front_shiny'];
    }
    let types = [];
    for (let i = 0; i < currentPokemon.types.length; i++) {
        types.push(currentPokemon.types[i].type.name);
    }
    // further data:
    // stats --> currentPokemon.stats (Arr) --> stats[i].base_stat, stats[i].effort ?, stats[i].stat.name (stats[i].stat.url) 
    // save Poke Object: // {name, data: {id, imgSrc, types}
    pokemonDataSelection.push({ name, id, imgSrc, types });
}

function renderCards() {
    let container = getById('cards-container');
    container.innerHTML = '';
    //load pokemon infos
    for (let i = 0; i < pokemonDataSelection.length; i++) {
        let pokemon = pokemonDataSelection[i];
        cardTemplate(container, pokemon);
    }
}

function renderDetailCard(name) { 
    let overlay = getById('modal-overlay');
    // 1. load/get pokemon info: set currentPokemon (OR get Info from pokemonDataSelection?)
    let pokemon = getPokemonDetails(name);
    // 2. render card
    detailCardTemplate(overlay, pokemon);
}

async function loadNext() {
    if (pokemons.next){
        await loadPokemons(pokemons.next);
    }
}

async function loadPrevious() {
    if( pokemons.previous ){
        await loadPokemons(pokemons.previous);
    }
}

function toggleOverlay() {
    // getById('modal-overlay').classList.toggle('d-none');
    toggle(getById('modal-overlay')); // zu viel des guten ???
    getElements('body').classList.toggle('no-scroll');
}

// generic functions:

function toggle(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle('d-none');
    }
}

function getById(element) {
    return document.getElementById(element);
}

// el needs class-prefix/identifyer passed with it
function getElements(el){
    return document.querySelector(el);
}

