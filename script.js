let currentPokemon, pokemonDataSelection = [],
    pokemons, currentUrl, favorites = [];
let endpoint = 'pokemon';
let limit = 21;
let apiURL = `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`;
let loading = false;

function init() {
    loadLocalData();
    loadPokemons();
    handleKeypresses();
}

// load Pokemons from API
async function loadPokemons(url = apiURL) {
    if (!loading) {
        loading = true;
        renderLoader(); // show loader until data is fetched
        let response = await fetch(url);
        pokemons = await response.json(); // Data-strukt: [results, next, previous], results: --> [{"name", "url"}]
        await savePokemonData(); // await until promise returns its result
        renderCards();
        currentUrl = url;
    }
}

// load single pokemon
async function loadTargetPokemon(src) {
    let response = await fetch(src);
    currentPokemon = await response.json();
}

// extract data of interest from currently loaded pokemon and add to pokemonDataSelection array
function extractData() {
    // prevent doubles
    let alreadyExtracted = pokemonDataSelection.filter(poke => poke.id == currentPokemon['id']);
    if (alreadyExtracted.length < 1) {
        let [id,name,height,weight] = extractBaseData('id','name','height','weight');
        let [types, abilities, moves] = extractBaseDataArrays(['types', 'type'], ['abilities', 'ability'], ['moves', 'move']);
        // convert height & weight units: API gives height in dm and weight in hg (see documentation)
        [height, weight] = convertHundrethsUnits(height, weight);
        let imgSrc = extractImg();
        let stats = extractStats();
        // save Pokemon object:
        pokemonDataSelection.push(
            {
                name, id, imgSrc, height, weight, types, abilities, moves, stats
            });
    }
}

// or rename: 'extract first-level data'?
function extractBaseData(...dataSet){
    let dataArr = [];
    for (let i = 0; i < dataSet.length; i++) {
        dataArr.push(currentPokemon[dataSet[i]])
    }
    return dataArr;
}

// extract first-level data arrays
function extractBaseDataArrays(...dataSetArr){
    let dataArr=[]
    for (let i = 0; i < dataSetArr.length; i++) {
        let arrName = dataSetArr[i][0];
        let dataName = dataSetArr[i][1];
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
    // TODO if (!pokemonImg: hide img or replacement img) ?
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

// converts height and weight: from dm in m || hg in kg, rounded to max 2 dec
function convertHundrethsUnits(...dataSet) {
    let dataArr = [];
    for (let i = 0; i < dataSet.length; i++) {
        let number = dataSet[i];
        number = Math.round(number * 10) / 100; // corresponds to: math.round( element / 100 * 100) / 100
        dataArr.push(number);
    }
    return (dataArr);
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
    // find pokemon by name from current pokemonDataSelection array and return full pokemon object
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

// get Pokemon by name or ID (api: id-search only works for pokemons with id > 898?)
async function searchPokemon(nameOrId) {
    let url = `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;
    await loadTargetPokemon(url);
}

async function handleTypesSearch() {
    /*in progress*/ }

async function handlePokemonSearch() {
    let searchArr = [];
    let searchStr;
    searchStr = (getClasses('search-string')[0].value != '') ? getClasses('search-string')[0].value : getClasses('search-string')[1].value;
    if (preventEmptySearch(searchStr)){
        searchArr = editSearchString(searchStr);
        renderLoader();
        pokemonDataSelection = [];
        // for all string-fragments: search for all matching pokemon names or IDs
        await getSearchResults(searchArr);
        // render results
        renderSearchResults();
    }
}

function preventEmptySearch(str){
    let zeroSpacesStr = str.replace(/ /g, ''); //regex TEST: remove ALL ' ' spaces
    if (zeroSpacesStr.length == 0){
        addBlinkAnimation(...(getClasses('search-string'))); //passes an HTML-Collection and spreads values
        clearInputValues(...(getClasses('search-string')));
        return false;
    }
    return true;
}

function editSearchString(str) {
    let searchStr = str.toLowerCase();
    let searchArr = searchStr.split(' ');
    return removeEmptyValues(searchArr); // returns cleared array with search strings
}

function removeEmptyValues(arr){
    let cleanedArr = [];
    for (let i = 0; i < arr.length; i++) {
        (arr[i] && arr[i] != ' ') && cleanedArr.push(arr[i]);
    }
    return cleanedArr;
}

// for all passed string-fragments: searches for all matching pokemon names or IDs
async function getSearchResults(searchArr) {
    for (let i = 0; i < searchArr.length; i++) {
        // case: id 
        if (!isNaN(searchArr[i] * 1)) {
            await getIdSearchResult(searchArr[i]);
        // case: name/string
        } else {
            await getNamesSearchResults(searchArr[i]);
        }
    }
}

async function getIdSearchResult(id){
    if (id > 0 && id < 899) { // because somehow id search is not workling for ids > 898
        await searchPokemon(id);
        extractData();
    }
}

async function getNamesSearchResults(nameStr){
    let namesArr = [];
    let foundNames = await filterPokemonNames(nameStr);
    namesArr.push(...foundNames); //spread-operator (because I need to push content of array 1 into array 2 at the same level)
    // for all found pokemon names:
    for (let i = 0; i < namesArr.length; i++) {
        let el = namesArr[i].name;
        await searchPokemon(el);
        extractData();
    }
}

async function filterPokemonNames(str) {
    let response = await fetch(`https://pokeapi.co/api/v2/${endpoint}?limit=5000`);
    let allPokemons = await response.json();
    let foundNames;
    // if only one character is given, only Pokemons whose names BEGIN with the given character will be searched for
    if (str.length > 1){
        foundNames = await allPokemons.results.filter(poke => poke.name.includes(str));
    } else if (str.length == 1) {
        foundNames = await allPokemons.results.filter(poke => poke.name.startsWith(str))
    }
    return foundNames;
}

async function filterPokemonTypes(str) {/*in progress*/}

// remove/ add to favorites and update local storage, fav-icon
function handleFavorites(pokemon) {
    let icon = getById('fav-' + pokemon);
    // toggle icon fav view
    icon.classList.toggle('add-fav');
    // add to or remove from favorites-collection
    let index = favorites.indexOf(pokemon);
    if (index == -1) {
        favorites.push(pokemon);
    } else {
        favorites.splice(index, 1);
    }
    saveDataLocally();
    //if(getClasses('fav-link')[0].classList.contains('d-none')){renderFavorites()}
}

function saveDataLocally(){
    let favoritesStr = JSON.stringify(favorites);
    localStorage.setItem('favouritePokemons', favoritesStr);
}

function loadLocalData(){
    let favoritesStr = localStorage.getItem('favouritePokemons');
    if(favoritesStr){
        favorites = JSON.parse(favoritesStr);
    }
}

function toggleOverlay() {
    toggleElement(getById('modal-overlay'));
    getElement('body').classList.toggle('no-scroll');
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

// add and remove blink animation to given input-field(s)
function addBlinkAnimation(...inputFields) {
    for(let i = 0; i < inputFields.length; i++){
        inputFields[i].classList.add('blink');
        setTimeout(function () {
            inputFields[i].classList.remove('blink');
        }, 900);
    }
}

function handleKeypresses() {
    window.addEventListener('keydown', function (event) {
        if (event.code == 'Escape' && !getById('modal-overlay').classList.contains('d-none')) {
            toggleElement(getById('modal-overlay'));
        }
        if (event.code == 'Enter') {
            handlePokemonSearch();
        }
    });
}

function clearInputValues(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].value = '';
    }
}

// general functions:

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
