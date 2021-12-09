import {
    continentsList,
    countriesMap,
    Country,
    covidPerCountryMap,
    CovidData,
    covidPerContinentMap,
} from './app.js';

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
    const response = await fetchAll(urls);
    // console.log(response);
    for (let i = 0; i < continentsList.length; i++) {
        const countries = [];
        response[i].data.forEach((country) => {
            countries.push(country.name.common);
        });
        countriesMap.set(continentsList[i], countries);
    }
    console.log(countriesMap);
}

export async function fetchCovidData() {
    const covidResponse = await axios.get('https://corona-api.com/countries');
    covidResponse.data.data.forEach((country) => {
        covidPerCountryMap.set(
            country.name,
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

export function processCovidData() {
    for (const continent of countriesMap)
        continentsList.forEach((continent) => {
            console.log(continent);
        });
}
