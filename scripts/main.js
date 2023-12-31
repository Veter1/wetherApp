const dataScreen = document.getElementsByClassName('data')[0];
const loadScreen = document.getElementsByClassName('loadScreen')[0];
const errorScreen = document.getElementsByClassName('errorScreen')[0];

const btnSearch = document.getElementsByClassName('btnSearch')[0];
const inputField = document.getElementsByClassName('inputField')[0];
const cityName = document.getElementsByClassName('cityName')[0];

const temperature = document.getElementsByClassName('temperatureText')[0];
const description = document.getElementsByClassName('description')[0];
const windSpeed = document.getElementsByClassName('windSpeed')[0];
const pressure = document.getElementsByClassName('pressureData')[0];
const humidity = document.getElementsByClassName('humidityData')[0];

let cityNameEN = 'Nova Kakhovka', cityNameUK = 'Нова Каховка';

// on load app
window.addEventListener("load", ()=>{
    if (localStorage.cityNameUK)
        cityNameUK = localStorage.cityNameUK;

    goLoad(true);
});

// on click to serach button
btnSearch.addEventListener('click', ()=> goLoad(false) );
// on click Enter
document.addEventListener( 'keyup', event => {
    if( event.code === 'Enter' && document.activeElement.classList.contains('inputField'))
        goLoad(false);
});

// start pocess
async function goLoad(onLoadApp){
    if (!onLoadApp)
        cityNameUK = inputField.value;   
    
    // переводимо першібукви назви у верхній регістр
    let x = cityNameUK.split(' ').filter(i => !!i);
    cityNameUK = '';
    for (let i in x){
        x[i] = x[i].split('');
        x[i][0] = x[i][0].toUpperCase();
    }
    for (let i in x){
        for (let j in x[i])
            cityNameUK += x[i][j];
        cityNameUK += ' ';
    }

    translate();
}

// translate input value
async function translate(){  
    var sourceText = 'місто ' + cityNameUK;
    var sourceLang = 'uk';
    var targetLang = 'en';
    
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    
    const response = await fetch(url, { method: 'GET' });
    const responseResult = await response.json();

    if (response.ok){
        cityNameEN = responseResult[0][0][0].replace('the city of ', '').replace("'", "").replace(' city', '');
        inputField.placeholder = '..' + cityNameUK;
        loadWether();
    } else {
        loadScreen.style = loadScreen.style.cssText + "display: none;";
        errorScreen.style = errorScreen.style.cssText + "display: block;";
        displayError(responseResult.message);
    }
}
// try loading wether data
async function loadWether(e){
    errorScreen.style = errorScreen.style.cssText + "display: none;";
    dataScreen.style = dataScreen.style.cssText + "display: none;";
    loadScreen.style = loadScreen.style.cssText + "display: block;";

    const server = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=uk&q=${cityNameEN}&appid=136b1ec47dd48d1e68e52c8f7f017a6d`;
    const response = await fetch(server, { method: 'GET' });
    const responseResult = await response.json();

    if (response.ok){
        loadScreen.style = loadScreen.style.cssText + "display: none;";
        dataScreen.style = dataScreen.style.cssText + "display: flex;";
        displayWether(responseResult);
    } else {
        loadScreen.style = loadScreen.style.cssText + "display: none;";
        errorScreen.style = errorScreen.style.cssText + "display: block;";
        displayError(responseResult.message);
    }
}

// on accses load - display data
function displayWether(data){
    cityName.textContent = cityNameUK + ' (' + data.sys.country + ')';
    description.textContent = data.weather[0].description;
    temperature.textContent = data.main.temp.toString().slice(0, -1) + '°';
    
    windSpeed.textContent = data.wind.speed + ' м/с';
    pressure.textContent = data.main.pressure + ' мм';
    humidity.textContent = data.main.humidity + '%';

    localStorage.setItem('cityNameUK', cityNameUK);
}

// on failed load - display msg
function displayError(msg){
    if (msg =='cityNameEN not found'){
        errorScreen.textContent = 'Невірно введена назва, або такого міста немає в базі :(';
    } else {
        errorScreen.textContent = msg;
    }
}
