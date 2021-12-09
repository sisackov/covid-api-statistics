// continentsList = ['Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America'];
continentsList = []; //list of strings with the names of the continents
countriesMap = {}; //map where key is continent name and value is list of strings with the names of the countries
covidPerContinentMap = {}; //map where key is continent name and value is CovidData object

class CovidData {
    constructor(continent, confirmed, deaths, recovered, critical) {
        this.continent = continent;
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
    }
}

/**
 * This function is called when the page is loaded.
 * It creates the map and the continents list already stored
 * in the local storage - it loads it from there.
 * Otherwise it calls the Countries REST API to get the list of countries as follows:
 * -    First call the Countries REST API to get the list of countries per continent
 * and store in countriesMap.
 * -    Then call the Covid REST API to get the CovidData per country and store
 * in covidPerContinentMap.
 */
function initializeVariables() {}

/**
 * This function after the page is loaded, and initializeVariables finished.
 * -    it dynamically fills the continents container with buttons, one for each continent.
 * -    it adds the click event to each button, so when the user clicks on a button,
 * the map is updated to show the countries and the data of the selected continent.
 * -    it dynamically fills the stats container with the data of the selected continent.
 * -    it dynamically fills the countries container with links, one for each country.
 * -    it dynamically updates the chart with the data of the selected continent.
 */
function renderPage() {
    // Create the map
    createMap();

    // Create the continents list
    createContinentsList();
}
