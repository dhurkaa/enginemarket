import { expect, test } from "@playwright/test";
import { ENGINE, VALID, delay, fakeStock, fillReservation, fulfillJson } from "./helpers";

test.describe("1. Filters live in the URL", () => {
  test("filters set on the page survive a reload and a shared link", async ({ page, context }) => {
    await page.goto("/engines");
    await expect(page.getByTestId("range")).toContainText("of 15");

    await page.getByLabel("Fuel", { exact: true }).selectOption("diesel");
    await expect(page).toHaveURL(/fuel=diesel/);
    await page.getByRole("checkbox", { name: "Grade A" }).check();
    await expect(page).toHaveURL(/grade=A/);
    await page.getByLabel("Sort by").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    await page.getByRole("button", { name: "Table" }).click();
    await expect(page).toHaveURL(/view=table/);
    const range = await page.getByTestId("range").textContent();

    await page.reload();
    await expect(page.getByLabel("Fuel", { exact: true })).toHaveValue("diesel");
    await expect(page.getByRole("checkbox", { name: "Grade A" })).toBeChecked();
    await expect(page.getByLabel("Sort by")).toHaveValue("price-asc");
    await expect(page.getByRole("button", { name: "Table" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("range")).toHaveText(range!);

    // the same link opened by someone else
    const other = await context.newPage();
    await other.goto(page.url());
    await expect(other.getByLabel("Fuel", { exact: true })).toHaveValue("diesel");
    await expect(other.getByTestId("range")).toHaveText(range!);
    const rows = other.locator("table.stock-table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
    for (const txt of await rows.allTextContents()) expect(txt).toMatch(/Diesel/);
  });

  test("the code search is in the URL too", async ({ page }) => {
    await page.goto("/engines?q=n47");
    await expect(page.getByLabel("Engine code or keyword")).toHaveValue("n47");
    await expect(page.getByTestId("range")).toHaveText("1–1 of 1");
    await expect(page.getByTestId("stock-results")).toContainText("N47D20C");
  });
});

test.describe("2. More than 25 matches page by 25", () => {
  test("shows 1–25 of N and pages", async ({ page }) => {
    await page.route("**/api/stock?**", (route) => {
      const p = Number(new URL(route.request().url()).searchParams.get("page") ?? 1);
      return fulfillJson(route, fakeStock(40, p));
    });
    await page.route("**/api/stock", (route) => fulfillJson(route, fakeStock(40, 1)));
    await page.goto("/engines");
    await expect(page.getByTestId("range")).toHaveText("1–25 of 40");
    await expect(page.locator(".ecard")).toHaveCount(25);
    const pager = page.getByRole("navigation", { name: "Pages" });
    await expect(pager.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    await pager.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByTestId("range")).toHaveText("26–40 of 40");
    await expect(page.locator(".ecard")).toHaveCount(15);
  });

  test("the API itself pages by 25", async ({ request }) => {
    const res = await request.get("/api/stock");
    const body = await res.json();
    expect(body.pageSize).toBe(25);
    expect(body.total).toBe(15);
    expect(body.items.length).toBe(15);
  });
});

test.describe("3. Slow and failing stock feed", () => {
  test("a slow feed shows the row skeleton", async ({ page }) => {
    await page.route("**/api/stock?**", async (route) => {
      await delay(2500);
      await route.continue();
    });
    await page.goto("/engines?fuel=petrol");
    await expect(page.getByTestId("stock-skeleton")).toBeVisible();
    await expect(page.getByTestId("stock-results")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("stock-skeleton")).toHaveCount(0);
  });

  test("a failed feed says so, offers Reload, and keeps search and filters", async ({ page }) => {
    let fail = true;
    await page.route("**/api/stock?**", (route) => (fail ? route.fulfill({ status: 500, body: "down" }) : route.continue()));
    await page.goto("/engines?q=tdi&fuel=diesel&grade=A");
    await expect(page.getByText("The stock list didn't load")).toBeVisible();
    await expect(page.getByLabel("Engine code or keyword")).toHaveValue("tdi");
    await expect(page.getByLabel("Fuel", { exact: true })).toHaveValue("diesel");
    await expect(page.getByRole("checkbox", { name: "Grade A" })).toBeChecked();
    fail = false;
    await page.getByRole("button", { name: "Reload the list" }).click();
    await expect(page.getByTestId("stock-results")).toBeVisible();
    await expect(page).toHaveURL(/q=tdi/);
    await expect(page).toHaveURL(/fuel=diesel/);
  });
});

test.describe("4 and 5. Sending a reservation", () => {
  test("the button shows progress and a second click does nothing", async ({ page }) => {
    let posts = 0;
    await page.route("**/api/reserve", async (route) => {
      posts++;
      await delay(1500);
      await route.continue();
    });
    await page.goto(ENGINE.cffb);
    await page.getByTestId("reserve-button").click();
    await fillReservation(page);
    const submit = page.getByTestId("reserve-dialog").locator('button[type="submit"]');
    await submit.click();
    await expect(submit).toHaveAttribute("aria-busy", "true");
    await expect(submit).toContainText("Sending your reservation");
    await submit.click({ force: true });
    await submit.click({ force: true });
    await expect(page.getByTestId("reserve-dialog").getByRole("heading", { name: /Reserved until/ })).toBeVisible();
    expect(posts).toBe(1);
    await page.getByTestId("reserve-dialog").getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByTestId("reserved-mine")).toContainText("Reserved until");
  });

  test("a failed send keeps every field and offers Try again", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/reserve", (route) => {
      calls++;
      return calls === 1 ? route.fulfill({ status: 502, body: "{}" }) : fulfillJson(route, { ref: "R-TEST0001", until: new Date(Date.now() + 48 * 3600e3).toISOString() }, 201);
    });
    await page.goto(ENGINE.b58);
    await page.getByTestId("reserve-button").click();
    await fillReservation(page);
    const dlg = page.getByTestId("reserve-dialog");
    await dlg.getByLabel("Notes").fill("Fitting at our garage on Friday");
    await dlg.locator('button[type="submit"]').click();
    await expect(dlg.getByRole("alert")).toContainText("did not go through");
    await expect(dlg.getByLabel("Your name")).toHaveValue(VALID.name);
    await expect(dlg.getByLabel("Email")).toHaveValue(VALID.email);
    await expect(dlg.getByLabel("Phone")).toHaveValue(VALID.phone);
    await expect(dlg.getByLabel("Delivery country")).toHaveValue(VALID.country);
    await expect(dlg.getByLabel("VIN of your car")).toHaveValue(VALID.vin);
    await expect(dlg.getByLabel("Notes")).toHaveValue("Fitting at our garage on Friday");
    await dlg.getByRole("button", { name: "Try again" }).click();
    await expect(dlg.getByRole("heading", { name: /Reserved until/ })).toBeVisible();
  });

  test("errors show under their fields and name what to type", async ({ page }) => {
    await page.goto(ENGINE.b58);
    await page.getByTestId("reserve-button").click();
    const dlg = page.getByTestId("reserve-dialog");
    await dlg.getByLabel("VIN of your car").fill("123");
    await dlg.locator('button[type="submit"]').click();
    await expect(dlg.getByText("Write your name, at least two letters.")).toBeVisible();
    await expect(dlg.getByText(/17-character VIN/)).toBeVisible();
    await expect(dlg.getByLabel("Your name")).toBeFocused();
    await expect(dlg.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
    await expect(dlg.getByRole("status").filter({ hasText: "fields to fix" })).toBeVisible();
  });
});

