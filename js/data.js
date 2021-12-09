import {
    continentsList,
    continentToCountriesMap,
    Country,
    covidPerCountryMap,
    CovidData,
    covidPerContinentMap,
    ChartDisplay,
} from './app.js';
import { getColorsArray } from './utils.js';

async function fetchAll(urls) {
    const urlsProm = [];
    urls.forEach((url) => {
        urlsProm.push(axios.get(url));
    });
    return Promise.all(urlsProm);
}

export async function fetchCountries() {
    const urls = continentsList.map(
        (continent) =>
            `https://restcountries.com/v3.1/region/${continent.toLowerCase()}?fields=name,cca2`
    );
    //TODO change to herokuapp api
    const response = await fetchAll(urls);
    for (let i = 0; i < continentsList.length; i++) {
        const countries = response[i].data.map(
            (country) => new Country(country.name.common, country.cca2)
        );
        continentToCountriesMap.set(continentsList[i], countries);
    }
    // console.log(continentToCountriesMap);
}

export async function fetchCovidData() {
    const covidResponse = await axios.get('https://corona-api.com/countries');
    covidResponse.data.data.forEach((country) => {
        covidPerCountryMap.set(
            country.code,
            new CovidData(
                country.latest_data.confirmed,
                country.latest_data.deaths,
                country.latest_data.recovered,
                country.latest_data.critical
            )
        );
    });
    // console.log(covidPerCountryMap);
}

export function getCovidPerContinentData() {
    for (const continent of continentsList) {
        const countriesList = continentToCountriesMap.get(continent);
        const len = countriesList.length;
        let [confirmed, deaths, recovered, critical] = [0, 0, 0, 0];
        countriesList.forEach((country) => {
            const covidData = covidPerCountryMap.get(country.code);
            if (covidData) {
                confirmed += covidData.confirmed;
                deaths += covidData.deaths;
                recovered += covidData.recovered;
                critical += covidData.critical;
            } else {
                console.error(country.name + ' - Covid Data not found');
            }
        });
        covidPerContinentMap.set(
            continent,
            new CovidData(
                Math.floor(confirmed / len),
                Math.floor(deaths / len),
                Math.floor(recovered / len),
                Math.floor(critical / len)
            )
        );
    }
    // console.log(covidPerContinentMap);
    // saveToLocalStorage('covidPerContinentMap', covidPerContinentMap);
    // saveToLocalStorage('hasCovidData', true);
}

export function getCountry(continent, countryName) {
    const countries = continentToCountriesMap.get(continent);
    return countries.find((country) => country.name === countryName);
}

export function getChartStatsDisplay(covidData, name) {
    const labels = ['Confirmed', 'Deaths', 'Recovered', 'Critical'];
    const tooltip = '# of total cases in ' + name;
    const backgroundColor = getColorsArray(labels.length, 0.2);
    const borderColor = getColorsArray(labels.length, 1);

    return new ChartDisplay(
        labels,
        tooltip,
        Array.from(Object.values(covidData)),
        backgroundColor,
        borderColor
    );
}

export function getChartCountriesDisplay(continent, stat) {
    const countries = continentToCountriesMap.get(continent);
    const labels = countries.map((country) => country.name);
    const tooltip = `# of ${stat} cases in ${continent}`;
    const backgroundColor = getColorsArray(labels.length, 0.2);
    const borderColor = getColorsArray(labels.length, 1);
    const data = countries.map((country) => {
        const covidData = covidPerCountryMap.get(country.code);
        return covidData ? covidData[stat] : 0;
    });

    return new ChartDisplay(
        labels,
        tooltip,
        data,
        backgroundColor,
        borderColor
    );
}
