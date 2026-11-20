import { promises as fs } from "node:fs";
import { E2E_RESERVATIONS } from "../playwright.config";

/** Start every run with no reservations, so each test finds its engine free. */
export default async function globalSetup() {
  await fs.rm(E2E_RESERVATIONS, { force: true });
}