test.describe("6. Another buyer reserves while you look", () => {
  test("the page shows Reserved until… without a reload and offers a way out", async ({ page, request }) => {
    await page.goto(ENGINE.cdnc);
    await expect(page.getByTestId("reserve-button")).toBeVisible();
    const res = await request.post("/api/reserve", {
      data: { engineId: "em-0009", ...VALID, name: "Other Buyer", email: "other@example.com", notes: "", website: "" },
    });
    expect(res.status()).toBe(201);
    const banner = page.getByTestId("reserved-banner");
    await expect(banner).toContainText("Reserved until", { timeout: 12_000 });
    await expect(page.getByTestId("reserve-button")).toHaveCount(0);
    await expect(banner.getByRole("link", { name: "See similar engines" })).toBeVisible();
    await expect(banner.getByRole("link", { name: "Request an engine search" })).toHaveAttribute("href", /\/sourcing\?code=CDNC/);

    // and a second reservation of the same engine is refused
    const again = await request.post("/api/reserve", { data: { engineId: "em-0009", ...VALID, notes: "", website: "" } });
    expect(again.status()).toBe(409);
  });
});

test.describe("7. Keyboard only", () => {
  test("find by code, open the test sheet and reserve, with visible focus and a focus trap", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

    // Tab to the hero's code search
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      if (await page.locator("#hero-code").evaluate((el) => el === document.activeElement)) break;
    }
    await expect(page.locator("#hero-code")).toBeFocused();
    await page.keyboard.type("CAYC");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/engines\?q=CAYC/);
    await expect(page.getByTestId("range")).toHaveText("1–1 of 1");

    // Tab to the result and open it
    const card = page.locator(`a.ecard[href="${ENGINE.cayc}"]`);
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press("Tab");
      if (await card.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(ENGINE.cayc));

    // Tab to Reserve; its focus ring shows
    const reserve = page.getByTestId("reserve-button");
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press("Tab");
      if (await reserve.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(reserve).toBeFocused();
    const ring = await reserve.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);

    // the dialog opens with the focus inside, keeps it inside, and Escape returns it
    await page.keyboard.press("Enter");
    const dlg = page.getByTestId("reserve-dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByLabel("Your name")).toBeFocused();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      expect(await dlg.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(reserve).toBeFocused();

    // reserve with the keyboard alone
    await page.keyboard.press("Enter");
    await expect(dlg.getByLabel("Your name")).toBeFocused();
    await page.keyboard.type(VALID.name);
    await page.keyboard.press("Tab");
    await page.keyboard.type(VALID.email);
    await page.keyboard.press("Tab");
    await page.keyboard.type(VALID.phone);
    await page.keyboard.press("Tab");
    await expect(dlg.getByLabel("Delivery country")).toBeFocused();
    await dlg.getByLabel("Delivery country").selectOption("SK"); // a select takes its choice from the keyboard as well
    await page.keyboard.press("Tab");
    await expect(dlg.getByLabel("VIN of your car")).toBeFocused();
    await page.keyboard.type(VALID.vin);
    await page.keyboard.press("Enter");
    await expect(dlg.getByRole("heading", { name: /Reserved until/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("reserved-mine")).toBeVisible();
  });
});

