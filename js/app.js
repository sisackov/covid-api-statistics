import { fetchCountries } from './utils.js';

// continentsList = ['Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America'];
export let continentsList = [
    'Africa',
    'Asia',
    //'Australia', TODO
    'Europe',
    'North America',
    'South America',
]; //list of strings with the names of the continents
export let countriesMap = {}; //map where key is continent name and value is list of strings with the names of the countries
let covidPerContinentMap = {}; //map where key is continent name and value is CovidData object
let currentlySelectedContinent = '';

class CovidData {
    constructor(continent, confirmed, deaths, recovered, critical) {
        this.continent = continent;
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
    }
}

// const chartContainer = document.querySelector('#chart-container');
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
function initializeVariables() {
    fetchCountries();
}
initializeVariables();

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
    renderContinents();
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

/**
 * This function is called when a continent is selected.
    -   it gets the CovidData object of the selected continent
    -   it uses the chart.js library to create a chart with the data of the selected continent
 * @param {CovidData} covidData 
 */
const chartDisplay = {
    labels: ['Confirmed', 'Deaths', 'Recovered', 'Critical'],
    tooltips: [
        '# of confirmed cases',
        '# of deaths',
        '# of recovered cases',
        '# of critical cases',
    ],
    backgroundColors: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
    ],
    borderColors: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
    ],
};

function renderChart(covidData, chartType) {
    const ctx = document.getElementById('myChart');
    const chartData = [];
    for (const key in covidData) {
        if (key !== 'continent') {
            chartData.push(covidData[key]);
        }
    }
    const myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: chartDisplay.labels,
            datasets: [
                {
                    label: '# of Covid Cases',
                    data: chartData,
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
renderChart(new CovidData('Africa', 100, 200, 300, 400), 'bar');

//*****************************************************************/
//*****     Event Listeners                                 *******/
//*****************************************************************/
function onContinentClick(ev) {
    // renderMap(continent);
    // renderStats(continent);
    // renderCountries(continent);
    // renderChart(continent);
}

renderPage();
