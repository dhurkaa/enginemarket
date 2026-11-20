import type { Grade } from "@/config/site";

export type Fuel = "diesel" | "petrol";
export type EngineStatus = "available" | "reserved" | "sold";

export interface Check {
  label: string;
  pass: boolean;
  note?: string;
}

export interface Fitment {
  make: string;
  model: string;
  years: string;
}

export interface Engine {
  id: string;
  code: string;
  aliases: string[];
  make: string;
  family: string;
  fuel: Fuel;
  displacementCc: number;
  powerKw: number;
  mileageKm: number;
  grade: Grade;
  priceEur: number;
  compressionBar: number[];
  specCompressionBar: { min: number; nominal: number };
  checks: Check[];
  donor: { make: string; model: string; year: number; vinLast6: string };
  mileageProof: string;
  included: string[];
  fits: Fitment[];
  photos: string[];
  photoAlt?: string[];
  status: EngineStatus;
}

/** An engine as the pages see it: stock data plus the live reservation state. */
export interface EngineView extends Engine {
  slug: string;
  reservedUntil: string | null;
}

export interface StockQuery {
  q?: string;
  make?: string;
  model?: string;
  year?: string;
  fuel?: Fuel | "";
  grade?: Grade[];
  priceMin?: number;
  priceMax?: number;
  kmMax?: number;
  sort?: SortKey;
  page?: number;
}

export type SortKey = "relevance" | "price-asc" | "price-desc" | "km-asc" | "grade";

export interface StockPage {
  items: EngineView[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
