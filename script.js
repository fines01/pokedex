let currentPokemon, pokemonDataSelection = [],
    pokemons, currentUrl, favourites = [];
let endpoint = 'pokemon';
let limit = 18;
let apiURL = `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`;
let loading = false;

function init() {
    loadLocalData();
    loadPokemons();
}

// load Pokemons from API
async function loadPokemons(url = apiURL) {
    if (!loading) {
        loading = true;
        renderLoader(); // mb also disable pagination-links while loading (instead or add let loading )?
        let response = await fetch(url);
        pokemons = await response.json(); // [results, next, previous], results: --> [{"name", "url"}]
        await savePokemonData(); // await until promise returns its result
        renderCards();
        currentUrl = url;
    }
}

function renderLoader() {
    console.log('catching pokemons...');
    getById('cards-container').innerHTML = '<div id="loader"><img src="img/pokeball2.png" alt=""></div>';
}

// load single pokemon
async function loadTargetPokemon(src) {
    let response = await fetch(src);
    currentPokemon = await response.json();
}

// extract relavant data of currently loaded pokemon and add to pokemonDataSelection array
function extractData() {
    // prevent doubles
    let alreadyExtracted = pokemonDataSelection.filter(poke => poke.id == currentPokemon['id']);

    if (alreadyExtracted.length < 1) {

        let [id,name,height,weight] = extractBaseData('id','name','height','weight');
        let [types, abilities, moves] = extractBaseDataArrays(['types', 'type'], ['abilities', 'ability'], ['moves', 'move']);
        
        // convert height & weight units
        height = Math.round(height * 10) / 100; // height from dm in m, rounded to max 2 dec
        weight = Math.round(weight * 10) / 100; // weight from hg in kg, rounded to max 2 dec
        
        let imgSrc = extractImg();
        let stats = extractStats();

        // save Pokemon object:
        pokemonDataSelection.push(
            {
                name, id, imgSrc, height, weight, types, abilities, moves, stats
            });
    }
}

function extractBaseData(...labels){
    let dataArr = [];
    for (let i = 0; i < labels.length; i++) {
        dataArr.push(currentPokemon[labels[i]])
    }
    return dataArr;
}

//// OLD and lame function:
// function extractBaseDataArray(arrayLabel, label) {
//     let dataArr = []
//     for (let i = 0; i < currentPokemon[arrayLabel].length; i++) {
//         dataArr.push(currentPokemon[arrayLabel][i][label]['name']);
//     }
//     return dataArr;
// }

//// NEW and shiny with array deconstruction
function extractBaseDataArrays(...labelsArr){
    let dataArr=[]
    for (let i = 0; i < labelsArr.length; i++) {
        let arrName = labelsArr[i][0];
        let dataName = labelsArr[i][1];

        let singleDataArr=[];
        for (let i = 0; i < currentPokemon[arrName].length; i++) {
            singleDataArr.push(currentPokemon[arrName][i][dataName]['name']);
        }
        dataArr.push(singleDataArr);
    }
    return dataArr;
}

function extractImg() {
    let pokemonImg = currentPokemon['sprites']['other']['dream_world']['front_default'];
    if (!pokemonImg) {
        // alternative image source as backup
        pokemonImg = currentPokemon['sprites']['other']['home']['front_shiny'];
    }
    if (!pokemonImg) {
        // second back-up
        pokemonImg = currentPokemon['sprites']['front_default']; // for pokemons > 1000 still no img found sometimes (see: all pikachu*) TODO: placeholder-img or d-none img
    }
    // TODO if (!pokemonImg: hide img or replacement img)
    return pokemonImg;
}

