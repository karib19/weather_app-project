import './App.css'
import axios from 'axios'
import { useState } from 'react'

function App() {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
  const BASE_URL = 'https://api.weatherapi.com/v1'
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [query, setQuery] = useState('')


  async function handleSuggestion(value) {
  setQuery(value)

  if (value.length < 1) {
    setSuggestions([])
    return
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${value}`
    )

    setSuggestions(res.data)
  } catch (error) {
    console.error(error)
  }
}


  async function getWeather(e) {
    e.preventDefault()
    const city = query.trim()
    if (!city) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch current weather and forecast
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=yes`),
        axios.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=yes`)
      ])

      setWeatherData(currentRes.data)
      setForecastData(forecastRes.data)

      // Add to search history
      setSearchHistory(prev => {
        const updated = [city, ...prev.filter(c => c !== city)].slice(0, 5)
        return updated
      })

      setQuery('')
      setSuggestions([])
      setIsLoading(false)
    } catch (error) {
      setError('City not found. Please try again.')
      console.error('Error fetching weather data:', error)
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const iconUrl = condition?.icon
    return iconUrl ? `https:${iconUrl}` : '☁️'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-5xl font-bold text-white mb-2'>⛅Weather Hub</h1>
          <p className='text-blue-100'>Get real-time weather updates</p>
        </div>

        {/* Search Form */}
        <form onSubmit={getWeather} className='mb-8'>
          <div className='flex gap-2 justify-center flex-wrap'>
            <div className='relative'>
  <input
    name='city'
    type="text"
    value={query}
    onChange={(e) => handleSuggestion(e.target.value)}
    placeholder="Search by city name..."
    className='px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 min-w-64 shadow-lg text-black'
    autoComplete='off'
  />

  {suggestions.length > 0 && (
    <div className='absolute top-14 left-0 w-full bg-white rounded-lg shadow-lg z-50 overflow-hidden'>
      {suggestions.map((city, idx) => (
        <div
          key={idx}
          onClick={() => {
            setQuery(city.name)
            setSuggestions([])
          }}
          className='px-4 py-2 hover:bg-gray-200 cursor-pointer text-left text-black'
        >
          {city.name}, {city.country}
        </div>
      ))}
    </div>
  )}
</div>
            <button
              type='submit'
              className='bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105'
            >
              Search
            </button>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className='mb-6 flex gap-2 justify-center flex-wrap'>
            {searchHistory.map((city, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  const form = document.querySelector('form')
                  form.city.value = city
                  form.dispatchEvent(new Event('submit', { bubbles: true }))
                }}
                className='bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full text-sm transition'
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='bg-red-500 text-white p-4 rounded-lg mb-6 text-center'>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='text-center text-white text-2xl'>
            <div className='animate-spin text-4xl mb-4'>⟳</div>
            Loading weather data...
          </div>
        )}

        {/* Weather Display */}
        {weatherData && !isLoading && (
          <>
            {/* Current Weather Card */}
            <div className='bg-white rounded-2xl shadow-2xl p-8 mb-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Left Side - Main Weather Info */}
                <div className='flex flex-col justify-center'>
                  <h2 className='text-4xl font-bold text-gray-800 mb-2'>
                    {weatherData.location.name}, {weatherData.location.country}
                  </h2>
                  <p className='text-gray-600 mb-6'>{new Date().toLocaleDateString()}</p>

                  <div className='flex items-center gap-4 mb-6'>
                    <img
                      src={getWeatherIcon(weatherData.current.condition)}
                      alt="weather"
                      className='w-24 h-24'
                    />
                    <div>
                      <div className='text-6xl font-bold text-blue-600'>
                        {weatherData.current.temp_c}°C
                      </div>
                      <p className='text-xl text-gray-600 mt-2'>
                        {weatherData.current.condition.text}
                      </p>
                    </div>
                  </div>

                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <p className='text-lg text-gray-700'>
                      <span className='font-semibold'>Feels Like:</span> {weatherData.current.feelslike_c}°C
                    </p>
                  </div>
                </div>

                {/* Right Side - Detailed Metrics */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>Humidity</p>
                    <p className='text-3xl font-bold text-blue-700'>{weatherData.current.humidity}%</p>
                  </div>

                  <div className='bg-gradient-to-br from-cyan-100 to-cyan-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>Wind Speed</p>
                    <p className='text-3xl font-bold text-cyan-700'>{weatherData.current.wind_kph} km/h</p>
                  </div>

                  <div className='bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>Pressure</p>
                    <p className='text-3xl font-bold text-purple-700'>{weatherData.current.pressure_mb} mb</p>
                  </div>

                  <div className='bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>UV Index</p>
                    <p className='text-3xl font-bold text-orange-700'>{weatherData.current.uv}</p>
                  </div>

                  <div className='bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>Visibility</p>
                    <p className='text-3xl font-bold text-green-700'>{weatherData.current.vis_km} km</p>
                  </div>

                  <div className='bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl'>
                    <p className='text-gray-600 text-sm font-semibold'>Dew Point</p>
                    <p className='text-3xl font-bold text-pink-700'>{weatherData.current.dewpoint_c}°C</p>
                  </div>
                </div>
              </div>

              {/* Air Quality */}
              {weatherData.current.air_quality && (
                <div className='mt-8 pt-6 border-t-2 border-gray-200'>
                  <h3 className='text-xl font-bold text-gray-800 mb-4'>Air Quality</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='bg-indigo-50 p-4 rounded-lg'>
                      <p className='text-gray-600 font-semibold'>PM2.5</p>
                      <p className='text-2xl font-bold text-indigo-700 mt-1'>
                        {weatherData.current.air_quality.pm2_5?.toFixed(1)} µg/m³
                      </p>
                    </div>
                    <div className='bg-indigo-50 p-4 rounded-lg'>
                      <p className='text-gray-600 font-semibold'>PM10</p>
                      <p className='text-2xl font-bold text-indigo-700 mt-1'>
                        {weatherData.current.air_quality.pm10?.toFixed(1)} µg/m³
                      </p>
                    </div>
                    <div className='bg-indigo-50 p-4 rounded-lg'>
                      <p className='text-gray-600 font-semibold'>O₃</p>
                      <p className='text-2xl font-bold text-indigo-700 mt-1'>
                        {weatherData.current.air_quality.o3?.toFixed(1)} µg/m³
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5-Day Forecast */}
            {forecastData && (
              <div className='bg-white rounded-2xl shadow-2xl p-8'>
                <h3 className='text-3xl font-bold text-gray-800 mb-6'>5-Day Forecast</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                  {forecastData.forecast.forecastday.map((day, idx) => (
                    <div
                      key={idx}
                      className='bg-gradient-to-b from-blue-50 to-blue-100 p-4 rounded-xl text-center hover:shadow-lg transition'
                    >
                      <p className='font-semibold text-gray-700 mb-3'>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <img
                        src={getWeatherIcon(day.day.condition)}
                        alt="weather"
                        className='w-16 h-16 mx-auto mb-2'
                      />
                      <p className='text-sm text-gray-600 mb-2'>{day.day.condition.text}</p>
                      <div className='flex justify-center gap-2 mb-3'>
                        <span className='font-bold text-blue-700'>{day.day.maxtemp_c}°</span>
                        <span className='text-gray-500'>{day.day.mintemp_c}°</span>
                      </div>
                      <div className='text-xs text-gray-600'>
                        <p>💧 {day.day.avghumidity}%</p>
                        <p>💨 {day.day.maxwind_kph} km/h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Welcome Message */}
        {!weatherData && !isLoading && (
          <div className='text-center text-white'>
            <p className='text-2xl mb-4'>🌍 Welcome to Weather Hub</p>
            <p className='text-lg text-blue-100'>Search for a city to see current weather and forecast</p>
          </div>
        )}
      </div>
    </div>
  )
}
export default App
