// CACHE PAGE ELEMENTS
var currentWeatherContainerEl = document.querySelector('#current-weather');
var cityNameEl = document.querySelector('#city-name');
var dateEl = document.querySelector('#date');
var currentIconEl = document.querySelector('#current-icon');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEl = document.querySelector('#current-humidity');
var currentWindEl = document.querySelector('#current-wind');
var currentUVEl = document.querySelector('#current-uv');

var getWeatherData = function(city) {
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
};

var displayCurrentWeather = function(currentData) {
  cityNameEl.innerText = currentData.name;
  dateEl.innerText = moment.unix(currentData.dt).format('M/D/YYYY');
  currentIconEl.classList = `owi owi-${currentData.weather[0].icon}`;
  currentTempEl.innerText = currentData.main.temp;
  currentHumidityEl.innerText = currentData.main.humidity;
  currentWindEl.innerText = currentData.wind.speed;
};

var displayUVIndex = function(uvData) {
  currentUVEl.innerText = uvData.value;
};

var displayForecastWeather = function(forecastData) {
 
};

getWeatherData('Austin');
