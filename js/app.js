import {
    fetchCountries,
    fetchCovidData,
    getCovidPerContinentData,
    getCountry,
    getChartStatsDisplay,
    getChartCountriesDisplay,
    fetchAll,
    fetchContinents,
} from './data.js';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    isNumberInRange,
} from './utils.js';

export let continentsList = [];
export let continentToCountriesMap = new Map(); //map where key is continent name and value is list of Country objects
export let covidPerCountryMap = new Map(); //map where key is country name and value is CovidData object
export let covidPerContinentMap = new Map(); //map where key is continent name and value is CovidData object
let currentChart;
let currentScreenSize;
let selectedContinent = '';
let selectedCountry = '';

const SCREEN_SIZES = {
    NARROW: { min: 0, max: 700 },
    WIDE: { min: 701, max: 3200 },
};

export class Country {
    constructor(name, code) {
        this.name = name;
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

export class ChartDisplay {
    constructor(labels, tooltip, data, backgroundColors, borderColors) {
        this.labels = labels;
        this.tooltip = tooltip;
        this.data = data;
        this.backgroundColors = backgroundColors;
        this.borderColors = borderColors;
    }
}

const chartContainer = document.querySelector('#chart-container');
const loaderWrapper = document.querySelector('#loader-wrapper');
const mainWrapper = document.querySelector('#main-wrapper');
const statsContainer = document.querySelector('#stats-container');
const continentsContainer = document.querySelector('#continents-container');

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
    currentScreenSize = getScreenSize();

    if (!localStorage.getItem('hasCovidData')) {
        await fetchContinents();
        await fetchCovidData();
        await fetchCountries();
        getCovidPerContinentData();

        saveToLocalStorage('continentsList', continentsList);
        saveToLocalStorage(
            'continentToCountriesMap',
            continentToCountriesMap,
            true
        );
        saveToLocalStorage('covidPerCountryMap', covidPerCountryMap, true);
        saveToLocalStorage('covidPerContinentMap', covidPerContinentMap, true);
        saveToLocalStorage('hasCovidData', true);
    } else {
        continentsList = getFromLocalStorage('continentsList');
        continentToCountriesMap = getFromLocalStorage(
            'continentToCountriesMap',
            true
        );
        covidPerCountryMap = getFromLocalStorage('covidPerCountryMap', true);
        covidPerContinentMap = getFromLocalStorage(
            'covidPerContinentMap',
            true
        );
    }

    renderPage();
}
localStorage.clear(); //TODO: remove

/**
 * This function after the page is loaded, and initializeVariables finished.
 * -    it dynamically fills the continents container with buttons, one for each continent.
 * -    it adds the click event to each button, so when the user clicks on a button,
 * the map is updated to show the countries and the data of the selected continent.
 * -    it dynamically fills the stats container with the data of the selected continent.
 * -    it dynamically fills the countries container with links, one for each country.
 * -    calls the renderChart function to render the chart.
 */
function renderPage() {
    hideLoader();

    renderContinents();
    onContinentChange(new Event('dummy'), true); // dummy click to render the first continent
}

function hideLoader() {
    loaderWrapper.classList.add('hidden');
    mainWrapper.classList.remove('hidden');
    mainWrapper.classList.add('d-flex');
}

function renderContinents() {
    if (currentScreenSize === 'WIDE') {
        renderContinentsButtons();
    } else {
        renderContinentsDropdown();
    }
}

function renderContinentsButtons() {
    continentsContainer.innerHTML = '';
    continentsList.forEach((continent) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-continent', 'ml-3');
        button.innerText = continent;
        button.addEventListener('click', onContinentChange);
        continentsContainer.appendChild(button);
    });
}

function renderContinentsDropdown() {
    continentsContainer.innerHTML = '';
    const select = document.createElement('select');
    select.addEventListener('change', onContinentChange);
    continentsList.forEach((continent) => {
        select.appendChild(createOptionElement(continent, continent));
    });
    continentsContainer.appendChild(select);
}

function renderStats(continent) {
    if (currentScreenSize === 'WIDE') {
        renderStatsButtons(continent);
    } else {
        renderStatsDropdown(continent);
    }
}

function renderStatsButtons(continent) {
    const stats = covidPerContinentMap.get(continent);
    statsContainer.innerHTML = '';
    for (let key in stats) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-stat', 'm-3');
        button.innerText = key;
        button.addEventListener('click', onStatChange);
        statsContainer.appendChild(button);
    }
}

function renderStatsDropdown(continent) {
    const stats = covidPerContinentMap.get(continent);
    statsContainer.innerHTML = '';
    const select = document.createElement('select');
    select.addEventListener('change', onStatChange);
    for (let key in stats) {
        select.appendChild(createOptionElement(key, key));
    }
    statsContainer.appendChild(select);
}

function createOptionElement(label, value) {
    const option = document.createElement('option');
    option.innerText = label;
    option.value = value;
    return option;
}

function renderCountries(continent) {
    const select = document.createElement('select');
    select.appendChild(createOptionElement('Select Country', '0'));
    statsContainer.appendChild(select);

    const countries = continentToCountriesMap.get(continent);
    countries.forEach((country) => {
        const option = createOptionElement(country.name, country.code);
        select.appendChild(option);
    });
    select.addEventListener('change', onCountryChange);
}

/**
     * This function is called when a continent is selected.
        -   it gets the CovidData object of the selected continent
        -   it uses the chart.js library to create a chart with the data of the selected continent
     * @param {CovidData} covidData 
     */
function renderChart(chartDisplay, chartType) {
    //** TODO: line, bar, doughnut, pie, polarArea, scatter */
    if (currentChart) {
        currentChart.destroy();
    }
    const ctx = document.getElementById('canvas-chart');
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

function getScreenSize() {
    let screenSize = 'WIDE';
    const width = window.innerWidth;
    for (const key in SCREEN_SIZES) {
        if (
            isNumberInRange(width, SCREEN_SIZES[key].min, SCREEN_SIZES[key].max)
        ) {
            screenSize = key;
        }
    }
    return screenSize;
}

//*****************************************************************/
//*****     Event Listeners                                 *******/
//*****************************************************************/
window.addEventListener('load', () => {
    initializeVariables();
});

window.addEventListener('resize', () => {
    const screenSize = getScreenSize();
    if (screenSize !== currentScreenSize) {
        currentScreenSize = screenSize;
        renderPage(); //TODO
    }
});

function onContinentChange(ev, isInitial = false) {
    if (isInitial) {
        selectedContinent = continentsList[0];
    } else if (ev.target.tagName === 'BUTTON') {
        selectedContinent = ev.target.innerText;
    } else {
        selectedContinent = ev.target.value;
    }
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

function onStatChange(ev) {
    let stat = ev.target.value;
    if (ev.target.tagName === 'BUTTON') {
        stat = ev.target.innerText;
    }
    renderChart(getChartCountriesDisplay(selectedContinent, stat), 'line');
}

function onCountryChange(ev) {
    const code = ev.target.value;
    if (code === '0') {
        selectedCountry = null;
    } else {
        const country = ev.target.selectedOptions[0].innerText;
        renderChart(
            getChartStatsDisplay(covidPerCountryMap.get(code), country),
            'bar'
        );
        selectedCountry = code;
    }
}
