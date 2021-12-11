export function saveToLocalStorage(key, value, isMap = false) {
    if (isMap) {
        localStorage.setItem(key, JSON.stringify(Array.from(value.entries())));
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export function getFromLocalStorage(key, isMap = false) {
    if (isMap) {
        return new Map(JSON.parse(localStorage.getItem(key)));
    }
    return JSON.parse(localStorage.getItem(key));
}

export function isNumberInRange(number, min, max) {
    return number >= min && number <= max;
}

export function getColorsArray(size, a) {
    const colors = [];
    for (let i = 0; i < size; i++) {
        colors.push(
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, ${a})`
        );
    }
    return colors;
}
