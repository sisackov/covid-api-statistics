import {
    fetchCountries,
    fetchCovidData,
    getCovidPerContinentData,
    getCountry,
    getChartStatsDisplay,
    getChartCountriesDisplay,
} from './data.js';
import { saveToLocalStorage, getFromLocalStorage } from './utils.js';

export let continentsList = [
    'Africa',
    'Asia',
    //'Australia', TODO
    'Europe',
    'North America',
    'South America',
]; //list of strings with the names of the continents
export let continentToCountriesMap = new Map(); //map where key is continent name and value is list of Country objects
export let countryToCodeMap = new Map(); //map where key is country name and value is list of country code
export let covidPerCountryMap = new Map(); //map where key is country name and value is CovidData object
export let covidPerContinentMap = new Map(); //map where key is continent name and value is CovidData object
let currentChart;
let selectedContinent = '';
let selectedCountry = '';

export class Country {
    constructor(name, code) {
        this.name = name;
        // this.continent = continent; //TODO maybe redundant
        this.code = code;
    }
}

export class CovidData {
    constructor(confirmed, deaths, recovered, critical) {
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
    }
}

const chartContainer = document.querySelector('#chart-container');
const statsContainer = document.querySelector('#stats-container');
const continentsContainer = document.querySelector('#continents-container');
const countriesContainer = document.querySelector('#countries-container');

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
async function initializeVariables() {
    if (!localStorage.getItem('hasCovidData')) {
        await fetchCovidData();
        await fetchCountries();
        getCovidPerContinentData();

        saveToLocalStorage('continentsList', continentsList);
        saveToLocalStorage(
            'continentToCountriesMap',
            continentToCountriesMap,
            true
        );
        saveToLocalStorage('countryToCodeMap', countryToCodeMap, true);
        saveToLocalStorage('covidPerCountryMap', covidPerCountryMap, true);
        saveToLocalStorage('covidPerContinentMap', covidPerContinentMap, true);
        saveToLocalStorage('hasCovidData', true);
    } else {
        continentsList = getFromLocalStorage('continentsList');
        continentToCountriesMap = getFromLocalStorage(
            'continentToCountriesMap',
            true
        );
        countryToCodeMap = getFromLocalStorage('countryToCodeMap', true);
        covidPerCountryMap = getFromLocalStorage('covidPerCountryMap', true);
        covidPerContinentMap = getFromLocalStorage(
            'covidPerContinentMap',
            true
        );
    }

    loadPage(); //TODO: move from here
}
localStorage.clear();
initializeVariables();

// const getAverage

/**
 * This function after the page is loaded, and initializeVariables finished.
 * -    it dynamically fills the continents container with buttons, one for each continent.
 * -    it adds the click event to each button, so when the user clicks on a button,
 * the map is updated to show the countries and the data of the selected continent.
 * -    it dynamically fills the stats container with the data of the selected continent.
 * -    it dynamically fills the countries container with links, one for each country.
 * -    calls the renderChart function to render the chart.
 */
function loadPage() {
    renderContinents();
    onContinentClick({ target: { innerText: continentsList[0] } }); // dummy click to render the first continent
}

function renderContinents() {
    continentsList.forEach((continent) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-secondary', 'btn-sm', 'ml-3'); //TODO: add class
        button.innerText = continent;
        button.addEventListener('click', onContinentClick);
        continentsContainer.appendChild(button);
    });
}

function renderStats(continent) {
    const stats = covidPerContinentMap.get(continent);
    statsContainer.innerHTML = '';
    for (let key in stats) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-secondary', 'btn-sm', 'm-3'); //TODO: add class
        button.innerText = key;
        button.addEventListener('click', onStatClick);
        statsContainer.appendChild(button);
    }
}

function renderCountries(continent) {
    countriesContainer.innerHTML = '';
    const countries = continentToCountriesMap.get(continent);
    countries.forEach((country) => {
        const span = document.createElement('span');
        span.classList.add('btn', 'm-3'); //TODO: add class
        span.innerText = country.name;
        span.addEventListener('click', onCountryClick);
        countriesContainer.appendChild(span);
    });
}

/**
 * This function is called when a continent is selected.
    -   it gets the CovidData object of the selected continent
    -   it uses the chart.js library to create a chart with the data of the selected continent
 * @param {CovidData} covidData 
 */
export class ChartDisplay {
    constructor(labels, tooltip, data, backgroundColors, borderColors) {
        this.labels = labels;
        this.tooltip = tooltip;
        this.data = data;
        this.backgroundColors = backgroundColors;
        this.borderColors = borderColors;
    }
}

function renderChart(chartDisplay, chartType) {
    const ctx = document.getElementById('myChart');
    if (currentChart) {
        currentChart.destroy();
    }
    currentChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: chartDisplay.labels,
            datasets: [
                {
                    label: chartDisplay.tooltip,
                    data: chartDisplay.data,
                    backgroundColor: chartDisplay.backgroundColors,
                    borderColor: chartDisplay.borderColors,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

//*****************************************************************/
//*****     Event Listeners                                 *******/
//*****************************************************************/
function onContinentClick(ev) {
    selectedContinent = ev.target.innerText;
    renderStats(selectedContinent);
    renderCountries(selectedContinent);
    renderChart(
        getChartStatsDisplay(
            covidPerContinentMap.get(selectedContinent),
            selectedContinent
        ),
        'bar'
    );
}

function onStatClick(ev) {
    const stat = ev.target.innerText;
    renderChart(getChartCountriesDisplay(selectedContinent, stat), 'bar');
}

function onCountryClick(ev) {
    const country = ev.target.innerText;
    const countryObj = getCountry(selectedContinent, country);
    renderChart(
        getChartStatsDisplay(covidPerCountryMap.get(countryObj.code), country),
        'bar'
    );
}
