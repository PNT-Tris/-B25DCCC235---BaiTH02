import { useEffect, useMemo, useState } from 'react'
import './App.css'

const cities = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { name: 'Huế', lat: 16.4637, lng: 107.5909 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { name: 'Vũng Tàu', lat: 10.345, lng: 107.0841 },
]

const weatherCodes = {
  0: { label: 'Trời quang', icon: '☀️' },
  1: { label: 'Khá nắng', icon: '🌤️' },
  2: { label: 'Có mây', icon: '⛅' },
  3: { label: 'Nhiều mây', icon: '☁️' },
  45: { label: 'Sương mù', icon: '🌫️' },
  48: { label: 'Sương mù đóng băng', icon: '🌫️' },
  51: { label: 'Mưa phùn nhẹ', icon: '🌦️' },
  53: { label: 'Mưa phùn vừa', icon: '🌦️' },
  55: { label: 'Mưa phùn dày', icon: '🌧️' },
  56: { label: 'Mưa phùn đóng băng', icon: '🌧️' },
  57: { label: 'Mưa phùn đóng băng nặng', icon: '🌧️' },
  61: { label: 'Mưa nhỏ', icon: '🌦️' },
  63: { label: 'Mưa vừa', icon: '🌧️' },
  65: { label: 'Mưa to', icon: '🌧️' },
  66: { label: 'Mưa đóng băng', icon: '🌧️' },
  67: { label: 'Mưa đá', icon: '🌧️' },
  71: { label: 'Tuyết nhẹ', icon: '🌨️' },
  73: { label: 'Tuyết vừa', icon: '❄️' },
  75: { label: 'Tuyết dày', icon: '❄️' },
  77: { label: 'Mưa tuyết', icon: '🌨️' },
  80: { label: 'Mưa rào', icon: '🌦️' },
  81: { label: 'Mưa rào vừa', icon: '🌧️' },
  82: { label: 'Mưa rào lớn', icon: '🌧️' },
  85: { label: 'Tuyết rơi', icon: '🌨️' },
  86: { label: 'Tuyết rơi nặng', icon: '❄️' },
  95: { label: 'Dông', icon: '⛈️' },
  96: { label: 'Dông kèm mưa đá', icon: '⛈️' },
  99: { label: 'Dông cực mạnh', icon: '⛈️' },
}

const formatTemperature = (value, unit) => {
  if (unit === 'F') {
    return `${Math.round((value * 9) / 5 + 32)}°F`
  }

  return `${Math.round(value)}°C`
}

const formatWind = (value) => `${Math.round(value)} km/h`

function App() {
  const [selectedCity, setSelectedCity] = useState(cities[0])
  const [weatherData, setWeatherData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unit, setUnit] = useState('C')

  useEffect(() => {
    const controller = new AbortController()

    const fetchWeather = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu thời tiết.')
        }

        const data = await response.json()
        const current = data.current

        const nextData = {
          city: selectedCity.name,
          date: current.time,
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          wind: current.wind_speed_10m,
          precipitation: current.precipitation,
          weatherCode: current.weather_code,
          description: weatherCodes[current.weather_code]?.label ?? 'Thời tiết khác',
          icon: weatherCodes[current.weather_code]?.icon ?? '🌤️',
          forecast: data.daily.time.map((date, index) => ({
            date,
            code: data.daily.weather_code[index],
            min: data.daily.temperature_2m_min[index],
            max: data.daily.temperature_2m_max[index],
          })),
        }

        setWeatherData((prev) => ({ ...prev, [selectedCity.name]: nextData }))
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    return () => controller.abort()
  }, [selectedCity])

  const currentWeather = useMemo(() => {
    return weatherData[selectedCity.name] || null
  }, [selectedCity.name, weatherData])

  return (
    <div className="page-shell">
      <div className="weather-layout">
        <aside className="city-panel">
          <div className="panel-heading">
            <span className="eyebrow">8 thành phố</span>
            <h2>Việt Nam</h2>
          </div>

          <ul className="city-list">
            {cities.map((city) => (
              <li key={city.name}>
                <button
                  type="button"
                  className={city.name === selectedCity.name ? 'city-button active' : 'city-button'}
                  onClick={() => setSelectedCity(city)}
                >
                  <span>{city.name}</span>
                  {city.name === selectedCity.name && <span className="selected-dot" />}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="weather-panel">
          <header className="weather-header">
            <div>
              <p className="label">Thời tiết hiện tại</p>
              <h1>{selectedCity.name}</h1>
            </div>

            <div className="unit-toggle" role="tablist" aria-label="Chọn đơn vị nhiệt độ">
              <button
                type="button"
                className={unit === 'C' ? 'unit-button active' : 'unit-button'}
                onClick={() => setUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={unit === 'F' ? 'unit-button active' : 'unit-button'}
                onClick={() => setUnit('F')}
              >
                °F
              </button>
            </div>
          </header>

          {loading ? (
            <div className="state-box loading">
              <span className="spinner" aria-hidden="true" />
              Đang tải dữ liệu thời tiết...
            </div>
          ) : error ? (
            <div className="state-box error">{error}</div>
          ) : currentWeather ? (
            <>
              <section className="current-card">
                <div className="current-main">
                  <span className="weather-icon" aria-hidden="true">
                    {currentWeather.icon}
                  </span>
                  <div>
                    <p className="temperature">
                      {formatTemperature(currentWeather.temperature, unit)}
                    </p>
                    <p className="description">{currentWeather.description}</p>
                  </div>
                </div>

                <div className="current-meta">
                  <div>
                    <span>Cảm giác</span>
                    <strong>{formatTemperature(currentWeather.feelsLike, unit)}</strong>
                  </div>
                  <div>
                    <span>Độ ẩm</span>
                    <strong>{currentWeather.humidity}%</strong>
                  </div>
                  <div>
                    <span>Gió</span>
                    <strong>{formatWind(currentWeather.wind)}</strong>
                  </div>
                  <div>
                    <span>Mưa</span>
                    <strong>{currentWeather.precipitation} mm</strong>
                  </div>
                </div>
              </section>

              <section className="forecast-section">
                <div className="forecast-header">
                  <h3>7 ngày tới</h3>
                </div>

                <div className="forecast-list">
                  {currentWeather.forecast.map((day) => (
                    <div className="forecast-item" key={day.date}>
                      <span className="forecast-date">
                        {new Date(day.date).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                      <span className="forecast-icon" aria-hidden="true">
                        {weatherCodes[day.code]?.icon ?? '🌤️'}
                      </span>
                      <span className="forecast-temp">
                        {formatTemperature(day.min, unit)} / {formatTemperature(day.max, unit)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default App
