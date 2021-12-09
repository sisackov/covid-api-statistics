import { continentsList, countriesMap } from './app.js';

async function fetchAll(urls) {
    const urlsProm = [];
    urls.forEach((url) => {
        urlsProm.push(axios.get(url));
    });
    return Promise.all(urlsProm);
}

export async function fetchCountries() {
    const urls = [];
    continentsList.forEach((continent) => {
        urls.push(
            `https://restcountries.com/v3.1/region/${continent.toLowerCase()}?fields=name`
        );
    });
    const response = await fetchAll(urls);
    console.log(response);
    for (let i = 0; i < continentsList.length; i++) {
        const countries = [];
        response[i].data.forEach((country) => {
            countries.push(country.name.common);
        });
        countriesMap[continentsList[i]] = countries;
    }
    console.log(countriesMap);
}

export async function fetchCovidData() {}
