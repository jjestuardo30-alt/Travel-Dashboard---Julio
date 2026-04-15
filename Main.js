// -------------------------------------------------------------
// DATOS DE LAS CIUDADES
// Estructura de datos con la información base de cada ciudad.
// -------------------------------------------------------------
const CITIES = {
  barcelona: {
    name: {es: "Barcelona", en: "Barcelona"},
    country: { es: "España", en: "Spain" },
    lat: 41.3874,
    lon: 2.1686,
    currency: "EUR",
    currencyName: { es: "Euro", en: "Euro" },
    image: "img/barcelona.jpg"
  },
  london: {
    name: { es: "Londres", en: "London" },
    country: { es: "Reino Unido", en: "United Kingdom" },
    lat: 51.5074,
    lon: -0.1278,
    currency: "GBP",
    currencyName: { es: "Libra esterlina", en: "Pound sterling" },
    image: "img/londres.jpg"
  },
  paris: {
    name: { es: "París", en: "Paris" },
    country: { es: "Francia", en: "France" },
    lat: 48.8566,
    lon: 2.3522,
    currency: "EUR",
    currencyName: { es: "Euro", en: "Euro" },
    image: "img/paris2.jpeg"
  },
  newyork: {
    name: { es: "Nueva York", en: "New York" },
    country: { es: "Estados Unidos", en: "United States" },
    lat: 40.7128,
    lon: -74.0060,
    currency: "USD",
    currencyName:  {es: "Dólar estadounidense", en: "US Dollar" },
    image: "img/new york.jpg"
  },
  tokyo: {
    name: { es: "Tokio", en: "Tokyo" },
    country: { es: "Japón", en: "Japan" },
    lat: 35.6895,
    lon: 139.6917,
    currency: "JPY",
    currencyName: { es: "Yen japonés", en: "Japanese Yen" },
    image: "img/tokio1.webp"
  }
};

// ------------------------------------------------------------
// SELECTORES DEL DOM
// Se obtienen una sola vez y se reutilizan en todo el script.
// ------------------------------------------------------------
const citySelect       = document.getElementById("city-select");
const dashboard        = document.getElementById("dashboard");
 
// Resumen
const summaryCity      = document.getElementById("summary-city");
const summaryCountry   = document.getElementById("summary-country");
const summaryTemp      = document.getElementById("summary-temp");
const summaryCurrency  = document.getElementById("summary-currency");
 
// Meteorología
const weatherLoading   = document.getElementById("weather-loading");
const weatherContent   = document.getElementById("weather-content");
const weatherError     = document.getElementById("weather-error");
const weatherTemp      = document.getElementById("weather-temp");
const weatherRain      = document.getElementById("weather-rain");
const weatherWind      = document.getElementById("weather-wind");
const weatherDesc      = document.getElementById("weather-desc");
 
// Moneda
const eurAmount        = document.getElementById("eur-amount");
const convertBtn       = document.getElementById("convert-btn");
const currencyLoading  = document.getElementById("currency-loading");
const currencyResult   = document.getElementById("currency-result");
const currencyError    = document.getElementById("currency-error");
const resultAmount     = document.getElementById("result-amount");
const resultFrom       = document.getElementById("result-from");
const resultTo         = document.getElementById("result-to");
const resultConverted  = document.getElementById("result-converted");
 
// Recomendación
const travelTip        = document.getElementById("travel-tip");

// Header Fondo dinamico
const header = document.querySelector(".header");

// --------------------------------------------------------------
// ESTADO GLOBAL
// Guarda los datos cargados para poder reutilizarlos
// sin hacer peticiones extra (por ejemplo para el tip).
// -------------------------------------------------------------
let currentCity   = null;
let currentTemp   = null;
let currentRainPct = null

// ------------------------------------------------------
// FUNCIONES DE UTILIDAD
// -------------------------------------------------
 
/**
 * Muestra u oculta un elemento usando la clase CSS "hidden".
 * @param {HTMLElement} el   - Elemento a modificar
 * @param {boolean}     show - true = mostrar, false = ocultar
 */
