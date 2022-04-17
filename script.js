let currentPokemon, pokemonDataSelection = [], pokemons, favourites;
let limit = 9;
let apiURL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;

function init() {
    renderPaginationLinks(); /* TODO ausblenden wenn kein prev/next existiert */
    loadPokemons();
}

function renderPaginationLinks(){
    paginationLinksTemplate(getID('pagination-links'));
}

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
    console.log(pokemon);
    return pokemon;
}

// load single pokemon (target pokemon, target data oder so)
async function loadTargetPokemon(src) {
    let response = await fetch(src);
    currentPokemon = await response.json();
}

// get Pokemon by name or ID
async function searchPokemon(name = 'pikachu') { //pikachu for testing purposes
    // if in pokemonDataSelection array load from there, else:
    let url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    await loadTargetPokemon(url);
    //console.log('LOADED pokemon: ', currentPokemon);
}

// extract and save data from API JSON in a new JSON to get to relevant info easier ABER vl nicht sehr performant alle daten nochmal extra "abzuspeichern" ?
async function savePokemonData() {
    // EV am Anfang leeren damit jede Seite erneuert?
    pokemonDataSelection = [];

    for (let i = 0; i < pokemons.results.length; i++) {
        let pokemonURL = pokemons.results[i].url;
        await loadTargetPokemon(pokemonURL); // loadTargetPokemon sets currentPokemon

        // ev. refactorieren extractData() o so -->
        // define pokemon object with relavant data of currently loaded pokemon and add to pokemonDataSelection array
        let id = currentPokemon['id'];
        let name = currentPokemon['name'];
        let imgSrc = currentPokemon['sprites']['other']['dream_world']['front_default'];
        if (!imgSrc) {
            imgSrc = currentPokemon['sprites']['other']['home']['front_shiny'];
        }
        let types = [];
        for (let i = 0; i < currentPokemon.types.length; i++) {
            types.push(currentPokemon.types[i].type.name);
        }
        // further data:
        // stats --> currentPokemon.stats (Arr) --> stats[i].base_stat, stats[i].effort ?, stats[i].stat.name (stats[i].stat.url) 
        // save Poke Object:
        // {name, data: {id, imgSrc, types}
        pokemonDataSelection.push({ name, id, imgSrc, types });
    }
}

function renderCards() {
    //render poke cards
    let container = getID('cards-container');
    container.innerHTML = ''; // init() when loading
    //load current pokemon infos
    for (let i = 0; i < pokemonDataSelection.length; i++) {
        let pokemon = pokemonDataSelection[i];
        cardTemplate(container, pokemon);
    }
}

function renderDetailCard(name) { 
    let overlay = getID('modal-overlay');
    // 1. load/get pokemon info: set currentPokemon OR get Info from pokemonDataSelection 
    let pokemon = getPokemonDetails(name);
    console.log('render detail card func: ',pokemon);
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
    getID('modal-overlay').classList.toggle('d-none');
    getElements('body').classList.toggle('no-scroll');
}

// generic functions:

function getID(element) {
    return document.getElementById(element);
}

// el needs class-prefix/identifyer passed with it
function getElements(el){
    return document.querySelector(el);
}

function hide(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('d-none');
        // elements[i].style="display: none"; // alternativ, keine d-none klasse benötigt
    }
}

function show(...elements){
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('d-none');
        // elements[i].style = "display: block";
    }
}
