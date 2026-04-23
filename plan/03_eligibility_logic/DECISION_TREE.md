# Eligibility Decision Tree (the brain of your app)

## Inputs needed from user
1. Flight number (e.g. "BA432")
2. Scheduled departure date
3. What happened: DELAYED | CANCELLED | DENIED_BOARDING | DIVERTED
4. If DELAYED: actual arrival time at final destination
5. If CANCELLED: when was the passenger notified? (date)
6. If re-routed: new arrival time offered
7. Ticket type: normal paid / free-staff-ticket / prize
8. Did user actually check in on time? (for denied boarding)

## Auto-fetched from flight data API
- Departure airport (IATA + country)
- Arrival airport (IATA + country)
- Operating airline (IATA code)
- Airline's country of registration
- Great-circle distance (km)
- Weather on date (optional but powerful)

## Step-by-step logic (pseudocode)

```
function checkEligibility(flight, event):

    # STEP 1 — Jurisdiction check
    jurisdiction = null
    if flight.departureCountry in EU_COUNTRIES:
        jurisdiction = "EU261"
    elif flight.arrivalCountry in EU_COUNTRIES and flight.airlineCountry in EU_COUNTRIES:
        jurisdiction = "EU261"
    elif flight.departureCountry == "GB":
        jurisdiction = "UK261"
    elif flight.arrivalCountry == "GB" and flight.airlineCountry in (EU_COUNTRIES | ["GB"]):
        jurisdiction = "UK261"
    elif flight.departureCountry == "US" or flight.arrivalCountry == "US":
        jurisdiction = "US_DOT"
    elif flight.departureCountry == "AU" or flight.arrivalCountry == "AU":
        jurisdiction = "AU_ACL"
    else:
        return { eligible: false, reason: "No strong passenger-rights law applies" }

    # STEP 2 — Time-bar check
    if daysAgo(flight.date) > jurisdictionTimeLimit(jurisdiction, flight.departureCountry):
        return { eligible: false, reason: "Claim is too old for this country" }

    # STEP 3 — Ticket type check
    if flight.ticketType in ("free", "staff", "prize"):
        return { eligible: false, reason: "Free/reduced tickets not covered" }

    # STEP 4 — Rule version check (EU261 reform after 2026-XX-XX)
    ruleSet = (flight.date < EU261_REFORM_DATE) ? "EU261_v1" : "EU261_v2"

    # STEP 5 — Event-specific eligibility

    if event.type == "DELAYED":
        arrivalDelay = event.actualArrival - flight.scheduledArrival
        threshold = getDelayThreshold(jurisdiction, ruleSet, flight.distanceKm)
        if arrivalDelay < threshold:
            return { eligible: false, reason: "Delay under threshold" }

    elif event.type == "CANCELLED":
        daysNotice = flight.date - event.notifiedDate
        if daysNotice >= 14:
            return { eligible: false, reason: "Notified 14+ days in advance" }
        if daysNotice >= 7 and reroute_within_2h_early_and_2h_late:
            return { eligible: false, reason: "Adequate reroute offered" }
        if daysNotice < 7 and reroute_within_1h_early_and_2h_late:
            return { eligible: false, reason: "Adequate reroute offered" }

    elif event.type == "DENIED_BOARDING":
        if event.voluntarilyGaveUpSeat:
            return { eligible: false, reason: "Voluntarily gave up seat" }

    # STEP 6 — Extraordinary circumstances warning
    warning = null
    if knownExtraordinary(flight.date, flight.route):
        warning = "The airline may claim 'extraordinary circumstances' (weather/strike/etc). Claim anyway — many are rejected by courts."

    # STEP 7 — Calculate amount
    amount = calcAmount(jurisdiction, ruleSet, flight.distanceKm)

    # STEP 8 — 50% reduction check
    if event.type == "CANCELLED" and event.reroute:
        if reroute_within_close_enough:
            amount = amount * 0.5

    return {
        eligible: true,
        jurisdiction,
        ruleSet,
        amount,
        currency: (jurisdiction == "UK261") ? "GBP" : "EUR",
        warning,
        enforcementBody: getEnforcer(jurisdiction, flight.departureCountry),
        claimTimeLeft: jurisdictionTimeLimit(jurisdiction) - daysAgo(flight.date)
    }
```

## Distance → amount table (EU261 current)
| Distance | Amount |
|---|---|
| ≤ 1,500 km | €250 |
| 1,500–3,500 km | €400 |
| > 3,500 km | €600 |

## Distance → amount table (EU261 post-reform expected)
| Distance | Threshold | Amount |
|---|---|---|
| ≤ 3,500 km | 4 hours | €300 |
| > 3,500 km | 6 hours | €500 |

## EU_COUNTRIES constant (as of 2026)
AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE
Plus treated similarly: IS (Iceland), NO (Norway), CH (Switzerland)