function toggleVisibility(el, show) {
  if (show) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

/**
 * Convierte el porcentaje de lluvia en un texto descriptivo.
 * @param {number} pct - Porcentaje de probabilidad de lluvia (0–100)
 * @returns {string}   - Texto descriptivo con emoji
 */
function getRainLabel(pct) {
  if (currentLang === 'es') {
    if (pct <= 20) return "☀️ Sin lluvia";
    if (pct <= 50) return "🌦️ Posibles precipitaciones";
    return "🌧️ Probable lluvia";
  } else {
    if (pct <= 20) return "☀️ No rain expected";
    if (pct <= 50) return "🌦️ Possible rain";
    return "🌧️ Likely rain";
  }
}
 
/**
 * Genera el mensaje o recomendación de viaje a partir de los datos cargados.
 * @param {object} city      - Objeto ciudad del diccionario CITIES
 * @param {number} temp      - Temperatura en °C
 * @param {number} rainPct   - % de probabilidad de lluvia
 * @returns {string}         - Mensaje de recomendación
 */
function buildTravelTip(city, temp, rainPct) {
  let tips = [];
  

  if (temp >= 22) {
    tips.push(currentLang === 'es'
      ? '☀️ ¡Hoy hace buen tiempo para pasear por ' + city.name[currentLang] + '!'
      : '☀️ Great weather today for a walk around ' + city.name[currentLang] + '!');
  } else if (temp >= 12) {
    tips.push(currentLang === 'es'
      ? '🧥 La temperatura en ' + city.name[currentLang] + ' es agradable, lleva algo de abrigo por la noche.'
      : '🧥 The temperature in ' + city.name[currentLang] + ' is mild, bring a jacket for the evening.');
  } else {
    tips.push(currentLang === 'es'
      ? '🧤 Recuerda llevar chaqueta: la temperatura en ' + city.name[currentLang] + ' es baja (' + temp + '°C).'
      : '🧤 Remember to bring a coat: temperature in ' + city.name[currentLang] + ' is low (' + temp + '°C).');
  }

  if (rainPct > 50) {
    tips.push(currentLang === 'es'
      ? '☂️ Alta probabilidad de lluvia (' + rainPct + '%). ¡No olvides el paraguas!'
      : '☂️ High chance of rain (' + rainPct + '%). Don\'t forget your umbrella!');
  } else if (rainPct > 20) {
    tips.push(currentLang === 'es'
      ? '🌂 Puede que llueva (' + rainPct + '%), lleva algo de abrigo.'
      : '🌂 It might rain (' + rainPct + '%), bring something waterproof.');
  }

  if (city.currency !== 'EUR') {
    tips.push(currentLang === 'es'
      ? '💱 Recuerda cambiar moneda: en ' + city.name[currentLang] + ' se usa ' + city.currencyName[currentLang] + ' (' + city.currency + ').'
      : '💱 Remember to exchange currency: ' + city.name[currentLang] + ' uses ' + city.currencyName[currentLang] + ' (' + city.currency + ').');
  }

  return tips.join(' · ');
}

// -----------------------------------------------------------
// FUNCIÓN: CARGAR DATOS METEOROLÓGICOS
// API gratuita Open-Meteo, sin necesidad de API key.
// -----------------------------------------------------------
 
/**
 * Obtiene el código WMO del tiempo y devuelve una descripción en texto.
 * @param {number} code - Código WMO de la API Open-Meteo
 * @returns {string}    - Descripción del estado del cielo
 */
function getWeatherDescription(code) {
  if (currentLang === 'es') {
    if (code === 0)              return "☀️ Despejado";
    if (code <= 3)               return "⛅ Parcialmente nublado";
    if (code <= 49)              return "🌫️ Niebla";
    if (code <= 67)              return "🌧️ Lluvia";
    if (code <= 77)              return "❄️ Nieve";
    if (code <= 82)              return "🌦️ Chubascos";
    if (code <= 99)              return "⛈️ Tormenta";
  return "🌡️ Sin datos";
} else {
    if (code === 0) return "☀️ Clear";
    if (code <= 3) return "⛅ Partly cloudy";
    if (code <= 49) return "🌫️ Fog";
    if (code <= 67) return "🌧️ Rain";
    if (code <= 77) return "❄️ Snow";
    if (code <= 82) return "🌦️ Showers";
    if (code <= 99) return "⛈️ Storm";
    return "🌡️ No data";
  }
}

/**
 * Llama a la API Open-Meteo, procesa la respuesta y actualiza el DOM
 * con temperatura, probabilidad de lluvia, viento y descripción.
 * En caso de error muestra el mensaje de error correspondiente.
 * @param {object} city - Objeto ciudad del diccionario CITIES
 */
async function loadWeather(city) {
  // Mostrar loading, ocultar contenido y error
  toggleVisibility(weatherLoading, true);
  toggleVisibility(weatherContent, false);
  toggleVisibility(weatherError, false);
 
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.lat}` +
    `&longitude=${city.lon}` +
    `&current=temperature_2m,precipitation_probability,windspeed_10m,weathercode` +
    `&timezone=auto`;
 
  try {
    const response = await fetch(url);
 
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
 
    const data = await response.json();
    const current = data.current;
 
    // Extraer valores
    const temp    = current.temperature_2m;
    const rain    = current.precipitation_probability;
    const wind    = current.windspeed_10m;
    const code    = current.weathercode;
 
    // Guardar en estado global para el tip y el resumen
    currentTemp     = temp;
    currentRainPct  = rain;
    currentWeatherCode = code;
 
    // Actualizar DOM — Meteorología
    weatherTemp.textContent = `${temp}°C`;
    weatherRain.textContent = `${rain}% · ${getRainLabel(rain)}`;
    weatherWind.textContent = `${wind} km/h`;
    weatherDesc.textContent = getWeatherDescription(code);
 
    // Actualizar temperatura en la card resumen
    summaryTemp.textContent = `${temp}°C`;
 
    // Mostrar contenido y ocultar loading
    toggleVisibility(weatherLoading, false);
    toggleVisibility(weatherContent, true);
 
    // Actualizar recomendación de viaje con todos los datos
    travelTip.textContent = buildTravelTip(city, temp, rain);
 
  } catch (error) {
    console.error("Error al cargar el tiempo:", error);
    toggleVisibility(weatherLoading, false);
    toggleVisibility(weatherError, true);
    travelTip.textContent = `✈️ Visita ${city.name} en ${city.country}. Recuerda llevar ${city.currencyName} (${city.currency}).`;
  }
}

// -----------------------------------------------------------
// FUNCIÓN: CARGAR CONVERSIÓN DE MONEDA
// API gratuita Frankfurter (https://www.frankfurter.app/).
// -----------------------------------------------------------
 
/**
 * Llama a la API Frankfurter para obtener el tipo de cambio EUR → moneda local.
 * Actualiza el DOM con el resultado formateado.
 * Si la moneda destino es EUR, muestra 1:1 sin llamar a la API.
 * En caso de error muestra el mensaje de error correspondiente.
 * @param {object} city   - Objeto ciudad del diccionario CITIES
 * @param {number} amount - Cantidad en EUR introducida por el usuario
 */
async function loadCurrencyConversion(city, amount) {
  // Ocultar resultado anterior y error, mostrar loading
  toggleVisibility(currencyResult, false);
  toggleVisibility(currencyError, false);
  toggleVisibility(currencyLoading, true);
 
  // Caso especial: EUR → EUR (Barcelona, Paris)
  if (city.currency === "EUR") {
    toggleVisibility(currencyLoading, false);
 
    resultAmount.textContent    = amount;
    resultFrom.textContent      = "EUR";
    resultTo.textContent        = "EUR";
    resultConverted.textContent = `${amount.toFixed(2)} €`;
 
    toggleVisibility(currencyResult, true);
    return;
  }
 
    const url = 'https://api.frankfurter.dev/v1/latest?from=EUR&to=' + city.currency;
 
  try {
    const response = await fetch(url);
 
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
 
    const data = await response.json();
    const rate  = data.rates[city.currency];
    const converted = (amount * rate).toFixed(2);
 
    // Actualizar DOM — Conversión
    resultAmount.textContent    = amount;
    resultFrom.textContent      = "EUR";
    resultTo.textContent        = city.currency;
    resultConverted.textContent = `${converted} ${city.currency}`;
 
    toggleVisibility(currencyLoading, false);
    toggleVisibility(currencyResult, true);
 
  } catch (error) {
    console.error("Error al cargar la conversión:", error);
    toggleVisibility(currencyLoading, false);
    toggleVisibility(currencyError, true);
  }
}

// -----------------------------------------------------------
// FUNCIÓN: ACTUALIZAR CARD RESUMEN
// ----------------------------------------------------------
 
/**
 * Rellena la card de resumen con la información básica de la ciudad.
 * La temperatura se actualiza después de la llamada a la API del tiempo.
 * @param {object} city - Objeto ciudad del diccionario CITIES
 */
function updateSummaryCard(city) {
  summaryCity.textContent     = city.name[currentLang];;
  summaryCountry.textContent  = city.country[currentLang];;
  summaryTemp.textContent = currentLang === 'es' ? 'Cargando...' : 'Loading...';
  summaryCurrency.textContent = `${city.currencyName[currentLang]} (${city.currency})`;
}


// -----------------------------------------------------------
// FUNCIÓN: ACTUALIZAR FONDO DEL HEADER
// -----------------------------------------------------------
function updateHeaderBackground(city) {
  header.style.backgroundImage = `
    linear-gradient(rgba(15, 17, 23, 0.65), rgba(15, 17, 23, 0.65)),
    url('${city.image}')
  `;
}

//-------------------------------------------------------------
// FUNCIÓN PRINCIPAL: CARGAR CIUDAD
// Controla todas las funciones al seleccionar una ciudad.
// ------------------------------------------------------------
 
/**
 * Función principal que se llama cada vez que el usuario cambia la ciudad.
 * Actualiza el resumen, carga el tiempo y realiza la conversión inicial.
 * @param {string} cityKey - Clave de la ciudad (ej. "barcelona")
 */
async function loadCity(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;
 
  currentCity = city;
  // Actualizar fondo del header segun ciudad seleccionada
  updateHeaderBackground(city);
 
  // Mostrar el dashboard si estaba oculto
  toggleVisibility(dashboard, true);
 
  // 1. Actualizar resumen
  updateSummaryCard(city);
 
  // 2. Cargar meteorología
  await loadWeather(city);
 
  // 3. Realizar conversión inicial con el valor del input
  const amount = parseFloat(eurAmount.value) || 100;
  await loadCurrencyConversion(city, amount);
}

// ------------------------------------------------------------
// EVENT LISTENERS
// Cumple el requisito técnico de addEventListener.
// ------------------------------------------------------------
 
// Evento de cambio de ciudad en el selector
citySelect.addEventListener("change", function () {
  const selectedKey = citySelect.value;
 
  if (!selectedKey) {
    toggleVisibility(dashboard, false);
    header.style.backgroundImage = ""
    return;
  }
 
  loadCity(selectedKey);
});

// Evento del botón de conversión de moneda
convertBtn.addEventListener("click", function () {
  if (!currentCity) return;
 
  const amount = parseFloat(eurAmount.value);
 
  if (isNaN(amount) || amount < 0) {
    alert("Por favor, introduce una cantidad válida en EUR.");
    return;
  }
 
  loadCurrencyConversion(currentCity, amount);
});
 
// Permitir convertir presionando Enter en el input de cantidad
eurAmount.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    convertBtn.click();
  }
});

// ------------------------------------------------------------
// SISTEMA DE TRADUCCIÓN
// ------------------------------------------------------------
const TRANSLATIONS = {
  es: {
    headerSubtitle:  'Consulta información esencial antes de viajar',
    selectorLabel:   '🏙️ Selecciona tu destino',
    summaryTitle:    '📋 Resumen del destino',
    weatherTitle:    '🌤️ Información meteorológica',
    currencyTitle:   '💱 Conversión de moneda',
    tipTitle:        '✈️ Recomendación de viaje',
    labelCity:       '🏙️ Ciudad',
    labelCountry:    '🌍 País',
    labelTemp:       '🌡️ Temperatura',
    labelCurrency:   '💱 Moneda local',
    labelTempW:      'Temperatura actual',
    labelRain:       'Probabilidad de lluvia',
    labelWind:       'Viento',
    labelSky:        'Estado del cielo',
    currencyLabel:   'Cantidad en EUR (€)',
    convertBtn:      'Convertir',
    tipDefault:      'Selecciona una ciudad para ver tu recomendación.',
    footerText:      'Travel Dashboard · Datos en tiempo real · APIs: Open-Meteo & Frankfurter',
    weatherLoading:  'Cargando datos del tiempo...',
    currencyLoading: 'Cargando tasas de cambio...',
    weatherError:    '❌ No se pudo cargar el tiempo.',
    currencyError:   '❌ No se pudo cargar la conversión.',
    langBtn:         '🌐 EN'
  },
  en: {
    headerSubtitle:  'Check essential information before travelling',
    selectorLabel:   '🏙️ Select your destination',
    summaryTitle:    '📋 Destination summary',
    weatherTitle:    '🌤️ Weather information',
    currencyTitle:   '💱 Currency conversion',
    tipTitle:        '✈️ Travel recommendation',
    labelCity:       '🏙️ City',
    labelCountry:    '🌍 Country',
    labelTemp:       '🌡️ Temperature',
    labelCurrency:   '💱 Local currency',
    labelTempW:      'Current temperature',
    labelRain:       'Rain probability',
    labelWind:       'Wind',
    labelSky:        'Sky condition',
    currencyLabel:   'Amount in EUR (€)',
    convertBtn:      'Convert',
    tipDefault:      'Select a city to see your recommendation.',
    footerText:      'Travel Dashboard · Real-time data · APIs: Open-Meteo & Frankfurter',
    weatherLoading:  'Loading weather data...',
    currencyLoading: 'Loading exchange rates...',
    weatherError:    '❌ Could not load weather data.',
    currencyError:   '❌ Could not load currency conversion.',
    langBtn:         '🌐 ES'
  }
};

let currentLang = 'es';

let currentWeatherCode = null;

function setLanguage(lang) {
  const t = TRANSLATIONS[lang];

  document.getElementById('header-subtitle').textContent    = t.headerSubtitle;
  document.getElementById('selector-label').textContent     = t.selectorLabel;
  document.getElementById('summary-title').textContent      = t.summaryTitle;
  document.getElementById('weather-title').textContent      = t.weatherTitle;
  document.getElementById('currency-title').textContent     = t.currencyTitle;
  document.getElementById('tip-title').textContent          = t.tipTitle;
  document.getElementById('label-city').textContent         = t.labelCity;
  document.getElementById('label-country').textContent      = t.labelCountry;
  document.getElementById('label-temp').textContent         = t.labelTemp;
  document.getElementById('label-currency').textContent     = t.labelCurrency;
  document.getElementById('label-temp-w').textContent       = t.labelTempW;
  document.getElementById('label-rain').textContent         = t.labelRain;
  document.getElementById('label-wind').textContent         = t.labelWind;
  document.getElementById('label-sky').textContent          = t.labelSky;
  document.getElementById('currency-label-text').textContent = t.currencyLabel;
  document.getElementById('convert-btn').textContent        = t.convertBtn;
  document.getElementById('footer-text').textContent        = t.footerText;
  document.getElementById('lang-btn').textContent           = t.langBtn;

  // Actualiza los mensajes de loading y error
  weatherLoading.textContent  = t.weatherLoading;
  currencyLoading.textContent = t.currencyLoading;
  weatherError.textContent    = t.weatherError;
  currencyError.textContent   = t.currencyError;

  // Si no hay ciudad seleccionada, traduce el tip por defecto
  if (!currentCity) {
  travelTip.textContent = t.tipDefault;
  } else {
  updateSummaryCard(currentCity);

    if (currentTemp !== null) {
    summaryTemp.textContent = `${currentTemp}°C`;
    weatherTemp.textContent = `${currentTemp}°C`;
    }

    if (currentRainPct !== null) {
    weatherRain.textContent = `${currentRainPct}% · ${getRainLabel(currentRainPct)}`;
    }

    if (currentWeatherCode !== null) {
    weatherDesc.textContent = getWeatherDescription(currentWeatherCode);
    }

    if (currentTemp !== null && currentRainPct !== null) {
    travelTip.textContent = buildTravelTip(currentCity, currentTemp, currentRainPct);
    }
  }
}

document.getElementById('lang-btn').addEventListener('click', function () {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  setLanguage(currentLang);
});

setLanguage(currentLang);