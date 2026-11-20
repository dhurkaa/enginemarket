import type { Page, Route } from "@playwright/test";

export const ENGINE = {
  /** VW CAYC 1.6 TDI: the keyboard test reserves it */
  cayc: "/engines/cayc-volkswagen-1-6-tdi-cr-em-0007",
  /** VW CFFB 2.0 TDI: the progress / double-click test reserves it */
  cffb: "/engines/cffb-volkswagen-2-0-tdi-cr-em-0006",
  /** Audi CDNC: another buyer reserves it while the page is open */
  cdnc: "/engines/cdnc-audi-2-0-tfsi-em-0009",
  /** BMW B58B30B: the failure test and the phone bar test (never reserved for real) */
  b58: "/engines/b58b30b-bmw-3-0-b58-twinpower-turbo-em-0001",
};

export const VALID = {
  name: "Jana Novak",
  email: "jana@garage.example",
  phone: "+421 900 123 456",
  country: "SK",
  vin: "WVWZZZ1KZ9W123456",
};

export async function fillReservation(page: Page, v = VALID) {
  const dlg = page.getByTestId("reserve-dialog");
  await dlg.getByLabel("Your name").fill(v.name);
  await dlg.getByLabel("Email").fill(v.email);
  await dlg.getByLabel("Phone").fill(v.phone);
  await dlg.getByLabel("Delivery country").selectOption(v.country);
  await dlg.getByLabel("VIN of your car").fill(v.vin);
}

/** A stock page of `total` made-up engines, for the paging test (the placeholder stock has 15). */
export function fakeStock(total: number, page: number) {
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const count = Math.max(0, Math.min(pageSize, total - from));
  const items = Array.from({ length: count }, (_, i) => {
    const n = from + i + 1;
    const id = `em-${String(9000 + n).padStart(4, "0")}`;
    return {
      id,
      slug: `test${n}-volkswagen-2-0-tdi-${id}`,
      code: `TEST${n}`,
      aliases: [],
      make: "Volkswagen",
      family: "2.0 TDI",
      fuel: "diesel",
      displacementCc: 1968,
      powerKw: 103,
      mileageKm: 100000 + n,
      grade: "A",
      priceEur: 2000 + n,
      compressionBar: [29, 29, 29, 29],
      specCompressionBar: { min: 25, nominal: 30 },
      checks: [],
      donor: { make: "VW", model: "Golf", year: 2012, vinLast6: "000000" },
      mileageProof: "",
      included: [],
      fits: [{ make: "Volkswagen", model: "Golf VI", years: "2009–2013" }],
      photos: [],
      status: "available",
      reservedUntil: null,
    };
  });
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}