test.describe("8. Phone: price and Reserve stay at the foot", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("a sticky bar holds the price and Reserve at 375 px", async ({ page }) => {
    await page.goto(ENGINE.b58);
    const bar = page.getByTestId("buybar");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("€6,890");
    await expect(bar.getByRole("button", { name: "Reserve" })).toBeVisible();
    const box = (await bar.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(812);
    await page.mouse.wheel(0, 2500);
    await delay(300);
    await expect(bar).toBeInViewport();
    const box2 = (await bar.boundingBox())!;
    expect(Math.round(box2.y + box2.height)).toBe(812);
    await bar.getByRole("button", { name: "Reserve" }).click();
    await expect(page.getByTestId("reserve-dialog")).toBeVisible();
  });

  test("no sideways scroll on the main pages at 375 px", async ({ page }) => {
    for (const path of ["/", "/engines", ENGINE.b58, "/grades", "/delivery", "/sourcing", "/trade-account", "/contact"]) {
      await page.goto(path);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Forms, empty state, SEO", () => {
  test("no match shows the empty state with the sourcing request", async ({ page }) => {
    await page.goto("/engines?q=ZZZ999");
    const empty = page.getByTestId("stock-empty");
    await expect(empty).toContainText("No engine matches these filters");
    await expect(empty.getByRole("link", { name: "Request an engine search" })).toHaveAttribute("href", "/sourcing?code=ZZZ999");
  });

  test("the sourcing form checks inline and confirms after the send", async ({ page }) => {
    await page.goto("/sourcing?code=ZZZ999");
    const form = page.getByTestId("sourcing-form");
    await expect(form.getByLabel("Engine code or VIN")).toHaveValue("ZZZ999");
    await form.getByRole("button", { name: "Request an engine search" }).click();
    await expect(form.getByText("Write your name, at least two letters.")).toBeVisible();
    await expect(form.getByText("Write the make, model and year of your car.")).toBeVisible();
    await form.getByLabel("Your name").fill("Peter Horvat");
    await form.getByLabel("Email").fill("peter@garage.example");
    await form.getByLabel("Your car").fill("Skoda Octavia III 2016");
    await form.getByRole("button", { name: "Request an engine search" }).click();
    await expect(page.getByTestId("form-done")).toContainText("Your engine search request is in");
  });

  test("the trade account form checks the VAT ID and confirms", async ({ page }) => {
    await page.goto("/trade-account");
    const form = page.getByTestId("trade-form");
    await form.getByLabel("Company name").fill("Autoservis Horvat");
    await form.getByLabel("EU VAT ID").fill("12345");
    await form.getByLabel("Your name").fill("Peter Horvat");
    await form.getByLabel("Work email").fill("peter@garage.example");
    await form.getByLabel("Phone").fill("+421 900 123 456");
    await form.getByLabel("Engines a month").selectOption("6-20");
    await form.getByRole("button", { name: "Open a trade account" }).click();
    await expect(form.getByText(/VAT ID with its country prefix/)).toBeVisible();
    await form.getByLabel("EU VAT ID").fill("SK2020123456");
    await form.getByRole("button", { name: "Open a trade account" }).click();
    await expect(page.getByTestId("form-done")).toContainText("Your trade account application is in");
  });

  test("engine pages carry Product JSON-LD, a canonical slug and Open Graph", async ({ page, request }) => {
    await page.goto(ENGINE.b58);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers.price).toBe(6890);
    expect(ld.offers.priceCurrency).toBe("EUR");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/engines\/b58b30b-bmw-3-0-b58-twinpower-turbo-em-0001$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /B58B30B/);

    // an old or wrong slug for the same id lands on the clean URL
    await page.goto("/engines/old-name-em-0001");
    await expect(page).toHaveURL(new RegExp(`${ENGINE.b58}$`));

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/engines/cffb-volkswagen-2-0-tdi-cr-em-0006");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
  });

  test("an unknown page shows the 404 in the site's style", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page is not in stock");
    await expect(page.locator("header.nav")).toBeVisible();
  });

  test("no console errors on the main pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(`${page.url()}: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
    for (const path of ["/", "/engines", ENGINE.b58, ENGINE.cffb, "/grades", "/delivery", "/sourcing", "/trade-account", "/contact", "/legal/privacy"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    expect(errors).toEqual([]);
  });
});
