const userTab = document.querySelector('.userWeather');
const searchTab = document.querySelector('.searchWeather');
const userContainer = document.querySelector('.weather-container');

const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('.searchForm');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const errorContainer = document.querySelector('.error-container');


// initial variables used
let currentTab = userTab;
let API_KEY = '3cbed11f8b866f73677b1bb6200159da';
currentTab.classList.add('current-tab');
getfromSessionStorage();

// switching tabs
userTab.addEventListener('click', function() {
    // pass clicked tab as input 
    switchTab(userTab);
});


searchTab.addEventListener('click', function() {
    // pass clicked tab as input 
    switchTab(searchTab);
});

function switchTab(clickedTab){
    if (currentTab != clickedTab) {
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        // is search form tab is invisible, if yes then make it visible 
        if(!searchForm.classList.contains('active')) {
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            errorContainer.classList.remove('active');
            searchForm.classList.add('active');
        }

        else {
            // pehele search tab pe tha abh your eather wale mein aana hai
            searchForm.classList.remove('active');
            userInfoContainer.classList.remove('active');
            errorContainer.classList.remove('active');            

            // abh your weather tag mein hu, toh display ke liye check local storage for coordinates if we have saved them there
            getfromSessionStorage();
        }
    }
};

// checks if coordinates already in session storage
function getfromSessionStorage() {
    const localCoordinates =sessionStorage.getItem('user-coordinates');

    if (!localCoordinates) {
        grantAccessContainer.classList.add('active'); 
    }

    else {
        const coordinates = JSON.parse(localCoordinates);

        // fetches from api using coordinates
        fetchUserWeatherInfo(coordinates);
    }
};

// when localcoordinates are found
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;

    // make grant container invisible 
    grantAccessContainer.classList.remove('active');

    // make loader visible
    loadingScreen.classList.add('active');

    // api call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();

            // make loader invisible again
            loadingScreen.classList.remove('active');

            userInfoContainer.classList.add('active');

            // takes out info from data and put in userinfocontainer accordingly
            renderWeatherInfo(data);
    }

    catch(err) {
        loadingScreen.classList.remove('active');
        console.error("Error fetching weather data: ", err);
    }
};

function renderWeatherInfo(weatherInfo) {
    // first fetch all these elements
    const cityName = document.querySelector('.cityName');
    const countryIcon = document.querySelector('.countryIcon');
    const desc = document.querySelector('.weatherDescription');
    const weatherIcon = document.querySelector('.weatherIcon');
    const temp = document.querySelector('.temp');
    const windspeed = document.querySelector('.windspeed');
    const humidity = document.querySelector('.humidity');
    const cloudiness = document.querySelector('.cloudiness');

    // fetch values from weather info obejt and put in ui elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${(weatherInfo?.main?.temp-273.00).toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
};

const grantAccessButton = document.querySelector('.grantAccess');

// when localcoordinates need to be found from grant location button
grantAccessButton.addEventListener('click', getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }

    else {
        alert('No Geolocation Support available');
    }
};

function showPosition (position) {
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }

    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

let searchInput = document.querySelector('.searchInput')

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let cityName = searchInput.value;

    // no name input
    if (cityName === "")
        return;

    else
        fetchSearchWeatherInfo(cityName);
})

// api call by city name
async function fetchSearchWeatherInfo(city) {
     loadingScreen.classList.add('active');
     userInfoContainer.classList.remove('active');
     grantAccessContainer.classList.remove('active');

     try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
        const data = await response.json();

        if(data?.cod !== 200) {
            userInfoContainer.classList.remove('active');
            loadingScreen.classList.remove('active');
            errorContainer.classList.add('active');
        }

        else {
            // make loader invisible again
            loadingScreen.classList.remove('active');

            userInfoContainer.classList.add('active');

            // takes out info from data and put in userinfocontainer accordingly
            renderWeatherInfo(data);
        }
    }

    catch(err) {
        loadingScreen.classList.remove('active');
        console.error("Error fetching weather data: ", err);
    }
};
