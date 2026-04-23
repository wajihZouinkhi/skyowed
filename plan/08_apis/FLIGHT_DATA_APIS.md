# Flight-Data API Comparison

You need: lookup flight by number + date → get status, actual/scheduled times, distance.

| Provider | Free tier | Paid | Pros | Cons |
|---|---|---|---|---|
| **AviationStack** | 500 calls/mo | $50/mo 10k, $250 100k | Easy, cheap, historical data | Sometimes gaps on small airlines |
| **FlightAware AeroAPI** | — | $100/mo | Most accurate | Expensive |
| **FlightRadar24 API** | — | custom | Best data | Very expensive |
| **OpenSky Network** | free | — | free! | Only real-time, no commercial use |
| **AeroDataBox (RapidAPI)** | 500/mo free | $10/mo 10k | Historical, cheap | Less mainstream |

## 👉 Recommended: AviationStack → AeroDataBox as backup

## Example request (AviationStack)

```js
const res = await fetch(
  `https://api.aviationstack.com/v1/flights?access_key=${KEY}&flight_iata=LH441&flight_date=2024-07-15`
);
const data = await res.json();
// data.data[0] contains: dep_iata, arr_iata, arr_scheduled, arr_actual, airline...
```

## Distance calculation
Use IATA airport coords (free list: openflights.org data) + haversine formula. No API needed.

```js
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

## Weather-on-date API (for extraordinary-circumstances check)
- **Open-Meteo** historical API — free, no key needed
- Helps you warn users: "Severe storms reported at FRA on your date — airline may claim extraordinary circumstances"
