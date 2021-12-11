import {
    continentsList,
    continentToCountriesMap,
    Country,
    covidPerCountryMap,
    CovidData,
    covidPerContinentMap,
    ChartDisplay,
} from './app.js';
import { getColorsArray, getAverageByProperty } from './utils.js';

export async function fetchAll(urls) {
    const urlsProm = urls.map((url) => axios.get(url));
    return Promise.all(urlsProm);
}

export async function fetchContinents() {
    const regions = await fetchAll([
        'https://restcountries.com/v3.1/all?fields=region',
    ]);

    regions[0].data.forEach((region) => {
        const continent = region.region;
        if (continent && !continentsList.includes(continent)) {
            continentsList.push(continent);
        }
    });
}

export async function fetchCountries() {
    const urls = continentsList.map(
        (continent) =>
            `https://restcountries.com/v3.1/region/${continent.toLowerCase()}?fields=name,cca2`
    );
    const response = await fetchAll(urls);
    for (let i = 0; i < continentsList.length; i++) {
        const countries = response[i].data.map(
            (country) => new Country(country.name.common, country.cca2)
        );
        continentToCountriesMap.set(continentsList[i], countries);
    }
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
}

export function getCovidPerContinentData() {
    continentsList.forEach((continent) => {
        const countries = continentToCountriesMap.get(continent);
        const covidData = countries.map((country) =>
            covidPerCountryMap.get(country.code)
        );
        covidPerContinentMap.set(
            continent,
            new CovidData(
                Math.floor(getAverageByProperty(covidData, 'Confirmed')),
                Math.floor(getAverageByProperty(covidData, 'Deaths')),
                Math.floor(getAverageByProperty(covidData, 'Recovered')),
                Math.floor(getAverageByProperty(covidData, 'Critical'))
            )
        );
    });
}

export function getCountry(continent, countryName) {
    const countries = continentToCountriesMap.get(continent);
    return countries.find((country) => country.name === countryName);
}

export function getChartStatsDisplay(covidData, name) {
    const labels = Array.from(Object.keys(covidData));
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