function extractStats(){
    let stats = [];
    for (let i = 0; i < currentPokemon.stats.length; i++) {
        stats.push({
            'name': currentPokemon.stats[i].stat.name,
            'value': currentPokemon.stats[i].base_stat
        });
    }
    return stats;
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

async function loadNext() {
    if (pokemons.next) {
        let nextURL = pokemons.next.split('limit=')[0] + 'limit=' + limit; //set new limit in case user changed it
        await loadPokemons(nextURL);
    }
}

async function loadPrevious() {
    if (pokemons.previous) {
        let previousURL = pokemons.previous.split('limit=')[0] + 'limit=' + limit;
        await loadPokemons(previousURL);
    }
}

// get Pokemon by name or ID (gn id until 898?)
async function searchPokemon(nameOrId) {
    let url = `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;
    await loadTargetPokemon(url);
}

async function handleTypesSearch() {
    /*in progress*/ }

async function handlePokemonSearch() {
    let searchArr = [];
    let searchStr;
    // search string bearbeiten
    searchStr = (getClasses('search-string')[0].value != '') ? getClasses('search-string')[0].value : getClasses('search-string')[1].value;
    searchArr = editSearchString(searchStr);
    renderLoader();
    pokemonDataSelection = [];
    // for all string-fragments: search for all matching pokemon names or IDs
    await getSearchResults(searchArr);
    // render results
    renderSearchResults();
}

function editSearchString(str) {
    let searchStr = str.toLowerCase();
    return searchStr.split(' '); // returns array with search strings
}

async function getSearchResults(searchArr) { // function still too big ?
    let namesArr = [];
    // for all string-fragments: search for all matching pokemon names or IDs
    for (let i = 0; i < searchArr.length; i++) {
        // case: id 
        if (!isNaN(searchArr[i] * 1)) {
            await searchPokemon(searchArr[i]);
            extractData();
        // case: name/string
        } else {
            // namesArr.push( await ...( filterPokemonNames(searchArr[i]) ) ); // fkt? nope
            let foundNames = await filterPokemonNames(searchArr[i]);
            namesArr.push(...foundNames); //spread-operator (because I need to push content of array 1 into array 2 at the same level)
            // for all found pokemon names:
            for (let i = 0; i < namesArr.length; i++) {
                let el = namesArr[i].name;
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

async function filterPokemonTypes(str) {/*in progress*/}

function handleFavourites(pokemon) { // oops AE: favOrites !! change for consistency
    let icon = getById('fav-' + pokemon);
    // toggle icon fav view
    icon.classList.toggle('add-fav');
    // add to or remove from favourites-collection
    let index = favourites.indexOf(pokemon);
    if (index == -1) {
        favourites.push(pokemon);
    } else {
        favourites.splice(index, 1);
    }
    saveDataLocally();
}

function saveDataLocally(){
    let favouritesStr = JSON.stringify(favourites);
    localStorage.setItem('favouritePokemons', favouritesStr);
}

function loadLocalData(){
    let favouritesStr = localStorage.getItem('favouritePokemons');
    if(favouritesStr){
        favourites = JSON.parse(favouritesStr);
    }
}

async function getFavourites() {
    renderLoader();
    pokemonDataSelection = [];
    for (let i = 0; i < favourites.length; i++) {
        await searchPokemon(favourites[i]);
        extractData();
    }
    renderSearchResults();
    // hide(getById('fav-link'));
    hide(...(getClasses('fav-link')));
}

function renderSearchResults() {
    // td.: error - case
    renderCards();
    renderBackBtn();
    // show(getById('back-link'));
    show(...(getClasses('back-link')));
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
}

function renderCards() {
    let container = getById('cards-container');
    let searchField = getById('search-text').value = ''; //TODO via getClasses für alle isearch-inputs

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

function toggleOverlay() {
    toggleElement(getById('modal-overlay')); // zu viel des guten ???
    getElement('body').classList.toggle('no-scroll');
}

function toggleMenu(){
    //toggle mobile menu
}

function goBack() {
    loadPokemons(currentUrl);
    show(...(getClasses('fav-link')));
    hide(...(getClasses('back-link')));
}

function openTab(i) {
    let tabs = getClasses('tab');
    let links = getClasses('tablink');

    for (let index = 0; index < tabs.length; index++) {
        hide(tabs[index]);
        links[index].classList.remove('active-tablink');
    }

    show(tabs[i]);
    links[i].classList.add('active-tablink');
}

function setLimit() {
    limit = getById('limit').value;
    renderPaginationLinks();
}

// generic functions:

function toggleElement(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle('d-none');
    }
}

function hide(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('d-none');
    }
}

function show(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('d-none');
    }
}

function getById(element) {
    return document.getElementById(element);
}

// returns html collection
function getClasses(el) {
    return document.getElementsByClassName(el);
}

function getElement(el) {
    return document.querySelector(el);
}
