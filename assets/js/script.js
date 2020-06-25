// CACHE PAGE ELEMENTS
var citySearchForm = document.querySelector('#city-search-form');
var cityInput = document.querySelector('#city-input');
var cityList = document.querySelector('#city-list ul');
var currentWeatherContainerEl = document.querySelector('#current-weather');
var cityNameEl = document.querySelector('#city-name');
var dateEl = document.querySelector('#date');
var currentIconEl = document.querySelector('#current-icon');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEl = document.querySelector('#current-humidity');
var currentWindEl = document.querySelector('#current-wind');
var currentUVEl = document.querySelector('#current-uv');
var forecastCardsContainer = document.querySelector('#cards-container');

// GLOBALS
var cities = [];

// HANDLE CITY SEARCH FORM SUBMISSION
function formSubmitHandler(event) {
	event.preventDefault();
	// get value from input element
	var cityName = cityInput.value.trim();

	// if there is a user input
	if (cityName) {
		// pass the input value as an argument to request function
		getWeatherData(cityName);

		// reset form field
		cityInput.value = '';
	} else {
		alert('Please enter a valid city name');
	}
}

// HANDLE CLICK ON CITY LIST TO CALL FUNCTION TO UPDATE WEATHER DATA VIEW
function handleCityClick() {
	getWeatherData(event.target.innerText);
}

// FUNCTION TO FETCH WEATHER DATA FROM API
function getWeatherData(city) {
	var appid = '9aae1d7d5854d6a61065bbbf23e68178';

	// format api url
	var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${appid}`;
	var forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${appid}`;

	// make a request to url for current weather
	fetch(currentWeatherUrl)
		.then(function(res) {
			// verify response
			if (res.ok) {
				// parse response
				res.json().then(function(data) {
					// if city is not already displayed in city list, display it (and save to array & LS)
					if (!cities.includes(data.name)) {
						updateCities(data.name);
					}

					// send data to be displayed
					displayCurrentWeather(data);
					// get coordinates
					var lat = data.coord.lat;
					var lon = data.coord.lon;
					// format UV index fetch request with coordinates
					var uvIndexUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=${appid}&lat=${lat}&lon=${lon} `;
					// make a request for current UV Index
					fetch(uvIndexUrl).then(function(uvRes) {
						if (uvRes.ok) {
							uvRes.json().then(function(uvData) {
								displayUVIndex(uvData);
							});
						} else {
							alert('Sorry, the UV Index was not found for that city');
						}
					});
				});
			} else {
				// alert('Error: ' + Response.statusText);
				alert('Sorry, that city was not found, please try again.');
			}
		})
		// catch network errors
		.catch(function(error) {
			alert('Unable to connect to Open Weather Map');
		});

  // make a request to url for 5-day weather forecast
	fetch(forecastWeatherUrl)
		.then(function(res) {
			// verify response
			if (res.ok) {
				res.json().then(function(data) {
					displayForecastWeather(data);
				});
			} else {
				// alert('Error: ' + Response.statusText);
				alert('Sorry, that city was not found, please try again.');
			}
		})
		// catch network errors
		.catch(function(error) {
			alert('Unable to connect to Open Weather Map');
		});
}

// display city in city list and call save function
function updateCities(city) {
  // create list item to display city
	var cityListItemEl = document.createElement('li');
	cityListItemEl.innerText = city;

  
	cityList.appendChild(cityListItemEl);

  // call function to save city to array & LS
	saveCity(city);
}

// POPULATE UI WITH DATA FROM API
function displayCurrentWeather(currentData) {
	cityNameEl.innerText = currentData.name;
	dateEl.innerText = `(${moment.unix(currentData.dt).format('M/D/YYYY')})`;
	currentIconEl.setAttribute(
		'src',
		`http://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`
	);
	currentTempEl.innerText = currentData.main.temp;
	currentHumidityEl.innerText = currentData.main.humidity;
	currentWindEl.innerText = currentData.wind.speed;
}

// CONDITIONALLY DISPLAY BG-COLOR BASED ON UV SEVERITY
function displayUVIndex(uvData) {
	if (uvData.value < 3) {
		currentUVEl.className = 'uv-favorable';
	} else if (uvData.value < 8) {
		currentUVEl.className = 'uv-moderate';
	} else {
		currentUVEl.className = 'uv-severe';
	}
	currentUVEl.innerText = uvData.value;
}

// POPULATE 5-DAY FORECAST SECTION WITH DATA FROM ITS OWN API 
function displayForecastWeather(forecastData) {
	forecastCardsContainer.innerHTML = '';

	// loop over data.lists array
	// 7, 15, 23, 31, 39

  // display weather data from subsequent 5 days
	for (var i = 7; i < forecastData.list.length; i = i + 8) {
		// build HTML for each card
		var forecastCardEl = document.createElement('div');
		forecastCardEl.className = 'card';

		forecastCardsContainer.appendChild(forecastCardEl);

		var forecastDateEl = document.createElement('h4');
		var forecastIconEl = document.createElement('img');
		var forecastTempEl = document.createElement('p');
		var forecastHumidityEl = document.createElement('p');

		forecastDateEl.innerText = moment(forecastData.list[i].dt_txt).format('M/D/YYYY');
		// forecastDateEl.innerText = moment
		// 	.unix(forecastData.list[i].dt)
		// 	.format('M/D/YYYY');
		forecastIconEl.setAttribute(
			'src',
			`http://openweathermap.org/img/wn/${forecastData.list[i].weather[0].icon}.png`
		);
		forecastTempEl.innerText = `Temp: ${forecastData.list[i].main.temp}°F`;
		forecastHumidityEl.innerText = `Humidity: ${forecastData.list[i].main.humidity}%`;

		forecastCardEl.appendChild(forecastDateEl);
		forecastCardEl.appendChild(forecastIconEl);
		forecastCardEl.appendChild(forecastTempEl);
		forecastCardEl.appendChild(forecastHumidityEl);
	}
}

// FUNCITON TO SAVE CITY TO ARRAY AND LOCAL STORAGE, ALREADY VERIFIED UNIQUE BY THIS POINT
function saveCity(city) {
	// save new city to array
	cities.push(city);

	localStorage.setItem('cities', JSON.stringify(cities));
}

// FUNCTION TO POPULATE UI WITH CITY LIST
function loadCities() {
	var LScities = localStorage.getItem('cities');
	LScities = JSON.parse(LScities);
	if (!LScities) {
		return false;
	}

	// display city list from local storage
	for (var i = 0; i < LScities.length; i++) {
		updateCities(LScities[i]);
	}
	getWeatherData(LScities[0]);
}

// INITIALIZE APP
loadCities();

citySearchForm.addEventListener('submit', formSubmitHandler);
cityList.addEventListener('click', handleCityClick);
