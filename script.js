let currentPokemon, pokemonDataSelection = [], pokemons, currentUrl, favourites;
let endpoint = 'pokemon';
let limit = 18;
let apiURL = `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`;
let loading = false;

// function init() {
//     loadPokemons();
// }

// load Pokemons from API
async function loadPokemons(url = apiURL) {
    if (!loading) {
        loading = true;
        let response = await fetch(url);
        pokemons = await response.json(); // [results, next, previous], results: --> [{"name", "url"}]
        await savePokemonData();
        renderCards();
        currentUrl = url; //not another global, meh
    }    
}

// load single pokemon
async function loadTargetPokemon(src) {
    let response = await fetch(src);
    currentPokemon = await response.json();
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
    if( !imgSrc ){
        // second back-up
        imgSrc= currentPokemon['sprites']['front_default']; // for pokemons > 1000 still no img found sometimes (see: all pikachu*)
    }
    // if (!imgSrc: hide img)
    let types = [];
    for (let i = 0; i < currentPokemon.types.length; i++) {
        types.push(currentPokemon.types[i].type.name);
    }
    // further data: stats 
    // save Poke Object:
    pokemonDataSelection.push({ name, id, imgSrc, types });
}

// extract and tmp save data from API
async function savePokemonData() {
    // refresh
    pokemonDataSelection = [];

    for (let i = 0; i < pokemons.results.length; i++) {
        let pokemonURL = pokemons.results[i].url;
        await loadTargetPokemon(pokemonURL); // loadTargetPokemon sets currentPokemon
        extractData();
    }
    // ready to load next batch:
    loading = false;
}

function getPokemonDetails(name) {
    // find pokemon by name from current pokemonDataSelection array
    let pokemon = pokemonDataSelection.find(x => x.name == name);
    return pokemon;
}

async function loadNext() { // TODO/ achtung BUG: wenn zB 2x geklickt lädt es pokemons doppelt !!!
    if (pokemons.next) {
        await loadPokemons(pokemons.next);
    }
}

async function loadPrevious() {
    if (pokemons.previous) {
        await loadPokemons(pokemons.previous);
    }
}

// get Pokemon by name or ID
async function searchPokemon(nameOrId) { 
    let url = `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;
    await loadTargetPokemon(url);
}

async function handleTypesSearch() { /*in progress*/ }

async function handlePokemonSearch(){
    let searchArr = [], searchStr;

    // search string bearbeiten
    searchStr = getById('search-text').value;
    searchArr = editSearchString(searchStr);

    // refresh:
    pokemonDataSelection = [];

    // for all string-fragments: search for all matching pokemon names or IDs
    await getSearchResults(searchArr);

    // remove doubles (TODO)

    // render results
    renderSearchResults();
}

function editSearchString(str){
    let searchStr = str.toLowerCase();
    return searchStr.split(' '); // return array with search strings
}

async function getSearchResults(searchArr) { // function still too big ?
    let namesArr = [];
    // for all string-fragments: search for all matching pokemon names or IDs
    for (let i = 0; i < searchArr.length; i++) {
        // case: id 
        if (!isNaN(searchArr[i] * 1)) {
            console.log('id: ', searchArr[i]);
            await searchPokemon(searchArr[i]);
            extractData();
        // case: name/string
        } else {
            // namesArr.push( await ...( filterPokemonNames(searchArr[i]) ) ); // fkt? nope
            let foundNames = await filterPokemonNames(searchArr[i]);
            namesArr.push(...foundNames); //spread-operator (because I need to push content of array 1 into array 2 at the same level)
            // console.log('check1: ',namesArr[0]);
            // for all found pokemon names:
            for (let i = 0; i < namesArr.length; i++) {
                let el = namesArr[i].name;
                // console.log('check2 - name: ',namesArr[i].name);
                await searchPokemon(el);
                extractData();
            }
        }
    }
}

async function filterPokemonNames(str) {
    let response = await fetch(`https://pokeapi.co/api/v2/${endpoint}?limit=5000`);
    let allPokemons = await response.json();
    let foundNames = await allPokemons.results.filter(poke => poke.name.includes(str));
    return foundNames;
}

async function filterPokemonTypes(str) { /*in progress*/ }


function renderSearchResults(){
    // td.: error - case
    renderCards();
    renderBackBtn();
}

function renderBackBtn() {
    // render btn which leads to previous pokemon-card-page.
    element = getById('pagination-links');
    backBtnTemplate(element);
}

function renderPaginationLinks() {
    paginationLinksTemplate(getById('pagination-links'));
}

function renderCards() {
    let container = getById('cards-container');
    container.innerHTML = '';
    if (pokemonDataSelection < 1){
        container.innerHTML =' <h4 style="padding-top:3rem;"> No data found </h4> ';
    }
    //load pokemon infos
    for (let i = 0; i < pokemonDataSelection.length; i++) {
        let pokemon = pokemonDataSelection[i];
        cardTemplate(container, pokemon);
    }
    renderPaginationLinks(); /* TODO ausblenden wenn kein prev/next existiert */
}

function renderDetailCard(name) { 
    let overlay = getById('modal-overlay');
    // 1. load/get pokemon info: set currentPokemon (OR get Info from pokemonDataSelection?)
    let pokemon = getPokemonDetails(name);
    // 2. render card
    detailCardTemplate(overlay, pokemon);
}

function toggleOverlay() {
    // getById('modal-overlay').classList.toggle('d-none');
    toggle(getById('modal-overlay')); // zu viel des guten ???
    getElements('body').classList.toggle('no-scroll');
}

function goBack(){
    loadPokemons(currentUrl);
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

