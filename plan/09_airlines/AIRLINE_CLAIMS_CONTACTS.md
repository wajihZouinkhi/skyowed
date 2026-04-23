# Airline Claims Contacts (Top 60)

⚠️ These emails and URLs change. Verify from the airline's own website before seeding your DB.
Sources: airline legal pages, CAA guidance, Which? Travel, Verbraucherzentrale.

## Major EU airlines

| Airline | IATA | Claims Contact |
|---|---|---|
| Lufthansa | LH | customer.relations@lufthansa.com / https://www.lufthansa.com/feedback |
| Air France | AF | https://wwws.airfrance.fr/contact |
| KLM | KL | https://www.klm.com/travel/gb_en/customer_support |
| Iberia | IB | https://grupo.iberia.com/en/contact |
| TAP Portugal | TP | https://www.flytap.com/en-gb/contact-us |
| Alitalia / ITA Airways | AZ | https://www.ita-airways.com/en-en/contact-us |
| SAS | SK | https://www.flysas.com/en/customer-support |
| Finnair | AY | https://www.finnair.com/en/customer-care |
| Aer Lingus | EI | https://www.aerlingus.com/support |
| Austrian | OS | https://www.austrian.com/feedback |
| Swiss | LX | https://www.swiss.com/feedback |
| Brussels Airlines | SN | https://www.brusselsairlines.com/feedback |
| LOT Polish | LO | reklamacje@lot.pl |
| Aegean | A3 | https://en.aegeanair.com/contact |
| Ryanair | FR | https://eucomplaintform.ryanair.com |
| easyJet | U2 | https://www.easyjet.com/en/claim |
| Wizz Air | W6 | https://wizzair.com/en-gb/information-and-services/customer-service |
| Vueling | VY | https://customer.vueling.com |
| Eurowings | EW | https://www.eurowings.com/en/information/contact |
| Transavia | HV | https://www.transavia.com/nl-NL/faq |
| Pegasus | PC | https://www.flypgs.com/en/customer-service |
| Norwegian | DY | https://www.norwegian.com/uk/customer-service |

## UK airlines
| Airline | IATA | Claims Contact |
|---|---|---|
| British Airways | BA | https://www.britishairways.com/travel/compensation-and-expenses-claim |
| Virgin Atlantic | VS | https://www.virginatlantic.com/gb/en/contact |
| Jet2 | LS | https://www.jet2.com/contact |
| TUI Airways | BY | https://www.tui.co.uk/destinations/info/tui-airways-contact |

## US airlines (for refund / Montreal Convention claims)
| Airline | IATA | Claims Contact |
|---|---|---|
| American Airlines | AA | https://www.aa.com/i18n/customer-service/contact-american/refund-request.jsp |
| Delta | DL | https://www.delta.com/us/en/need-help/comments-complaints |
| United | UA | https://www.united.com/ual/en/us/fly/help/complaints-compliments.html |
| Southwest | WN | https://www.southwest.com/feedback |
| JetBlue | B6 | https://www.jetblue.com/contact-us |
| Alaska | AS | https://www.alaskaair.com/content/feedback |
| Spirit | NK | https://customersupport.spirit.com |
| Frontier | F9 | https://www.flyfrontier.com/travel/travel-info/customer-service |

## Australian airlines
| Airline | IATA | Claims Contact |
|---|---|---|
| Qantas | QF | https://www.qantas.com/au/en/support/contact-us |
| Jetstar | JQ | https://www.jetstar.com/au/en/help-and-contact |
| Virgin Australia | VA | https://www.virginaustralia.com/au/en/help |
| Rex | ZL | https://www.rex.com.au/Assistance.aspx |

## Middle East / Asia (often long-haul into EU → EU261 applies!)
| Airline | IATA | Claims Contact |
|---|---|---|
| Emirates | EK | https://www.emirates.com/english/help |
| Qatar | QR | https://www.qatarairways.com/en/about-qatar-airways/help.html |
| Etihad | EY | https://www.etihad.com/en/help/contact |
| Turkish | TK | https://www.turkishairlines.com/en-int/any-questions |
| Singapore | SQ | https://www.singaporeair.com/en_UK/gb/contact-us |

## How to build this DB for your app
1. Scrape/fetch each airline's "Contact" or "Complaints" page
2. Store: IATA, claims email (if public), claims URL, postal address, languages supported
3. Update quarterly — airlines change URLs often
