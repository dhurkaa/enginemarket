# Placeholder data: replace before launch

Everything below is example data written for the build. The client (Tomas, TopG7) replaces or confirms
each item. **Engine codes, fitment lists and compression specs must be checked against the real
catalogue (ETKA, ETK, EPC/WIS or the supplier's data) for every engine before it goes online.**

## Stock: `data/engines.json`

| What | Status |
|---|---|
| All 16 engines | Example stock. Replace with the real list. |
| Prices (`priceEur`, incl. 23% VAT) | Invented. |
| Mileage (`mileageKm`) | Invented. `0` on em-0003 and em-0005 because the folder names say "new": confirm. |
| Grades (`grade`) | Invented. |
| Compression values (`compressionBar`) | Invented, plausible for the engine type. Replace with measured values. |
| Compression spec (`specCompressionBar` min / nominal) | Typical values (diesel 25 / 30 bar, petrol 10–10.5 / 13–13.5 bar). Check each engine's real spec. |
| Checks and their notes | Invented. |
| Donor cars and VIN last 6 | Invented. |
| Mileage proof (`mileageProof`) | Text only; no proof document images exist yet. Add the scans. |
| Included parts | Invented. |
| Fitment (`fits`) | Written from general knowledge. **Must be verified per engine.** |
| Codes `139580`, `256930`, `654920` | Taken from the client's photo folder names. Confirm they are the codes customers search by (aliases `M139`, `M256`, `OM654` are added). |
| em-0002 `B58B30A` | Its folder holds cylinder heads, crankshafts and blocks, not a whole engine. Confirm whether this listing is an engine or a head/short block, and send photos of the whole engine if it is one. |
| em-0003 `139580` fitment | Folder name says "C43 GT43 SL43". Confirm the GT 43 fitment. |

## Photographs: `public/engines/`

- em-0001 to em-0005 use the **client's own photographs** (from the five zip folders, chosen and assigned by
  what each picture shows). The zips had several duplicates; those were left out.
- `public/engines/site/` holds 12 more of the client's photographs used on the home and inner pages. Some
  of them (`139580-18`, `139580-22`, `139580-17`, `139580-24`) came from the `139580` folder but appear to show
  BMW engines; they are used only as general pictures, never as a specific listing. Confirm they may be shown.
- em-0006 to em-0016 have **no photographs**: their pages say photographs are sent on request, and their cards
  show the compression bars. Add photos to `public/engines/<id>/1.jpg …` and list them in `photos`.
- The photos are WhatsApp exports (about 1024 px wide). For a sharper hero on large screens, send the
  originals or reshoot: each engine on the same white backdrop, front, both sides, gearbox end, the stamped
  code, the factory label, the odometer of the donor car.
- `public/share.jpg` (link preview) is cut from the B58 hero photograph.

## Site facts: `config/site.ts`

| What | Status |
|---|---|
| Phone `+421 2 3300 4400` | From the brief, marked placeholder there. |
| Email `sales@enginemarket.eu` | From the brief, marked placeholder there. |
| Opening hours Mon–Fri 8:00–17:00, Sat 9:00–12:00 | From the brief. |
| VAT 23% (Slovakia) | From the brief. |
| Company name, street, town, register number, VAT ID, managing director | **Empty.** The imprint shows only what is filled in. Needed by law for the imprint. |
| Workshop address | Not given, so the contact page shows "Slovakia" and no map. Add `street` and `town` to show a map link. |

## Delivery: `data/delivery.json`

Prices and working days for 16 countries, the 300 kg pallet limit and €40 for a second engine are invented.

## Copy that states a policy or a time (`messages/en.json`, `content/legal.en.ts`)

Confirm or change each:

- What each grade means (`grades.R/A/B/C.text`, e.g. "within 8% of nominal compression"). The brief gives only the months.
- What the warranty covers, what it does not, what is asked for and how to claim (`gradesPage.cover*`).
- "We call you … within one working day" after a reservation; "we answer within one working day" for warranty claims.
- "We reply within two working days" for engine searches and trade applications.
- "We answer by email, usually the same working day" for questions.
- Trade account: prices without VAT under reverse charge, one contact, fit checks by VIN.
- Packing: drained, sealed, euro pallet, tail-lift truck, carrier calls the day before.
- Terms of sale, privacy policy (retention periods: 30 days, 12 months, 10 years), cookie notice: **drafts for a lawyer to review.**

## Mail and reservations

- No mail provider is configured: forms log to the console. Set `RESEND_API_KEY` or `SMTP_*` (see `.env.example`).
- Reservations are stored in a JSON file. Before deploying on Vercel, move them to a database (README, "Reservations in production").
- The canonical domain is `https://enginemarket.eu` (`NEXT_PUBLIC_SITE_URL`). Confirm it.
