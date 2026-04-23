# How the letter generator fills in the blanks

Your PDF generator replaces these placeholders in the template files above:

| Placeholder | Source | Example |
|---|---|---|
| `[Your Full Name]` | user form | "Ahmed Ben Ali" |
| `[Your Address]` | user form | "12 Rue X, 75001 Paris" |
| `[Email]` | user form | "ahmed@mail.com" |
| `[Phone]` | user form | "+33 6 12 34 56 78" |
| `[Today's Date]` | system date | "2026-04-23" |
| `[Airline Name]` | flight API | "Lufthansa" |
| `[Airline Claims Email / Address]` | your airline DB | see 09_airlines |
| `[FLIGHT NUMBER]` | user form | "LH 441" |
| `[DATE]` | user form | "2024-07-15" |
| `[PNR]` | user form | "ABC123" |
| `[Origin airport]` | flight API | "Frankfurt (FRA)" |
| `[Destination airport]` | flight API | "New York (JFK)" |
| `[Nature of disruption]` | user form + logic | "Delay of 5h 20m" |
| `[Actual arrival]` | user form | "2024-07-16 02:30" |
| `[250/400/600]` | eligibility engine | "600" |
| `[X km]` | distance calc | "6200" |
| `[IBAN / BIC]` | user form | — |
| `[Your Signature]` | PDF: image upload OR "/s/ Name" text |

## Tech: how to generate the PDF
- Use `pdfmake` (JS) or `ReportLab` (Python) or `react-pdf`
- Load the markdown template, do simple `string.replace()`
- Render to PDF with the user's signature image (or typed "/s/ Name")
- Let user download + provide airline's exact email to send to
